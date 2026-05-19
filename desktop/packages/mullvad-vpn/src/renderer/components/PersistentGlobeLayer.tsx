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
 * used by the main view, which is the only place the globe is visible. The
 * launch view uses size="1" (68px) but lives for only a few hundred ms; an
 * extra 12px of black band there is invisible in practice.
 */
const HEADER_OFFSET_PX = 80;

const Wrap = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: ${HEADER_OFFSET_PX}px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  /* Short crossfade so the globe doesn't pop when switching back to main. */
  transition: opacity 160ms ease-out;
`;

interface Props {
  currentLocation: Location<LocationState>;
}

export function PersistentGlobeLayer({ currentLocation }: Props) {
  const visible = GLOBE_ROUTES.has(currentLocation.pathname);
  return (
    <Wrap $visible={visible} aria-hidden="true">
      <GlobeBackgroundLazy />
    </Wrap>
  );
}
