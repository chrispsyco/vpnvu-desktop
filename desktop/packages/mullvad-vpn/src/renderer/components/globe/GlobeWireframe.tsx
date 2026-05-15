import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  radius?: number;
  detail?: number;
  opacity?: number;
}

/**
 * Triangulated wireframe over the globe surface — sells the "plexus / low-poly
 * earth" look without overpowering the continent points.
 */
export function GlobeWireframe({ radius = 1.6, detail = 4, opacity = 0.18 }: Props) {
  const ref = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(radius, detail);
    return new THREE.WireframeGeometry(ico);
  }, [radius, detail]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#5BC8DA'),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [opacity],
  );

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}
