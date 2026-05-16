import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';
import { VPNVU_SERVERS } from '../../lib/globe/vpnvu-servers';

const VERTEX_SHADER = `
  uniform float uTime;
  varying float vFront;
  varying float vPulse;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.2, 0.15, viewN.z);
    // Pulse 0..1 with ~2.4s period, eased.
    vPulse = 0.5 + 0.5 * sin(uTime * 2.6);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 14.0 + vPulse * 6.0;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  varying float vFront;
  varying float vPulse;
  void main() {
    if (vFront < 0.01) discard;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.35, r2);
    float halo = 1.0 - smoothstep(0.35, 1.0, r2);
    // Halo intensity follows the pulse, core stays bright.
    float alpha = clamp(core + halo * (0.30 + vPulse * 0.45), 0.0, 1.0);
    gl_FragColor = vec4(uColor, alpha * vFront);
  }
`;

interface Props {
  radius?: number;
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

export function VolcanoMarkers({ radius = 1.62 }: Props) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const s of VPNVU_SERVERS) {
      const p = latLngToVec3(s.lat, s.lng, radius);
      positions.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#A8F0FF') },
          uTime: { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
    material.uniforms.uTime.value += delta;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
