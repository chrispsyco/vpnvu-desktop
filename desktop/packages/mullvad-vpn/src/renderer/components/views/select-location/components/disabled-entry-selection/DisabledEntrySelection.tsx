import { useCallback } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { strings } from '../../../../../../shared/constants';
import { messages } from '../../../../../../shared/gettext';
import { RoutePath } from '../../../../../../shared/routes';
import { Button, LabelTinySemiBold } from '../../../../../lib/components';
import { FlexColumn } from '../../../../../lib/components/flex-column';
import { useHistory } from '../../../../../lib/history';

// VPN.vu · "entry server is overridden" notice. Rendered when DAITA forces
// the multihop entry to a specific server. Wrapped in a cyan-alpha surface
// card so the message reads as a system-level explanation instead of a
// loose paragraph stuck above the list.
const StyledNoticeCard = styled.div`
  position: relative;
  margin: 0 16px 8px;
  padding: 14px 16px;
  background: rgba(9, 158, 180, 0.08);
  border: 1px solid rgba(91, 200, 218, 0.18);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    /* A thin cyan rail on the left edge to anchor the eye and signal that
       the card is a callout, not just a paragraph. */
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: rgb(91, 200, 218);
    box-shadow: 0 0 12px rgba(91, 200, 218, 0.6);
  }
`;

const StyledEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(121, 200, 211);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background: currentColor;
    box-shadow: 0 0 6px currentColor;
  }
`;

export function DisabledEntrySelection() {
  const { push } = useHistory();

  const multihop = messages.pgettext('settings-view', 'Multihop');
  const directOnly = messages.gettext('Direct only');

  const navigateToDaitaSettings = useCallback(() => {
    push(RoutePath.daitaSettings);
  }, [push]);

  return (
    <StyledNoticeCard>
      <FlexColumn gap="medium">
        <FlexColumn gap="tiny">
          <StyledEyebrow>
            {
              // TRANSLATORS: Kicker shown above the notice when multihop entry server selection is locked by DAITA.
              messages.pgettext('select-location-view', 'Entry locked')
            }
          </StyledEyebrow>
          <LabelTinySemiBold color="whiteAlpha80">
            {sprintf(
              messages.pgettext(
                'select-location-view',
                'The entry server for %(multihop)s is currently overridden by %(daita)s. To select an entry server, please first enable “%(directOnly)s” or disable "%(daita)s" in the settings.',
              ),
              { daita: strings.daita, multihop, directOnly },
            )}
          </LabelTinySemiBold>
        </FlexColumn>
        <Button onClick={navigateToDaitaSettings}>
          <Button.Text>
            {sprintf(messages.pgettext('select-location-view', 'Open %(daita)s settings'), {
              daita: strings.daita,
            })}
          </Button.Text>
        </Button>
      </FlexColumn>
    </StyledNoticeCard>
  );
}
