import styled from 'styled-components';

import { Spinner } from '../../../lib/components';
import { FlexColumn } from '../../../lib/components/flex-column';
import { View } from '../../../lib/components/view';
import { useSelector } from '../../../redux/store';
import { AppMainHeader } from '../../app-main-header';
import { GlobeBackgroundLazy } from '../../globe/GlobeBackgroundLazy';
import NotificationArea from '../../NotificationArea';
import { ConnectionPanel } from './components';

const StyledContent = styled(FlexColumn)`
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

const StyledNotificationArea = styled(NotificationArea)`
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
  const connection = useSelector((state) => state.connection);

  const showSpinner =
    connection.status.state === 'connecting' || connection.status.state === 'disconnecting';

  return (
    <View>
      <AppMainHeader size="basedOnLoginStatus" variant="basedOnConnectionStatus">
        <AppMainHeader.AccountButton />
        <AppMainHeader.SettingsButton />
      </AppMainHeader>
      <StyledContent flexGrow={1}>
        <GlobeBackgroundLazy />
        <StyledMapOverlay flexGrow={1}>
          <StyledNotificationArea />
          <StyledMain>
            <SpinnerSlot>{showSpinner ? <Spinner size="big" /> : null}</SpinnerSlot>
            <ConnectionPanel />
          </StyledMain>
        </StyledMapOverlay>
      </StyledContent>
    </View>
  );
}
