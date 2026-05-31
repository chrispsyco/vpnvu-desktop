import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const GLOBE_OFFSET_Y = -0.55;

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
import { Stars } from './Stars';
import { VolcanoMarkers } from './VolcanoMarkers';

/**
 * Tilt wrapper. Every globe layer drives its own `rotation.y` from the shared
 * rotation state, so we use a wrapping group to apply the pitch (rotation.x).
 * That way GlobeCore (which has no useFrame) also tilts correctly.
 */
function TiltedGlobe({
  children,
  extraTiltX = 0,
}: {
  children: React.ReactNode;
  /** Tilt extra adicionado ao pitch dinâmico. Usado no mobile pra rotacionar
   *  o globo de tal forma que pins em latitudes sul (e.g. São Paulo) subam
   *  pro centro visual sem precisar mover o globo no canvas. Em radianos. */
  extraTiltX?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.x = getGlobeRotationX() + extraTiltX;
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
function CameraZoomController({
  baseZ,
  staticZoomBias = 1.0,
}: {
  baseZ: number;
  /** Multiplicador estático adicional no targetZ · valores < 1 aproximam a
   *  câmera (zoom-in). Usado pra fazer o globo crescer no mobile quando há
   *  uma location ativa selecionada. */
  staticZoomBias?: number;
}) {
  const { camera } = useThree();
  // Track the rendered z so a re-mount with a different baseZ doesn't snap.
  const renderedZ = useRef(baseZ);
  // PSYCO · interpola o próprio staticZoomBias num useRef pra suavizar a
  // transição idle (1.35) → connecting/connected (0.68). Sem isto, a mudança
  // abrupta do bias combinada com a focus animation (zoom-out → zoom-in)
  // produzia um "salto" perceptível quando o usuário clicava pra conectar.
  // Time constant ~400ms (k=2.5) · mais lento que a câmera (k=18) pra a
  // transição do bias ser quase imperceptível, deixando a focus animation
  // fazer o show.
  const renderedBias = useRef(staticZoomBias);
  useFrame((_, delta) => {
    const focus = peekFocus();
    const dt = Math.min(delta, 0.05);

    const biasK = 1 - Math.exp(-dt * 2.5);
    renderedBias.current = renderedBias.current + (staticZoomBias - renderedBias.current) * biasK;

    const targetZ = baseZ * focus.zoom * renderedBias.current;
    // Critically-damped follow: ~50ms time constant. Smooths over the per-
    // frame zoom changes without lagging visibly behind the animation.
    const k = 1 - Math.exp(-dt * 18);
    renderedZ.current = renderedZ.current + (targetZ - renderedZ.current) * k;
    camera.position.z = renderedZ.current;
  });
  return null;
}

/**
 * Aligns the camera's vertical position with the globe's vertical offset so
 * the camera looks straight at the globe's centre instead of angling down at
 * it. Without this, the canvas centre sits above the globe centre and the
 * scene reads as "looking up from below" — country shapes lean back and the
 * upper hemisphere dominates the frame.
 *
 * Pairs with the `<group position={[0, GLOBE_OFFSET_Y, 0]}>` wrapper around
 * the globe content below.
 */
function CameraAlign({ offsetY }: { offsetY: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.y = offsetY;
    camera.lookAt(0, offsetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, offsetY]);
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
  /**
   * Override pro `GLOBE_OFFSET_Y` · desloca globo E câmera juntos pra alinhar
   * o foco do globo no centro do espaço VISÍVEL (entre header e topo do card).
   */
  globeOffsetYOverride?: number;
  /**
   * Fator de tilt X extra proporcional à latitude do pin focado · move pins
   * em latitudes sul/norte pro centro visual do globo sem precisar mover o
   * globo no canvas. Valor sugerido pra mobile: 0.5 (sin(lat) * 0.5 radianos).
   * Default 0 · desktop fica como antes.
   */
  pinTiltFactor?: number;
}

export function GlobeScene({
  activeLat,
  activeLng,
  connectionState,
  globeOffsetYOverride,
  pinTiltFactor = 0,
}: GlobeSceneProps = {}) {
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

  // Offset Y aplicado a TANTO globo QUANTO câmera. CameraAlign segue · globo
  // aparece centralizado no canvas mas deslocado verticalmente. Mobile passa
  // positivo · globo sobe junto com a câmera · foco fica no espaço acima do
  // card · sem deformação de perspectiva e sem cortar nas bordas.
  const globeY = globeOffsetYOverride ?? GLOBE_OFFSET_Y;

  // PSYCO · tilt extra pra subir pin focado pro centro visual sem mover o
  // globo. Default 0 · desktop sem mudança. Mobile passa pinTiltFactor=0.5
  // · pin de SP (lat -23°) ganha ~11° de tilt forward · sobe pro centro.
  const extraTiltX = activeLat != null && pinTiltFactor !== 0
    ? Math.sin((activeLat * Math.PI) / 180) * pinTiltFactor
    : 0;

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, globeY, cameraZ], fov: cameraFov }}
      gl={{ antialias: true, alpha: true }}
      frameloop={hidden ? 'never' : 'always'}
    >
      <ambientLight intensity={0.4} />
      {/* Starfield · sits at world-origin (not behind the GLOBE_OFFSET_Y group)
          so it's centred on the camera instead of pinned to the globe. Renders
          before everything else and writes no depth, so the globe always paints
          on top of it. */}
      <Stars />
      <Suspense fallback={null}>
        <GlobeRotator />
        {/* PSYCO · zoom-in perto APENAS quando connectionState != idle
            (connecting / connected · usuário focado em um server). Quando
            idle (mesmo com user location passada) entra em zoom-OUT afastado
            · globo "respira" enquanto não tem tunnel ativo. */}
        <CameraZoomController
          baseZ={cameraZ}
          staticZoomBias={
            hasActiveServer && connectionState !== 'idle' ? 0.68 : 1.35
          }
        />
        <CameraAlign offsetY={globeY} />
        {/* Vertical offset slides the whole globe down so the visible centre
            lines up with the middle of the area between header and connect
            card (not with the canvas centre, which sits a bit too high).
            CameraAlign above tilts the camera to match, so the perspective
            stays straight-on rather than reading as "looking up from below". */}
        <group position={[0, globeY, 0]}>
          <Atmosphere />
          <TiltedGlobe extraTiltX={extraTiltX}>
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
