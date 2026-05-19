import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { usePushChangelog } from '../../../../../history/hooks';
import { Icon } from '../../../../../lib/components';
import { ListItem, ListItemProps } from '../../../../../lib/components/list-item';
import { colors } from '../../../../../lib/foundations';
import { geistMono } from '../../../../common-styles';

export type ChangelogListItemProps = Omit<ListItemProps, 'children'>;

// Cyan-tinted tile that hosts the leading SVG glyph for each App Info row.
// Mirrors the figma `.ai-row__icon` shape; shared across Changelog/Version
// rows by keeping the same dimensions and color tokens.
const StyledIconTile = styled.div({
  flexShrink: 0,
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  background: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.18)',
  color: colors.blue80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledSub = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: colors.whiteOnDarkBlue60,
  marginTop: '2px',
});

const StyledTitleColumn = styled.div({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

// Inline glyph: scroll/file representing the changelog. Kept inline because
// the shared Icon registry doesn't ship a file/text/scroll glyph.
const FileGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

export function ChangelogListItem(props: ChangelogListItemProps) {
  const pushChangelog = usePushChangelog();

  return (
    <ListItem {...props}>
      <ListItem.Trigger onClick={pushChangelog}>
        <ListItem.Item>
          <ListItem.Item.Group gap="medium">
            <StyledIconTile aria-hidden="true">
              <FileGlyph />
            </StyledIconTile>
            <StyledTitleColumn>
              <ListItem.Item.Label>
                {
                  // TRANSLATORS: Label for changelog list item.
                  messages.pgettext('app-info-view', 'What’s new')
                }
              </ListItem.Item.Label>
              <StyledSub>
                {
                  // TRANSLATORS: Sub-label under the changelog row in App Info.
                  messages.pgettext('app-info-view', 'Release notes for this version')
                }
              </StyledSub>
            </StyledTitleColumn>
          </ListItem.Item.Group>
          <ListItem.Item.ActionGroup>
            <Icon icon="chevron-right" />
          </ListItem.Item.ActionGroup>
        </ListItem.Item>
      </ListItem.Trigger>
    </ListItem>
  );
}
