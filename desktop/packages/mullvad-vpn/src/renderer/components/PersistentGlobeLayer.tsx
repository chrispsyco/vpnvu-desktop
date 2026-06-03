import { Location } from 'history';
import styled from 'styled-components';

import { LocationState } from '../../shared/ipc-types';
import { RoutePath } from '../../shared/routes';
import { GlobeBackgroundLazy } from './globe/GlobeBackgroundLazy';

/**
 * Routes where the globe background should be visible. Everything else
 * (settings, select-location, etc) gets the standard view background. The
 * globe Canvas itself stays mounted across all routes so we don't pay the
 * WebGL context init cost (black background → globe pop-in → borders pop-in)
 * every time the user pops back to the main view.
 */
const GLOBE_ROUTES: ReadonlySet<string> = new Set<string>([
  RoutePath.main,
  RoutePath.launch,
]);

/**
 * Header height (px) matches `<MainHeader size="2">` — the logged-in variant
 * used by the main view, which is the only place the globe sits under a
 * header. The launch view has no header and gets the full viewport so the
 * globe reads as the ambient background instead of competing with a band.
 */
const HEADER_OFFSET_PX = 80;

const Wrap = styled.div<{ $visible: boolean; $topOffsetPx: number }>`
  position: fixed;
  top: ${({ $topOffsetPx }) => $topOffsetPx}px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  /* Short crossfade so the globe doesn't pop when switching back to main. */
  transition: opacity 160ms ease-out;
  /* PSYCO · the R3F globe is a composited GPU canvas that escapes the #app
     border-radius clip in Chromium (that's why the window's bottom corners
     showed square globe over the rounded #app). clip-path is applied at the
     compositor level and DOES clip the canvas. Bottom corners always sit on
     the window edge; top corners only do on the launch splash ($topOffsetPx
     === 0) — on the main view this layer starts below the header.
     inset() round order = top-left top-right bottom-right bottom-left. */
  clip-path: ${({ $topOffsetPx }) =>
    $topOffsetPx === 0 ? 'inset(0 round 16px)' : 'inset(0 round 0 0 16px 16px)'};
`;

interface Props {
  currentLocation: Location<LocationState>;
}

export function PersistentGlobeLayer({ currentLocation }: Props) {
  const visible = GLOBE_ROUTES.has(currentLocation.pathname);
  const topOffsetPx = currentLocation.pathname === RoutePath.launch ? 0 : HEADER_OFFSET_PX;
  return (
    <Wrap $visible={visible} $topOffsetPx={topOffsetPx} aria-hidden="true">
      <GlobeBackgroundLazy />
    </Wrap>
  );
}
