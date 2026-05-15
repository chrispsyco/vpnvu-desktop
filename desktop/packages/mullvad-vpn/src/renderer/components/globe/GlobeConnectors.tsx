import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';
import { getScrollProgress } from '../../lib/globe/scroll-progress';

const NODES: ReadonlyArray<readonly [number, number]> = [
  [40.71, -74.0], // New York
  [51.5, -0.13], // London
  [52.52, 13.4], // Berlin
  [35.68, 139.69], // Tokyo
  [1.35, 103.82], // Singapore
  [-33.87, 151.21], // Sydney
  [-23.55, -46.63], // São Paulo
  [-26.2, 28.04], // Johannesburg
  [25.2, 55.27], // Dubai
  [37.77, -122.42], // San Francisco
];

const SURFACE_R = 1.61;
const TIP_R = 1.95;

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const LINE_VERTEX = `
  attribute float aHemi;
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.25, 0.15, viewN.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uReveal;
  varying float vFront;
  void main() {
    float a = vFront * uReveal;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const DOT_VERTEX = `
  varying float vFront;
  void main() {
    vec3 nrm = normalize(position);
    vec3 viewN = normalize(normalMatrix * nrm);
    vFront = smoothstep(-0.25, 0.15, viewN.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 14.0;
  }
`;

const DOT_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uReveal;
  varying float vFront;
  void main() {
    float a = vFront * uReveal;
    if (a < 0.01) discard;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r2 = dot(cxy, cxy);
    if (r2 > 1.0) discard;
    // Crisp ring with hollow centre.
    float outer = smoothstep(1.0, 0.7, r2);
    float inner = smoothstep(0.35, 0.55, r2);
    float intensity = outer * inner;
    gl_FragColor = vec4(uColor, intensity * a);
  }
`;

export function GlobeConnectors() {
  const ref = useRef<THREE.Group>(null);

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const [lat, lng] of NODES) {
      const inner = latLngToVec3(lat, lng, SURFACE_R);
      const outer = latLngToVec3(lat, lng, TIP_R);
      positions.push(inner.x, inner.y, inner.z, outer.x, outer.y, outer.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  const dotGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const [lat, lng] of NODES) {
      const tip = latLngToVec3(lat, lng, TIP_R);
      positions.push(tip.x, tip.y, tip.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#5BC8DA') },
          uReveal: { value: 0 },
        },
        vertexShader: LINE_VERTEX,
        fragmentShader: LINE_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const dotMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#5BC8DA') },
          uReveal: { value: 0 },
        },
        vertexShader: DOT_VERTEX,
        fragmentShader: DOT_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
    const p = getScrollProgress();
    // Reveal between 75% and 100% of the scroll-driven scale animation.
    const reveal = THREE.MathUtils.smoothstep(p, 0.75, 1.0);
    lineMaterial.uniforms.uReveal.value = reveal;
    dotMaterial.uniforms.uReveal.value = reveal;
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={lineGeometry} material={lineMaterial} />
      <points geometry={dotGeometry} material={dotMaterial} />
    </group>
  );
}
