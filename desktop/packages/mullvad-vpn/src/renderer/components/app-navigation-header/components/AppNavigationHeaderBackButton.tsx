import { useContext, useMemo } from 'react';

import { messages } from '../../../../shared/gettext';
import { IconButton } from '../../../lib/components';
import { TransitionType, useHistory } from '../../../lib/history';
import { BackActionContext } from '../../keyboard-navigation';

export const AppNavigationHeaderBackButton = () => {
  const history = useHistory();
  // VPN.vu: keep aria-label semantic (Back vs Close) for screen readers but
  // always render the left chevron — a downward arrow for navigation reads as
  // "collapse/expand" to most users and tested confusing.
  const isPushTransition = useMemo(
    () => history.getPopTransition() !== TransitionType.dismiss,
    [history],
  );
  const { parentBackAction } = useContext(BackActionContext);

  if (!parentBackAction) return null;

  const ariaLabel = isPushTransition ? messages.gettext('Back') : messages.gettext('Close');

  return (
    <IconButton variant="secondary" aria-label={ariaLabel} onClick={parentBackAction}>
      <IconButton.Icon icon="chevron-left-circle" />
    </IconButton>
  );
};
