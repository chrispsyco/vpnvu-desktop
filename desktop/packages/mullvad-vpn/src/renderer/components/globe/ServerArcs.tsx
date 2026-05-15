import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { CITIES, type City } from '../../lib/globe/cities';
import { getScrollProgress } from '../../lib/globe/scroll-progress';

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

/**
 * Pre-pick deterministic pairs that look balanced around the globe.
 * Indexes refer to entries in CITIES — adjust if the cities array is reordered.
 */
const ARC_PAIRS: Array<[number, number]> = [
  [0, 2], // SP → NY
  [0, 5], // SP → London
  [2, 5], // NY → London
  [2, 16], // NY → Toronto
  [3, 12], // LA → Tokyo
  [4, 17], // Miami → Mexico City
  [5, 6], // London → Amsterdam
  [6, 7], // Amsterdam → Frankfurt
  [7, 9], // Frankfurt → Paris
  [8, 6], // Madrid → Amsterdam
  [12, 13], // Tokyo → Singapore
  [13, 15], // Singapore → Sydney
  [14, 12], // Hong Kong → Tokyo
  [18, 0], // Buenos Aires → SP
  [19, 5], // Johannesburg → London
];

interface ArcData {
  curve: THREE.QuadraticBezierCurve3;
  geometry: THREE.BufferGeometry;
}

function buildArcs(radius: number): ArcData[] {
  return ARC_PAIRS.map(([a, b]) => {
    const ca: City = CITIES[a]!;
    const cb: City = CITIES[b]!;
    const start = latLngToVec3(ca.lat, ca.lng, radius);
    const end = latLngToVec3(cb.lat, cb.lng, radius);

    // Control point: midpoint pushed outward by arc-height factor
    // Greater distance ⇒ taller arc.
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);
    const liftFactor = 0.4 + dist * 0.25;
    const control = mid.normalize().multiplyScalar(radius + liftFactor);

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(48);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return { curve, geometry };
  });
}

export function ServerArcs({ radius = 1.62 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const arcs = useMemo(() => buildArcs(radius), [radius]);

  // One material per arc so we can fade each independently
  const materials = useMemo(
    () =>
      arcs.map(
        () =>
          new THREE.LineBasicMaterial({
            color: new THREE.Color('#5BC8DA'),
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [arcs],
  );

  useFrame(() => {
    const progress = getScrollProgress();
    // Stagger the arc reveal: each arc's threshold is its index / total
    const total = arcs.length;
    for (let i = 0; i < total; i++) {
      const start = (i / total) * 0.7; // first arc starts at 0%, last at 70%
      const end = start + 0.18; // each arc fades in over 18% of scroll
      const t = THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1);
      const m = materials[i];
      if (m) m.opacity = t * 0.85;
    }
  });

  return (
    <group ref={groupRef}>
      {arcs.map((arc, i) => (
        <line key={i}>
          <primitive attach="geometry" object={arc.geometry} />
          <primitive attach="material" object={materials[i]!} />
        </line>
      ))}
    </group>
  );
}
