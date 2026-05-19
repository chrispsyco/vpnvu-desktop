import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { BlockTrackersSwitch } from '../block-trackers-switch';

export type BlockTrackersSettingProps = Omit<ListItemProps, 'children'>;

const IconBox = styled.span({
  width: 28,
  height: 28,
  borderRadius: 8,
  background: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.16)',
  color: '#5BC8DA',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const LabelWrap = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
});

// Crosshair · trackers as targeting / surveillance reticle.
function TrackersIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

export function BlockTrackersSetting(props: BlockTrackersSettingProps) {
  const descriptionId = React.useId();
  return (
    <ListItem level={1} {...props}>
      <ListItem.Item>
        <BlockTrackersSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <TrackersIcon />
            </IconBox>
            <BlockTrackersSwitch.Label variant="bodySmall">
              {
                // TRANSLATORS: Label for settings that enables tracker blocking.
                messages.pgettext('vpn-settings-view', 'Trackers')
              }
            </BlockTrackersSwitch.Label>
          </LabelWrap>
          <ListItem.Item.ActionGroup>
            <BlockTrackersSwitch.Input />
          </ListItem.Item.ActionGroup>
        </BlockTrackersSwitch>
      </ListItem.Item>
      <ListItem.Footer>
        <ListItem.Footer.Text id={descriptionId}>
          {
            // TRANSLATORS: Inline description for the "Trackers" DNS blocker row.
            messages.pgettext('vpn-settings-view', 'Analytics, fingerprinting, telemetry')
          }
        </ListItem.Footer.Text>
      </ListItem.Footer>
    </ListItem>
  );
}
