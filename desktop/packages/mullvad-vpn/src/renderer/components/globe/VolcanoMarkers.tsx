import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';
import { VOLCANOES } from '../../lib/globe/volcanoes';

const VERTEX_SHADER = `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.05, 0.25, viewN.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 4.0;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  varying float vFront;
  void main() {
    if (vFront < 0.01) discard;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    float alpha = 1.0 - smoothstep(0.5, 1.0, r2);
    gl_FragColor = vec4(uColor, alpha * vFront * 0.6);
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
    for (const [lat, lng] of VOLCANOES) {
      const p = latLngToVec3(lat, lng, radius);
      positions.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color('#5BC8DA') } },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
