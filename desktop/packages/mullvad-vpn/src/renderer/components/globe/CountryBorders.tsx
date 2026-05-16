import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

import { getGlobeRotationY } from '../../lib/globe/globe-rotation';

interface Props {
  radius?: number;
  opacity?: number;
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
 * Push the great-circle interpolation between two lon/lat points so straight
 * MultiLineString segments curve along the sphere instead of cutting through
 * its interior.
 */
function pushArc(
  positions: number[],
  a: [number, number],
  b: [number, number],
  r: number,
  steps = 3,
) {
  const va = latLngToVec3(a[1], a[0], r);
  const vb = latLngToVec3(b[1], b[0], r);
  const angle = va.angleTo(vb);
  if (angle < 1e-4) return;
  const sinA = Math.sin(angle);
  for (let i = 0; i < steps; i++) {
    const t1 = i / steps;
    const t2 = (i + 1) / steps;
    const w1a = Math.sin((1 - t1) * angle) / sinA;
    const w1b = Math.sin(t1 * angle) / sinA;
    const w2a = Math.sin((1 - t2) * angle) / sinA;
    const w2b = Math.sin(t2 * angle) / sinA;
    const p1 = va.clone().multiplyScalar(w1a).addScaledVector(vb, w1b);
    const p2 = va.clone().multiplyScalar(w2a).addScaledVector(vb, w2b);
    positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  }
}

export function CountryBorders({ radius = 1.605, opacity = 0.5 }: Props) {
  const ref = useRef<THREE.LineSegments>(null);
  const [topo, setTopo] = useState<Topology | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('./assets/images/globe/countries-50m.json')
      .then((r) => r.json())
      .then((data: Topology) => {
        if (!cancelled) setTopo(data);
      })
      .catch(() => {
        // Fail silently — globe still renders without borders.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const geometry = useMemo(() => {
    if (!topo) return null;
    const collection = topo.objects.countries as GeometryCollection;
    const fc = feature(topo, collection) as FeatureCollection<Polygon | MultiPolygon>;
    const positions: number[] = [];

    const drawRing = (ring: number[][]) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i] as [number, number];
        const b = ring[i + 1] as [number, number];
        pushArc(positions, a, b, radius);
      }
    };

    for (const feat of fc.features) {
      const geom = feat.geometry;
      if (geom.type === 'Polygon') {
        for (const ring of geom.coordinates) drawRing(ring);
      } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
          for (const ring of poly) drawRing(ring);
        }
      }
    }

    const buf = new THREE.BufferGeometry();
    buf.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return buf;
  }, [topo, radius]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#06181E'),
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [opacity],
  );

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = getGlobeRotationY();
  });

  if (!geometry) return null;

  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}
