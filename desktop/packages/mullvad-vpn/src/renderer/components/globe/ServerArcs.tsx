import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getScrollProgress } from '../../lib/globe/scroll-progress';
import { getServerById, VPNVU_SERVERS } from '../../lib/globe/vpnvu-servers';

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
 * Server-to-server arcs, balanced across continents. Indexed by stable server
 * IDs from `vpnvu-servers.ts` so reordering the canonical list does not
 * silently rewire which arcs render.
 */
const ARC_PAIRS: Array<[string, string]> = [
  ['br-sp-1', 'us-nyc-1'], // SP → NY
  ['br-sp-1', 'gb-lon-1'], // SP → London
  ['us-nyc-1', 'gb-lon-1'], // NY → London
  ['us-nyc-1', 'ca-yyz-1'], // NY → Toronto
  ['us-lax-1', 'jp-tyo-1'], // LA → Tokyo
  ['gb-lon-1', 'nl-ams-1'], // London → Amsterdam
  ['nl-ams-1', 'de-fra-1'], // Amsterdam → Frankfurt
  ['de-fra-1', 'se-sto-1'], // Frankfurt → Stockholm
  ['de-fra-1', 'ch-zrh-1'], // Frankfurt → Zurich
  ['jp-tyo-1', 'sg-sin-1'], // Tokyo → Singapore
  ['br-rj-1', 'br-sp-1'], // RJ → SP (regional)
  ['ca-yyz-1', 'gb-lon-1'], // Toronto → London
];

interface ArcData {
  geometry: THREE.BufferGeometry;
}

function buildArcs(radius: number): ArcData[] {
  return ARC_PAIRS.flatMap(([aId, bId]) => {
    const a = getServerById(aId);
    const b = getServerById(bId);
    if (!a || !b) return [];

    const start = latLngToVec3(a.lat, a.lng, radius);
    const end = latLngToVec3(b.lat, b.lng, radius);

    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);
    const liftFactor = 0.4 + dist * 0.25;
    const control = mid.normalize().multiplyScalar(radius + liftFactor);

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(48);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return [{ geometry }];
  });
}

export function ServerArcs({ radius = 1.62 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const arcs = useMemo(() => buildArcs(radius), [radius]);
  void VPNVU_SERVERS; // ensure module-level import retained for tree-shaking signal

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
    const total = arcs.length;
    for (let i = 0; i < total; i++) {
      const start = (i / total) * 0.7;
      const end = start + 0.18;
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
