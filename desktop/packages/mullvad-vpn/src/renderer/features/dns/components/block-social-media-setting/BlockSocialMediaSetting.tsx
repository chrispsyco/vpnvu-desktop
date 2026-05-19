import React from 'react';
import styled from 'styled-components';

import { messages } from '../../../../../shared/gettext';
import { ListItem, ListItemProps } from '../../../../lib/components/list-item';
import { BlockSocialMediaSwitch } from '../block-social-media-switch';

export type BlockSocialMediaSettingProps = Omit<ListItemProps, 'children'>;

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

// Share-2 · network/share node iconography for social platforms.
function SocialMediaIcon() {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function BlockSocialMediaSetting(props: BlockSocialMediaSettingProps) {
  const descriptionId = React.useId();
  return (
    <ListItem level={1} {...props}>
      <ListItem.Item>
        <BlockSocialMediaSwitch descriptionId={descriptionId}>
          <LabelWrap>
            <IconBox aria-hidden="true">
              <SocialMediaIcon />
            </IconBox>
            <BlockSocialMediaSwitch.Label variant="bodySmall">
              {
                // TRANSLATORS: Label for settings that enables block of social media.
                messages.pgettext('vpn-settings-view', 'Social media')
              }
            </BlockSocialMediaSwitch.Label>
          </LabelWrap>
          <ListItem.Item.ActionGroup>
            <BlockSocialMediaSwitch.Input />
          </ListItem.Item.ActionGroup>
        </BlockSocialMediaSwitch>
      </ListItem.Item>
      <ListItem.Footer>
        <ListItem.Footer.Text id={descriptionId}>
          {
            // TRANSLATORS: Inline description for the "Social media" DNS blocker row.
            messages.pgettext('vpn-settings-view', 'X, Facebook, TikTok, Instagram')
          }
        </ListItem.Footer.Text>
      </ListItem.Footer>
    </ListItem>
  );
}
