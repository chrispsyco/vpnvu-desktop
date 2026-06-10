import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';

/**
 * Active server pin.
 *
 * Renders a premium marker for the currently selected VPN server: a glowing
 * inner dot plus an expanding ring that pulses outward and fades, looping
 * indefinitely. The colour shifts based on the live connection state so the
 * pin doubles as a status indicator.
 *
 * Connection state mapping:
 *   - connected   -> green   #44AD4D, slow pulse
 *   - connecting  -> amber   #E8AC2E, fast pulse
 *   - disconnect* -> red     #E34349, slow pulse
 *   - error       -> red     #E34349, slow pulse
 *   - default     -> cyan    #5BC8DA, slow pulse (brand glow)
 *
 * The pin is co-rotated with the rest of the globe via `getGlobeRotationY`
 * and pitched by the parent `<TiltedGlobe>` group in `GlobeScene`.
 */

export type ActiveServerPinState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'disconnecting'
  | 'error'
  | 'idle';

interface ActiveServerPinProps {
  lat: number;
  lng: number;
  /** Live tunnel state from redux. Optional — falls back to `idle` (cyan). */
  connectionState?: ActiveServerPinState;
  /** Surface radius the pin should sit on. Matches VolcanoMarkers (1.625). */
  radius?: number;
}

