import { useRef } from 'react';
import styled from 'styled-components';

import { FlexColumn } from '../../../lib/components/flex-column';
import { View } from '../../../lib/components/view';
import { useReportGlobeObstacle } from '../../../lib/globe/useReportGlobeObstacle';
import { AppMainHeader } from '../../app-main-header';
import NotificationArea from '../../NotificationArea';
import { ConnectionPanel } from './components';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
`;

const StyledMapOverlay = styled(FlexColumn)`
  position: relative;
  z-index: 1;
  max-height: 100%;
`;

const SpinnerSlot = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const NotificationObstacleWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
`;

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: 100%;
`;

export function MainView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useReportGlobeObstacle(notificationRef, containerRef, 'top');
  useReportGlobeObstacle(panelRef, containerRef, 'bottom');

  return (
    // NOTE: the globe is NOT rendered here — it lives in <PersistentGlobeLayer/>
    // mounted at the router root so the WebGL context survives navigation away
    // from this view. Without that, every pop back from select-location showed
    // a black background → globe pop-in → borders pop-in sequence as R3F had
    // to rebuild the scene from scratch.
    //
    // <View> uses `background-color: darkerBlue50` (semi-transparent) by
    // default so the persistent globe is visible behind this view's content.
    <View>
      <AppMainHeader size="basedOnLoginStatus" variant="basedOnConnectionStatus">
        <AppMainHeader.AccountButton />
        <AppMainHeader.SettingsButton />
      </AppMainHeader>
      <StyledContent ref={containerRef}>
        <StyledMapOverlay flexGrow={1}>
          <NotificationObstacleWrap ref={notificationRef}>
            <NotificationArea />
          </NotificationObstacleWrap>
          <StyledMain>
            {/* Spacer keeps the connection panel anchored at the bottom of
                the view. The connecting/disconnecting state is already
                communicated by the panel's status text and the globe pin
                color, so no spinner is shown here. */}
            <SpinnerSlot />
            <ConnectionPanel ref={panelRef} />
          </StyledMain>
        </StyledMapOverlay>
      </StyledContent>
    </View>
  );
}
