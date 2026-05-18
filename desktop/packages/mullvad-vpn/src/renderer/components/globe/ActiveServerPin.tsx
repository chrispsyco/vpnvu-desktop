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
  /** Surface radius the pin should sit on. Defaults to slightly above the globe. */
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

function colorFor(state: ActiveServerPinState): THREE.Color {
  const [r, g, b] = COLOR_BY_STATE[state];
  return new THREE.Color().setRGB(r, g, b);
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

const DOT_VERTEX = /* glsl */ `
  uniform float uScale;     // 1.0 = static, animated 0.85..1.15 when pulsing
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.02, 0.15, viewN.z);
    // 28px keeps the active pin clearly larger than VolcanoMarkers (20px)
    // so it reads as the focal point, while leaving enough air below it
    // for the ConnectionPanel overlay.
    gl_PointSize = 28.0 * uScale;
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

const RING_VERTEX = /* glsl */ `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.02, 0.15, viewN.z);
    // 48px so the expanding "ping" stays inside the visible globe area and
    // doesn't slip behind the ConnectionPanel overlay.
    gl_PointSize = 48.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPulse;     // 0..1 ring progress within the period
  uniform float uOpacity;   // base opacity multiplier
  varying float vFront;
  void main() {
    if (vFront < 0.01) discard;
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    // Hollow ring whose radius rides on uPulse; fades as it expands.
    float r = sqrt(r2);
    float thickness = 0.09;
    float ringEdge = mix(0.35, 0.98, uPulse);
    float inner = smoothstep(ringEdge - thickness, ringEdge, r);
    float outer = 1.0 - smoothstep(ringEdge, ringEdge + thickness, r);
    float band = inner * outer;
    float fade = 1.0 - uPulse;
    float a = band * fade * vFront * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

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

  const dotMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: colorFor(connectionState) },
          uScale: { value: 1.0 },
        },
        vertexShader: DOT_VERTEX,
        fragmentShader: DOT_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const ringMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: colorFor(connectionState) },
          uPulse: { value: 0 },
          uOpacity: { value: 0.6 },
        },
        vertexShader: RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Apply colour updates when the connection state changes (no re-mount).
  useEffect(() => {
    const col = colorFor(connectionState);
    (dotMaterial.uniforms.uColor.value as THREE.Color).copy(col);
    (ringMaterial.uniforms.uColor.value as THREE.Color).copy(col);
  }, [connectionState, dotMaterial, ringMaterial]);

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      pointGeometry.dispose();
      dotMaterial.dispose();
      ringMaterial.dispose();
    };
  }, [pointGeometry, dotMaterial, ringMaterial]);

  useFrame((threeState) => {
    if (groupRef.current) groupRef.current.rotation.y = getGlobeRotationY();
    const t = threeState.clock.getElapsedTime();

    if (connectionState === 'connecting' || connectionState === 'error') {
      // States that signal something "in flight" or "wrong" — breathe the
      // dot itself, no expanding ring. Slow + subtle so it reads as a calm
      // status indicator instead of a flashing warning.
      const period = 2.0;
      const phase = (t % period) / period;
      const breathe = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
      dotMaterial.uniforms.uScale.value = 0.85 + breathe * 0.30;
      ringMaterial.uniforms.uPulse.value = 0;
      ringMaterial.uniforms.uOpacity.value = 0;
    } else {
      // Settled states (connected / disconnected / disconnecting / idle) —
      // static dot at the selected server with an expanding "ping" ring in
      // the same colour. Ring opacity stays low so the dot core keeps the
      // same cyan tone as the surrounding inactive pins where they overlap.
      dotMaterial.uniforms.uScale.value = 1.0;
      const period = 2.4;
      ringMaterial.uniforms.uPulse.value = (t % period) / period;
      ringMaterial.uniforms.uOpacity.value = 0.45;
    }
  });

  if (!hasPosition) return null;

  return (
    <group ref={groupRef}>
      <points geometry={pointGeometry} material={ringMaterial} renderOrder={4} />
      <points geometry={pointGeometry} material={dotMaterial} renderOrder={5} />
    </group>
  );
}
