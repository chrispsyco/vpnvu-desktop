import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { BlockAdsSwitch } from '../block-ads-switch';

export type BlockAdsSettingProps = Omit<ListItemProps, 'children'>;

/**
 * Cyan icon tile · matches the vpn.vu Figma "mv-toggle-row" vocabulary
 * (28x28, soft brand tint, brand-glow border, brand-glow stroke). Shared
 * shape across all six DNS-blocker rows so the list reads as a coherent set.
 */
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

// Megaphone glyph · evokes ads / broadcasted promotion without resorting to a
// banned-sign cliché. Strokes use currentColor so IconBox owns the hue.
function AdsIcon() {
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
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export function BlockAdsSetting(props: BlockAdsSettingProps) {
  const descriptionId = React.useId();
  return (
    <ListItem level={1} {...props}>
      <ListItem.Item>
        <BlockAdsSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <AdsIcon />
            </IconBox>
            <BlockAdsSwitch.Label variant="bodySmall">
              {
                // TRANSLATORS: Label for settings that enables ad blocking.
                messages.pgettext('vpn-settings-view', 'Ads')
              }
            </BlockAdsSwitch.Label>
          </LabelWrap>
          <ListItem.Item.ActionGroup>
            <BlockAdsSwitch.Input />
          </ListItem.Item.ActionGroup>
        </BlockAdsSwitch>
      </ListItem.Item>
      <ListItem.Footer>
        <ListItem.Footer.Text id={descriptionId}>
          {
            // TRANSLATORS: Inline description for the "Ads" DNS blocker row.
            messages.pgettext('vpn-settings-view', 'Banners, pop-ups, native ads')
          }
        </ListItem.Footer.Text>
      </ListItem.Footer>
    </ListItem>
  );
}
