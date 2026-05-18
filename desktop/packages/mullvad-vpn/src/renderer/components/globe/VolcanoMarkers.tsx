import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';
import { VPNVU_SERVERS } from '../../lib/globe/vpnvu-servers';

/**
 * Server markers rendered on the globe surface for every VPN.vu location
 * EXCEPT the currently active one (which gets the larger ActiveServerPin).
 *
 * Visual matches the mobile figma `.globe-marker`:
 *   • Core cyan dot (#5BC8DA)
 *   • Thin white ring around the core (≈ box-shadow 0 0 0 3px white)
 *   • Soft outer cyan glow
 *
 * Pulsing is reserved for the active pin so the focal point reads first.
 */

const VERTEX_SHADER = /* glsl */ `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.02, 0.15, viewN.z);
    // 28px so every server pin reads at the same size as the active one —
    // the expanding ring on the selected pin is what differentiates it,
    // not the dot dimensions.
    gl_PointSize = 28.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Soft circular pin: solid cyan core, thin white ring, soft cyan glow.
 *
 * Composition uses mutually exclusive masks (instead of summing layers)
 * so the colours never saturate to white where regions overlap.
 * Antialiasing width tracks the screen-space derivative of r so the
 * border stays clean regardless of point size or DPI.
 */
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying float vFront;
  void main() {
    if (vFront < 0.05) discard;
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r = length(cxy);
    if (r > 1.0) discard;

    vec3 cyan  = vec3(0.357, 0.784, 0.855);
    vec3 white = vec3(1.0, 1.0, 1.0);

    float aa = fwidth(r) * 1.2;

    float coreR = 0.30;
    float ringR = 0.46;
    float glowR = 0.95;

    // Filled disks (1 inside, 0 outside, smooth at the edge).
    float diskCore = smoothstep(coreR + aa, coreR - aa, r);
    float diskRing = smoothstep(ringR + aa, ringR - aa, r);

    // Donut for the white ring = ring disk minus core disk.
    float ringMask = max(diskRing - diskCore, 0.0);

    // Glow lives outside the ring: smooth fade from ringR out to glowR.
    float outsideRing = 1.0 - diskRing;
    float glowMask = smoothstep(glowR, ringR, r) * outsideRing;

    // Mutually exclusive cover masks decide which colour wins per pixel.
    float coreCover = diskCore;
    float ringCover = ringMask;
    float glowCover = glowMask;

    vec3 color = cyan;
    color = mix(color, white, ringCover);
    color = mix(color, cyan,  coreCover);

    float alpha = clamp(coreCover + ringCover + glowCover * 0.55, 0.0, 1.0) * vFront;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface Props {
  radius?: number;
  /** Lat of the active server — suppressed to avoid duplicate marker. */
  activeLat?: number;
  /** Lng of the active server — suppressed to avoid duplicate marker. */
  activeLng?: number;
}

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function matchesActive(
  renderLat: number,
  renderLng: number,
  activeLat: number | undefined,
  activeLng: number | undefined,
): boolean {
  if (activeLat === undefined || activeLng === undefined) return false;
  if (!isFinite(activeLat) || !isFinite(activeLng)) return false;
  // Active coords already come display-resolved from GlobeBackgroundLazy, so
  // compare against the same render position rather than the raw daemon
  // lat/lng — otherwise pins with a visual offset (RJ) get rendered twice
  // when they're the active server.
  return Math.abs(renderLat - activeLat) < 0.5 && Math.abs(renderLng - activeLng) < 0.5;
}

export function VolcanoMarkers({ radius = 1.625, activeLat, activeLng }: Props) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const s of VPNVU_SERVERS) {
      const renderLat = s.displayLat ?? s.lat;
      const renderLng = s.displayLng ?? s.lng;
      if (matchesActive(renderLat, renderLng, activeLat, activeLng)) continue;
      const p = latLngToVec3(renderLat, renderLng, radius);
      positions.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [radius, activeLat, activeLng]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
  });

  return <points ref={ref} geometry={geometry} material={material} renderOrder={3} />;
}
