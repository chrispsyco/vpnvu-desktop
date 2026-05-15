import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  radius?: number;
  color?: string;
}

/**
 * Solid sphere that fills the depth buffer so geometry on the far hemisphere
 * (country borders, points, arcs) is hidden behind it. Renders first; everything
 * else has depthTest enabled so it gets occluded automatically.
 */
export function GlobeCore({ radius = 1.59, color = '#0A2128' }: Props) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
      }),
    [color],
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 64, 64), [radius]);

  return <mesh geometry={geometry} material={material} />;
}
