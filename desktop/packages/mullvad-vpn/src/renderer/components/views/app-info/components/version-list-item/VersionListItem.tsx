import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { Icon } from '../../../../../lib/components';
import { ListItem, ListItemProps } from '../../../../../lib/components/list-item';
import { colors } from '../../../../../lib/foundations';
import { useVersionCurrent } from '../../../../../redux/hooks';
import { geistMono } from '../../../../common-styles';
import { useShowAlert, useShowFooter } from './hooks';

export type VersionListItemProps = Omit<ListItemProps, 'children'>;

// Cyan tile · matches the Changelog row tile so the two rows read as a pair.
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

// Mono-tab numeric version string in the trailing slot. Tabular-nums + Geist
// Mono so version digits align cleanly and read as a build identifier.
const StyledVersionValue = styled.span({
  fontFamily: geistMono,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  color: colors.blue80,
  fontVariantNumeric: 'tabular-nums',
});

// Inline tag glyph kept here because the shared Icon registry doesn't ship
// a tag/hash icon.
const TagGlyph = () => (
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
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export function VersionListItem(props: VersionListItemProps) {
  const { current } = useVersionCurrent();
  const showAlert = useShowAlert();
  const showFooter = useShowFooter();

  return (
    <ListItem {...props}>
      <ListItem.Item>
        <ListItem.Item.Group gap="medium">
          <StyledIconTile aria-hidden="true">
            <TagGlyph />
          </StyledIconTile>
          {showAlert && <Icon icon="alert-circle" color="red" />}
          <ListItem.Item.Label>
            {
              // TRANSLATORS: Label for version list item.
              messages.pgettext('app-info-view', 'Version')
            }
          </ListItem.Item.Label>
        </ListItem.Item.Group>
        <ListItem.Item.ActionGroup>
          <StyledVersionValue>{current}</StyledVersionValue>
        </ListItem.Item.ActionGroup>
      </ListItem.Item>
      {showFooter && (
        <ListItem.Footer>
          <ListItem.Footer.Text>
            {
              // TRANSLATORS: Description for version list item when app is out of sync.
              messages.pgettext('app-info-view', 'App is out of sync. Please quit and restart.')
            }
          </ListItem.Footer.Text>
        </ListItem.Footer>
      )}
    </ListItem>
  );
}
