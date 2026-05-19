import styled from 'styled-components';

import { ISplitTunnelingApplication } from '../../../../../../shared/application-types';
import { Flex } from '../../../../../lib/components';
import { Container } from '../../../../cell';
import { ApplicationIcon } from '../application-icon';
import { ApplicationLabel } from '../application-label';
import { ApplicationRowContextProvider } from './ApplicationRowContext';
import { AddButton, DeleteButton, RemoveButton } from './components';
import {
  useApplication,
  useShowAddButton,
  useShowDeleteButton,
  useShowRemoveButton,
} from './hooks';

export type ApplicationRowProps = {
  application: ISplitTunnelingApplication;
  onAdd?: (application: ISplitTunnelingApplication) => void;
  onDelete?: (application: ISplitTunnelingApplication) => void;
  onRemove?: (application: ISplitTunnelingApplication) => void;
};

/**
 * VPN.vu · application row card.
 *
 * Each app in the split-tunneling list sits inside a cyan-tinted surface card
 * with a hairline border (matches the Figma `.mv-row` token from
 * `13-split-tunneling-screen.html`). Hover lights the surface up a touch and
 * lifts the border tint so the row reads as actionable.
 */
export const StyledContainer = styled(Container)({
  backgroundColor: 'rgba(10, 33, 40, 0.7)',
  border: '1px solid rgba(91, 200, 218, 0.10)',
  borderRadius: '12px',
  transition:
    'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
  '&:hover': {
    backgroundColor: 'rgba(20, 59, 69, 0.85)',
    borderColor: 'rgba(91, 200, 218, 0.22)',
  },
  '&:hover button': {
    opacity: 1,
  },
});

export function ApplicationRowInner() {
  const application = useApplication();
  const showAddButton = useShowAddButton();
  const showDeleteButton = useShowDeleteButton();
  const showRemoveButton = useShowRemoveButton();

  return (
    <StyledContainer>
      <ApplicationIcon icon={application.icon} />
      <ApplicationLabel>{application.name}</ApplicationLabel>
      <Flex gap="small">
        {showAddButton && <AddButton />}
        {showDeleteButton && <DeleteButton />}
        {showRemoveButton && <RemoveButton />}
      </Flex>
    </StyledContainer>
  );
}

export function ApplicationRow(props: ApplicationRowProps) {
  return (
    <ApplicationRowContextProvider {...props}>
      <ApplicationRowInner />
    </ApplicationRowContextProvider>
  );
}
