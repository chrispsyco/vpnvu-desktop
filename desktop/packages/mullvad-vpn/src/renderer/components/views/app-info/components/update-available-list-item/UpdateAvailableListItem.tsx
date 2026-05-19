import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { colors } from '../../../../../lib/foundations';
import { useVersionSuggestedUpgrade } from '../../../../../redux/hooks';
import { isPlatform } from '../../../../../utils';
import { geistMono } from '../../../../common-styles';
import { useHandleClick } from './hooks';

export type UpdateAvailableListItemProps = React.ComponentPropsWithoutRef<'button'>;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// =============================================================================
// UPDATE BANNER · cyan-glow card that calls out an available update. Replaces
// the plain ListItem look with a banner-style CTA that mirrors the figma
// `.ai-banner` glow (gradient surface + radial bloom + icon tile + "Install"
// pill). Uses a native <button> as the root so the entire banner is one
// keyboard-focusable affordance.
// =============================================================================

const StyledBanner = styled.button(
  {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '16px',
    padding: '14px 16px',
    border: '1px solid rgba(91, 200, 218, 0.36)',
    background:
      'linear-gradient(135deg, rgba(9, 158, 180, 0.22), rgba(91, 200, 218, 0.08) 60%, rgba(9, 158, 180, 0.06))',
    boxShadow:
      '0 18px 40px -18px rgba(9, 158, 180, 0.45), inset 0 0 0 1px rgba(91, 200, 218, 0.10)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: colors.white,
    transition:
      'border-color 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: '-60% -20% auto auto',
      width: '260px',
      height: '260px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle at 30% 30%, rgba(91, 200, 218, 0.28), transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(30px)',
    },
    '&:hover': {
      borderColor: 'rgba(91, 200, 218, 0.6)',
      boxShadow:
        '0 22px 50px -18px rgba(9, 158, 180, 0.55), inset 0 0 0 1px rgba(91, 200, 218, 0.18)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.blue80}`,
      outlineOffset: '2px',
    },
  },
  css`
    animation: ${fadeUp} 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

// Cyan tile holding the download arrow icon at the start of the banner
const StyledIconTile = styled.div({
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background:
    'linear-gradient(140deg, rgba(91, 200, 218, 0.95), rgba(9, 158, 180, 0.95))',
  boxShadow:
    '0 8px 22px -8px rgba(9, 158, 180, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledBody = styled.div({
  position: 'relative',
  zIndex: 1,
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const StyledTitle = styled.div({
  fontFamily: '"Geist", "Noto Sans Myanmar", "Noto Sans Thai", sans-serif',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: colors.white,
});

const StyledVersion = styled.div({
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: colors.blue80,
  fontVariantNumeric: 'tabular-nums',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const StyledCta = styled.span({
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '8px',
  background: 'rgba(10, 33, 40, 0.7)',
  border: '1px solid rgba(91, 200, 218, 0.32)',
  color: colors.blue80,
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
});

// Inline SVGs match the figma icons: a downward arrow into a tray for the
// "install" affordance, and a top-right arrow for the Linux "external link"
// case (the public icon registry doesn't ship a `download` glyph, so we keep
// these inline rather than expanding the global set just for this banner).
const DownloadGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ExternalGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export function UpdateAvailableListItem(props: UpdateAvailableListItemProps) {
  const { suggestedUpgrade } = useVersionSuggestedUpgrade();
  const isLinux = isPlatform('linux');
  const handleClick = useHandleClick();

  return (
    <StyledBanner type="button" onClick={handleClick} {...props}>
      <StyledIconTile>{isLinux ? <ExternalGlyph /> : <DownloadGlyph />}</StyledIconTile>
      <StyledBody>
        <StyledTitle>
          {
            // TRANSLATORS: Label for update available list item.
            messages.pgettext('app-info-view', 'Update available')
          }
        </StyledTitle>
        {suggestedUpgrade?.version && <StyledVersion>{suggestedUpgrade.version}</StyledVersion>}
      </StyledBody>
      <StyledCta aria-hidden="true">
        {
          // TRANSLATORS: CTA pill on the update available banner.
          messages.pgettext('app-info-view', 'Install')
        }
      </StyledCta>
    </StyledBanner>
  );
}
