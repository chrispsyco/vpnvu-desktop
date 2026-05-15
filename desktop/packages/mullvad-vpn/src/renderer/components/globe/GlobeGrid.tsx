import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';

interface Props {
  radius?: number;
  opacity?: number;
  latStep?: number;
  lngStep?: number;
  segments?: number;
}

/**
 * Classic latitude / longitude grid — gives the globe a "globe-y" look across
 * its entire surface (covers the empty oceans where no country borders live).
 */
function buildGrid(
  radius: number,
  latStep: number,
  lngStep: number,
  segments: number,
): THREE.BufferGeometry {
  const positions: number[] = [];

  // Parallels (latitude rings)
  for (let lat = -60; lat <= 60; lat += latStep) {
    const phi = (90 - lat) * (Math.PI / 180);
    const ringRadius = radius * Math.sin(phi);
    const y = radius * Math.cos(phi);
    for (let i = 0; i < segments; i++) {
      const t1 = (i / segments) * Math.PI * 2;
      const t2 = ((i + 1) / segments) * Math.PI * 2;
      positions.push(
        -ringRadius * Math.cos(t1),
        y,
        ringRadius * Math.sin(t1),
        -ringRadius * Math.cos(t2),
        y,
        ringRadius * Math.sin(t2),
      );
    }
  }

  // Meridians (longitude rings)
  for (let lng = 0; lng < 360; lng += lngStep) {
    const theta = (lng + 180) * (Math.PI / 180);
    for (let i = 0; i < segments; i++) {
      const phi1 = (i / segments) * Math.PI;
      const phi2 = ((i + 1) / segments) * Math.PI;
      positions.push(
        -radius * Math.sin(phi1) * Math.cos(theta),
        radius * Math.cos(phi1),
        radius * Math.sin(phi1) * Math.sin(theta),
        -radius * Math.sin(phi2) * Math.cos(theta),
        radius * Math.cos(phi2),
        radius * Math.sin(phi2) * Math.sin(theta),
      );
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}

export function GlobeGrid({
  radius = 1.6,
  opacity = 0.22,
  latStep = 15,
  lngStep = 15,
  segments = 64,
}: Props) {
  const ref = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(
    () => buildGrid(radius, latStep, lngStep, segments),
    [radius, latStep, lngStep, segments],
  );

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#0E4850'),
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [opacity],
  );

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}
