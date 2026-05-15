import { useMemo } from 'react';
import * as THREE from 'three';

const VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    // Soft ozone halo — diffuse falloff so the cyan bleeds into the bg
    // instead of forming a hard ring.
    float dp = dot(vNormal, vec3(0.0, 0.0, 1.0));
    float rim = pow(1.0 - abs(dp), 5.0);
    gl_FragColor = vec4(uColor, rim * 0.85);
  }
`;

interface Props {
  radius?: number;
}

export function Atmosphere({ radius = 1.7 }: Props) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color('#5BC8DA') } },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        side: THREE.BackSide,
        blending: THREE.NormalBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  return (
    <mesh material={material}>
      <sphereGeometry args={[radius, 128, 128]} />
    </mesh>
  );
}
