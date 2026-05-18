import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { peekFocus } from '../../lib/globe/globe-focus';
import { getGlobeRotationX } from '../../lib/globe/globe-rotation';
import { usePauseWhenHidden } from '../../lib/globe/usePauseWhenHidden';
import { ActiveServerPin, ActiveServerPinState } from './ActiveServerPin';
import { Atmosphere } from './Atmosphere';
import { CountryBorders } from './CountryBorders';
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
 * Drives `camera.position.z` from the focus timeline so the camera pulls back
 * during the pan phase and returns once the target lands on the meridian.
 *
 * Sits inside the Canvas tree (needs useThree). Lerps toward the target zoom
 * every frame so it stays smooth even when the focus frame snaps to active
 * mid-frame.
 */
function CameraZoomController({ baseZ }: { baseZ: number }) {
  const { camera } = useThree();
  // Track the rendered z so a re-mount with a different baseZ doesn't snap.
  const renderedZ = useRef(baseZ);
  useFrame((_, delta) => {
    const focus = peekFocus();
    const targetZ = baseZ * focus.zoom;
    // Critically-damped follow: ~50ms time constant. Smooths over the per-
    // frame zoom changes without lagging visibly behind the animation.
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 18);
    renderedZ.current = renderedZ.current + (targetZ - renderedZ.current) * k;
    camera.position.z = renderedZ.current;
  });
  return null;
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
        <CameraZoomController baseZ={cameraZ} />
        {/* Vertical offset slides the whole globe down so the visible centre
            lines up with the middle of the area between header and connect
            card (not with the canvas centre, which sits a bit too high). */}
        <group position={[0, -0.55, 0]}>
          <Atmosphere />
          <TiltedGlobe>
            <GlobeCore radius={1.59} />
          <GlobeGrid radius={1.6} opacity={0.13} latStep={30} lngStep={30} />
          <CountryBorders radius={1.605} opacity={0.45} />
            <GlobeMesh detail={meshDetail} />
            <VolcanoMarkers radius={1.625} activeLat={activeLat} activeLng={activeLng} />
            {hasActiveServer && (
              <ActiveServerPin
                lat={activeLat as number}
                lng={activeLng as number}
                connectionState={connectionState}
              />
            )}
          </TiltedGlobe>
        </group>
      </Suspense>
    </Canvas>
  );
}
