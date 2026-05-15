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

const COLOR_BY_STATE: Record<ActiveServerPinState, string> = {
  connected: '#44AD4D',
  connecting: '#E8AC2E',
  disconnected: '#E34349',
  disconnecting: '#E34349',
  error: '#E34349',
  idle: '#5BC8DA',
};

/** Pulse period in seconds. Connecting pulses noticeably faster. */
const PULSE_PERIOD_BY_STATE: Record<ActiveServerPinState, number> = {
  connected: 2.4,
  connecting: 1.0,
  disconnected: 2.4,
  disconnecting: 2.4,
  error: 2.4,
  idle: 2.4,
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
    vFront = smoothstep(-0.05, 0.25, viewN.z);
    gl_PointSize = 12.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DOT_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vFront;
  void main() {
    if (vFront < 0.01) discard;
    // Centred disk with soft halo.
    vec2 cxy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    float core = smoothstep(0.45, 0.0, r2);
    float halo = smoothstep(1.0, 0.55, r2) * 0.55;
    float a = clamp(core + halo, 0.0, 1.0) * vFront;
    gl_FragColor = vec4(uColor, a);
  }
`;

const RING_VERTEX = /* glsl */ `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.05, 0.2, viewN.z);
    gl_PointSize = 64.0;
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

  const position = useMemo(() => {
    if (!isFinite(lat) || !isFinite(lng)) return null;
    return latLngToVec3(lat, lng, radius);
  }, [lat, lng, radius]);

  // Both ring + dot live as a single GL_POINT at the local origin. The parent
  // <group position={...}> places that origin on the globe surface.
  const pointGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return g;
  }, []);

  const dotMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(COLOR_BY_STATE[connectionState]) } },
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
          uColor: { value: new THREE.Color(COLOR_BY_STATE[connectionState]) },
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
    const col = new THREE.Color(COLOR_BY_STATE[connectionState]);
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
    const period = PULSE_PERIOD_BY_STATE[connectionState];
    const t = threeState.clock.getElapsedTime();
    const pulse = (t % period) / period;
    ringMaterial.uniforms.uPulse.value = pulse;
  });

  if (!position) return null;

  return (
    <group ref={groupRef}>
      <group position={position}>
        <points geometry={pointGeometry} material={ringMaterial} renderOrder={4} />
        <points geometry={pointGeometry} material={dotMaterial} renderOrder={5} />
      </group>
    </group>
  );
}
