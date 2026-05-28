import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Distant starfield rendered as a single THREE.Points cloud on a sphere
 * around the globe. Sits behind everything else (large radius + no depth
 * write) so the globe always paints on top.
 *
 * Two passes:
 *   - dim field: many small points, low brightness, gives texture
 *   - hero stars: fewer larger points, brighter, adds eye-catchers
 *
 * Both rotate slowly — about 1/3 the globe pace — so they feel parallax-
 * distant rather than locked to the globe. Seeded RNG so the layout is
 * identical every launch (it's brand atmosphere, not random visual noise).
 */

interface StarsProps {
  /** Outer sphere radius. Should be larger than globe + atmosphere. */
  radius?: number;
  /** Number of dim ambient stars. */
  count?: number;
  /** Number of brighter hero stars. */
  heroCount?: number;
  /** Rotation speed in rad/s for the whole starfield. */
  rotationSpeed?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSpherePoints(count: number, radius: number, seed: number) {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Uniform on sphere via inverse-CDF sampling (no clumping at poles).
    const u = rng();
    const v = rng();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Per-star size variance gives a "depth-of-field" feel without us
    // actually moving any star inward.
    sizes[i] = 0.5 + rng() * 1.6;

    // Subtle tint: most stars cyan-cool to match the brand palette,
    // a few warm yellow-white for variety.
    const warm = rng() < 0.15;
    if (warm) {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.92 + rng() * 0.05;
      colors[i * 3 + 2] = 0.78 + rng() * 0.1;
    } else {
      colors[i * 3] = 0.72 + rng() * 0.12;
      colors[i * 3 + 1] = 0.86 + rng() * 0.1;
      colors[i * 3 + 2] = 0.95 + rng() * 0.05;
    }
  }

  return { positions, sizes, colors };
}

export function Stars({
  radius = 18,
  count = 1100,
  heroCount = 80,
  rotationSpeed = 0.012,
}: StarsProps = {}) {
  const groupRef = useRef<THREE.Group>(null);

  // Build geometry once — the points never move relative to the rotating
  // group, only the group itself spins. useMemo with stable seeds keeps the
  // layout identical across re-renders (and across launches).
  const dim = useMemo(() => buildSpherePoints(count, radius, 0xa53f01), [count, radius]);
  const hero = useMemo(
    () => buildSpherePoints(heroCount, radius * 0.95, 0x57c19d),
    [heroCount, radius],
  );

  const dimGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(dim.positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(dim.sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(dim.colors, 3));
    return g;
  }, [dim]);

  const heroGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(hero.positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(hero.sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(hero.colors, 3));
    return g;
  }, [hero]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.rotation.y += dt * rotationSpeed;
  });

  return (
    <group ref={groupRef}>
      <points geometry={dimGeom}>
        <pointsMaterial
          size={1.4}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points geometry={heroGeom}>
        <pointsMaterial
          size={2.6}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
