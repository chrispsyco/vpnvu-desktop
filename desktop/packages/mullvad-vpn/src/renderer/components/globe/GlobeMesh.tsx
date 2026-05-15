import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';

const VERTEX_SHADER = `
  uniform sampler2D uMask;
  varying vec3 vNormal;
  varying float vLand;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vLand = texture2D(uMask, uv).r;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 1.0 + vLand * 2.6;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uBrand;
  uniform vec3 uBrandGlow;
  varying vec3 vNormal;
  varying float vLand;
  void main() {
    // Drop ocean points entirely — only landmasses light up
    if (vLand < 0.45) discard;

    // Round point shape with smooth edge
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    float alpha = 1.0 - smoothstep(0.55, 1.0, r2);

    vec3 color = mix(uBrand, uBrandGlow, vLand);
    float fresnel = pow(1.0 - abs(vNormal.z), 2.0);
    color += uBrandGlow * fresnel * 0.35;

    // Fade points on the back hemisphere so they don't bleed through
    float front = smoothstep(-0.2, 0.4, vNormal.z);

    gl_FragColor = vec4(color, alpha * front * 0.6);
  }
`;

interface Props {
  radius?: number;
  detail?: number;
}

export function GlobeMesh({ radius = 1.6, detail = 6 }: Props) {
  const meshRef = useRef<THREE.Points>(null);
  const mask = useLoader(THREE.TextureLoader, '/assets/images/globe/continents-mask.png');

  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(radius, detail),
    [radius, detail],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMask: { value: mask },
          uBrand: { value: new THREE.Color('#099EB4') },
          uBrandGlow: { value: new THREE.Color('#5BC8DA') },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [mask],
  );

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y = getGlobeRotationY();
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}
