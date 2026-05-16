import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { getGlobeRotationX } from '../../lib/globe/globe-rotation';
import { usePauseWhenHidden } from '../../lib/globe/usePauseWhenHidden';
import { ActiveServerPin, ActiveServerPinState } from './ActiveServerPin';
import { Atmosphere } from './Atmosphere';
import { CountryBorders } from './CountryBorders';
import { GlobeConnectors } from './GlobeConnectors';
import { GlobeCore } from './GlobeCore';
import { GlobeGrid } from './GlobeGrid';
import { GlobeMesh } from './GlobeMesh';
import { GlobeRotator } from './GlobeRotator';
import { VolcanoMarkers } from './VolcanoMarkers';

/**
 * Tilt wrapper. Every globe layer drives its own `rotation.y` from the shared
 * rotation state, so we use a wrapping group to apply the pitch (rotation.x).
 * That way GlobeCore (which has no useFrame) also tilts correctly.
 */
function TiltedGlobe({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.x = getGlobeRotationX();
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Compute a sensible device pixel ratio for the Electron window.
 *
 * The desktop VPN.vu window is fixed at 405x720, which would otherwise fall
 * into the legacy "narrow" branch and force `dpr=1`. On Retina/HiDPI screens
 * that looks soft. We cap at 1.5 because going above that doubles fragment
 * work for very little visual gain on a viewport this small.
 */
function getAdaptiveDpr(width: number, height: number): [number, number] | number {
  // Very small viewport (e.g. resized down further) — favour perf
  if (width < 400 || height < 400) return 1;

  const native = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  // Clamp to [1, 1.5] for the pinned tray window. Passing a tuple lets R3F
  // auto-adapt within the range based on perf.
  const max = Math.min(1.5, Math.max(1, native));
  return [1, max];
}

/**
 * Detail level for the GlobeMesh point cloud. IcosahedronGeometry vertex
 * count grows as ~20 * 4^detail, so dropping from 5 → 4 is a 4x reduction
 * (12,962 → 2,562 verts) — imperceptible at 405x720.
 */
function getMeshDetail(width: number, height: number): number {
  if (width <= 480 || height <= 800) return 4;
  return 5;
}

interface Viewport {
  width: number;
  height: number;
}

function useViewport(): Viewport {
  const [size, setSize] = useState<Viewport>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 405,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

interface GlobeSceneProps {
  /** Latitude of the currently selected server, in degrees. */
  activeLat?: number;
  /** Longitude of the currently selected server, in degrees. */
  activeLng?: number;
  /** Live tunnel state from redux. Drives pin colour + connection-arc reveal. */
  connectionState?: ActiveServerPinState;
}

export function GlobeScene({ activeLat, activeLng, connectionState }: GlobeSceneProps = {}) {
  const { width, height } = useViewport();
  const hidden = usePauseWhenHidden();

  const hasActiveServer =
    typeof activeLat === 'number' &&
    typeof activeLng === 'number' &&
    isFinite(activeLat) &&
    isFinite(activeLng);

  const isConnecting = connectionState === 'connecting';

  const dpr = getAdaptiveDpr(width, height);
  const meshDetail = getMeshDetail(width, height);

  // Adaptive camera for tall narrow viewports (aspect < 0.7). At 405x720
  // (aspect ~0.56), the default fov=40 / z=5 leaves the globe too small.
  // Pull the camera closer instead of widening the FOV — that keeps the
  // poles from distorting at the screen edges.
  const aspect = width / height;
  const cameraZ = aspect < 0.7 ? 5.5 : 5;
  const cameraFov = aspect < 0.7 ? 38 : 40;

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, cameraZ], fov: cameraFov }}
      gl={{ antialias: true, alpha: true }}
      frameloop={hidden ? 'never' : 'always'}
    >
      <ambientLight intensity={0.4} />
      <Suspense fallback={null}>
        <GlobeRotator />
        <Atmosphere />
        <TiltedGlobe>
          <GlobeCore radius={1.59} />
          <GlobeGrid radius={1.6} opacity={0.13} latStep={30} lngStep={30} />
          <CountryBorders radius={1.605} opacity={0.45} />
          <GlobeMesh detail={meshDetail} />
          <VolcanoMarkers radius={1.64} />
          {hasActiveServer && (
            <ActiveServerPin
              lat={activeLat as number}
              lng={activeLng as number}
              connectionState={connectionState}
            />
          )}
          {/*
            Connection arc: reuses the existing scroll-driven GlobeConnectors
            shimmer, but only mounts during `connecting` so the lines feel like
            an active handshake instead of decor.

            TODO: replace the fixed NODES list inside GlobeConnectors with a
            proper device->server great-circle arc once the user geo lookup is
            wired in. For now we keep the existing layout and gate it on state.
          */}
          {isConnecting && <GlobeConnectors />}
        </TiltedGlobe>
      </Suspense>
    </Canvas>
  );
}
