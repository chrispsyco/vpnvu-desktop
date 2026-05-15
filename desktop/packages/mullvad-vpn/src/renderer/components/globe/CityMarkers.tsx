import { useMemo } from 'react';
import * as THREE from 'three';

import { CITIES } from '../../lib/globe/cities';

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface Props {
  radius?: number;
}

export function CityMarkers({ radius = 1.62 }: Props) {
  const positions = useMemo(
    () => CITIES.map((c) => latLngToVec3(c.lat, c.lng, radius)),
    [radius],
  );

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#5BC8DA" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