// Pin palette tuned to the VPN.vu cyan-leaning theme. The Mullvad originals
// (#44AD4D / #E8AC2E / #E34349) read dark and saturated against our pale
// cyan globe — these brighter variants keep semantic meaning (green/amber/
// red) while sitting on the same lightness band as #5BC8DA.
//
// Stored as raw 0..1 RGB triplets (NOT hex strings) so we can push them
// into THREE.Color via setRGB without the sRGB→linear conversion that
// `new THREE.Color('#hex')` applies. That conversion would darken the
// active pin relative to VolcanoMarkers, which uses a hardcoded vec3 of
// the same numbers and so dodges the conversion entirely.
const COLOR_BY_STATE: Record<ActiveServerPinState, [number, number, number]> = {
  connected: [0.486, 0.933, 0.659], // #7CEEA8
  connecting: [1.0, 0.784, 0.380], // #FFC861
  disconnected: [0.357, 0.784, 0.855], // #5BC8DA
  disconnecting: [0.357, 0.784, 0.855], // #5BC8DA
  error: [1.0, 0.478, 0.522], // #FF7A85
  idle: [0.357, 0.784, 0.855], // #5BC8DA
};

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const DOT_VERTEX = /* glsl */ `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.02, 0.15, viewN.z);
    // 32px makes the active pin clearly larger than VolcanoMarkers' 28px so
    // it reads as the focal point. The pulsing scale uniform that lived here
    // before was removed because mutating it via useFrame triggered a driver
    // bug where the dot stopped drawing once the value settled.
    gl_PointSize = 32.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Active pin look mirrors VolcanoMarkers — solid coloured core, thin white
// ring, soft same-colour glow — but the core/glow tint comes from uColor so
// the pin reads as a live status indicator (green/amber/red/cyan). Edges
// follow the canonical smoothstep(edge0 < edge1) form to dodge the ANGLE
// reversed-edge gotcha that bit us earlier.
const DOT_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vFront;
  void main() {
    if (vFront < 0.05) discard;
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r = length(cxy);
    if (r > 1.0) discard;

    vec3 white = vec3(1.0, 1.0, 1.0);

    float aa = fwidth(r) * 1.2;

    float coreR = 0.30;
    float ringR = 0.46;
    float glowR = 0.95;

    float diskCore = 1.0 - smoothstep(coreR - aa, coreR + aa, r);
    float diskRing = 1.0 - smoothstep(ringR - aa, ringR + aa, r);

    float ringMask = max(diskRing - diskCore, 0.0);
    float outsideRing = 1.0 - diskRing;
    float glowMask = (1.0 - smoothstep(ringR, glowR, r)) * outsideRing;

    vec3 color = uColor;
    color = mix(color, white, ringMask);
    color = mix(color, uColor, diskCore);

    float alpha = clamp(diskCore + ringMask + glowMask * 0.55, 0.0, 1.0) * vFront;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * PSYCO · radar ping. Anel que expande a partir do pino e some, em loop —
 * dá o efeito de "radar vivo". É um mesh SEPARADO (não mexe no shader do
 * GL_POINT do dot, que tinha um bug de driver ao animar uniforme via
 * useFrame). Fica dentro do mesmo group → co-rotaciona com o pino e é
 * inclinado pelo <TiltedGlobe> pai, igual ao dot.
 */
function RadarPulse({
  lat,
  lng,
  radius,
  colorRgb,
}: {
  lat: number;
  lng: number;
  radius: number;
  colorRgb: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const { pos, quat, color } = useMemo(() => {
    // +0.004 pra flutuar logo acima da superfície e evitar z-fighting com o globo.
    const p = latLngToVec3(lat, lng, radius + 0.004);
    // orienta o anel (plano XY, normal +Z) tangente à superfície → normal = posição.
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      p.clone().normalize(),
    );
    const c = new THREE.Color().setRGB(colorRgb[0], colorRgb[1], colorRgb[2]);
    return { pos: p, quat: q, color: c };
  }, [lat, lng, radius, colorRgb]);

  useFrame(({ clock }) => {
    const PERIOD = 2.2; // s por ping
    const t = (clock.elapsedTime % PERIOD) / PERIOD; // 0..1
    if (meshRef.current) meshRef.current.scale.setScalar(0.025 + t * 0.21);
    // some conforme expande (ease-out quadrático), pico de opacidade no começo.
    if (matRef.current) matRef.current.opacity = (1 - t) * (1 - t) * 0.8;
  });

  return (
    <mesh ref={meshRef} position={pos} quaternion={quat} renderOrder={4} frustumCulled={false}>
      <ringGeometry args={[0.82, 1.0, 48]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.8}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ActiveServerPin({
  lat,
  lng,
  connectionState = 'idle',
  radius = 1.625,
}: ActiveServerPinProps) {
  const groupRef = useRef<THREE.Group>(null);

  const hasPosition = isFinite(lat) && isFinite(lng);

  // The single GL_POINT vertex lives at latLngToVec3(lat, lng, radius) in the
  // group's local space — NOT at (0,0,0). The shader uses normalize(position)
  // to derive the surface normal for the front-facing test, and normalising
  // (0,0,0) returns NaN, which propagates into vFront → alpha and silently
  // kills the pin in most GL drivers. Storing the real surface position keeps
  // the normal well-defined and matches what VolcanoMarkers already does.
  const pointGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = hasPosition ? latLngToVec3(lat, lng, radius) : new THREE.Vector3(0, 0, radius);
    g.setAttribute('position', new THREE.Float32BufferAttribute([p.x, p.y, p.z], 3));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-write the vertex position whenever the selected server moves so the
  // pin follows the redux-driven lat/lng without re-mounting the geometry.
  useEffect(() => {
    if (!hasPosition) return;
    const p = latLngToVec3(lat, lng, radius);
    const attr = pointGeometry.getAttribute('position') as THREE.BufferAttribute;
    attr.setXYZ(0, p.x, p.y, p.z);
    attr.needsUpdate = true;
  }, [lat, lng, radius, hasPosition, pointGeometry]);

  // Material is rebuilt whenever connectionState changes. We do NOT mutate
  // uniform values via copy() across the connecting -> connected transition:
  // a recent driver/Three.js regression caused the pin to stop drawing the
  // moment the uScale uniform stopped animating (the dot became invisible
  // even with depthTest off and renderOrder >GlobeCore's). Rebuilding the
  // ShaderMaterial per-state forces a clean uniform upload each transition
  // and matches VolcanoMarkers' single-material model that works reliably.
  const material = useMemo(() => {
    const [r, g, b] = COLOR_BY_STATE[connectionState];
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color().setRGB(r, g, b) },
      },
      vertexShader: DOT_VERTEX,
      fragmentShader: DOT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [connectionState]);

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      pointGeometry.dispose();
    };
  }, [pointGeometry]);

  // Dispose old material when connectionState swaps the reference.
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Co-rotate with the globe. Same pattern as VolcanoMarkers.
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y = getGlobeRotationY();
  });

  if (!hasPosition) return null;

  return (
    <group ref={groupRef}>
      {/* PSYCO · radar ping ao redor do pino · SÓ quando conectado (verde) ·
          o pino laranja (conectando) não pulsa. */}
      {connectionState === 'connected' && (
        <RadarPulse lat={lat} lng={lng} radius={radius} colorRgb={COLOR_BY_STATE[connectionState]} />
      )}
      {/*
        frustumCulled=false is required: BufferGeometry's auto-computed
        boundingSphere for a single-vertex geometry has radius 0, so Three.js
        culls the points object whenever the camera animation puts the vertex
        within rounding-error of the frustum edge. That cull lasts forever
        because the bounding sphere never updates — the result is the active
        pin vanishing the moment the focus animation parks, even though the
        vertex is clearly inside the visible globe area. Inactive markers in
        VolcanoMarkers dodge this because their geometry has 11 vertices, so
        the bounding sphere is big enough to never get culled accidentally.
      */}
      <points
        geometry={pointGeometry}
        material={material}
        renderOrder={5}
        frustumCulled={false}
      />
    </group>
  );
}
