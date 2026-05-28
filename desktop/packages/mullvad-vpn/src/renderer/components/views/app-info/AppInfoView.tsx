import { useCallback, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { messages } from '../../../../shared/gettext';
import { RoutePath } from '../../../../shared/routes';
import { Image } from '../../../lib/components/image';
import { View } from '../../../lib/components/view';
import { colors, spacings } from '../../../lib/foundations';
import { TransitionType, useHistory } from '../../../lib/history';
import { useVersionCurrent } from '../../../redux/hooks';
import { AppNavigationHeader } from '../../';
import { geistMono } from '../../common-styles';
import { BackAction } from '../../keyboard-navigation';
import { SettingsNavigationScrollbars } from '../../Layout';
import { NavigationContainer } from '../../NavigationContainer';
import { ChangelogListItem, UpdateAvailableListItem, VersionListItem } from './components';
import { useShowUpdateAvailable } from './hooks';

// VPN.vu · Android-style developer-tools easter egg. Five taps on the version
// chip within DEVTOOLS_WINDOW_MS navigates to the hidden Debug view (the
// upstream "Developer tools" page with previews of Welcome/Out-of-time, error
// triggers, etc.) — useful for QA without exposing it in the normal settings
// tree. 3000ms window gives a relaxed ~600ms per tap so it's reachable
// without making your wrist hurt.
const DEVTOOLS_TAP_TARGET = 5;
const DEVTOOLS_WINDOW_MS = 3000;

// =============================================================================
// MOTION · same easing + curves as SettingsView so AppInfo lands in the same
// beat as the rest of the settings stack (see SettingsStyles).
// =============================================================================

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
// LAYOUT ROOT · creates its own stacking context (isolation) so the absolutely
// positioned atmosphere stays bounded to this view. Matches the Batch 1
// pattern used by LoginView / SettingsView and avoids the `position: fixed +
// zIndex: 0` paint-order issue called out in the Batch 1 checkpoint.
// =============================================================================

const StyledRoot = styled.div({
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  minHeight: 0,
});

// Atmosphere zeroed after 2026-05-19 feedback (alignment with Account view's
// flat darkBlue background). Kept as a no-op wrapper so the existing
// `<StyledAtmosphere aria-hidden />` call site below still mounts a (silent)
// node — restore the radial blooms + animation here if we ever want the
// signature cyan glow back on App Info specifically.
const StyledAtmosphere = styled.div({
  display: 'none',
});

const StyledBody = styled.div({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: spacings.medium,
});

// =============================================================================
// HERO · logo lockup + display title + tagline + version chip. Mirrors the
// figma `.ai-hero` card: linear gradient surface, soft cyan radial glow in
// the corner, mark/lockup at the top.
// =============================================================================

const StyledHero = styled.div(
  {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '18px',
    padding: '20px 20px 18px',
    background:
      'linear-gradient(160deg, rgba(9, 158, 180, 0.14), rgba(91, 200, 218, 0.04) 60%, transparent)',
    border: '1px solid rgba(91, 200, 218, 0.20)',
    boxShadow: '0 18px 40px -22px rgba(9, 158, 180, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: '-40% -25% auto auto',
      width: '280px',
      height: '280px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle at 30% 30%, rgba(91, 200, 218, 0.22), transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(28px)',
    },
  },
  css`
    animation: ${fadeUp} 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

const StyledHeroMark = styled.div({
  position: 'relative',
  zIndex: 1,
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  background:
    'linear-gradient(140deg, rgba(91, 200, 218, 0.95), rgba(9, 158, 180, 0.95) 55%, rgba(14, 72, 80, 0.95))',
  boxShadow:
    '0 16px 40px -10px rgba(9, 158, 180, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// `brightness(0) invert(1)` flattens whatever colours the source SVG/PNG
// carries to pure white, then `drop-shadow` sits on top of the white silhouette.
// Chris asked for the logo to read as white over the cyan tile (2026-05-19).
const StyledHeroMarkImage = styled(Image)({
  width: '70%',
  height: '70%',
  objectFit: 'contain',
  filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
  pointerEvents: 'none',
});

const StyledHeroBrand = styled.div({
  position: 'relative',
  zIndex: 1,
  fontFamily: '"Geist", "Noto Sans Myanmar", "Noto Sans Thai", sans-serif',
  fontSize: '24px',
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: '-0.035em',
  color: colors.white,
});

// `.tld` accent — cyan wordmark suffix matches the .vu styling in the figma.
const StyledHeroBrandAccent = styled.span({
  color: colors.blue80,
});

const StyledHeroTagline = styled.div({
  position: 'relative',
  zIndex: 1,
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue60,
  textAlign: 'center',
});

const StyledHeroVersionChip = styled.button({
  position: 'relative',
  zIndex: 1,
  marginTop: '4px',
  padding: '5px 12px',
  borderRadius: '8px',
  background: 'rgba(10, 33, 40, 0.55)',
  border: '1px solid rgba(91, 200, 218, 0.20)',
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  color: colors.blue80,
  fontVariantNumeric: 'tabular-nums',
  cursor: 'default',
  appearance: 'none',
  outline: 'none',
  '&:focus-visible': {
    boxShadow: '0 0 0 2px rgba(91, 200, 218, 0.45)',
  },
});

// =============================================================================
// SECTION · kicker eyebrow above each list group (same shape as Settings)
// =============================================================================

const StyledSection = styled.div(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: spacings.small,
  },
  css`
    animation: ${fadeUp} 420ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
);

const StyledKicker = styled.div({
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 600,
  lineHeight: '14px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: colors.whiteOnDarkBlue60,
  paddingLeft: spacings.tiny,
});

const StyledRowsGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const StyledFooter = styled.div({
  marginTop: spacings.small,
  textAlign: 'center',
  fontFamily: geistMono,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.10em',
  color: colors.whiteOnDarkBlue40,
  textTransform: 'uppercase',
  position: 'relative',
  zIndex: 1,
});

const StyledFooterAccent = styled.span({
  color: colors.blue80,
});

export function AppInfoView() {
  const { pop, push } = useHistory();
  const showUpdateAvailable = useShowUpdateAvailable();
  const { current } = useVersionCurrent();

  // 5× tap on version chip → /debug. Counter + timer live in refs so the
  // re-render storm from chip text doesn't reset progress; we only set state
  // for the visible "almost there" affordance via aria-pressed.
  const tapCount = useRef(0);
  const tapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressedHint, setPressedHint] = useState(false);
  const handleVersionTap = useCallback(() => {
    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
    tapCount.current += 1;
    if (tapCount.current >= DEVTOOLS_TAP_TARGET) {
      tapCount.current = 0;
      setPressedHint(false);
      push(RoutePath.debug, { transition: TransitionType.push });
      return;
    }
    setPressedHint(tapCount.current >= 3);
    tapResetTimer.current = setTimeout(() => {
      tapCount.current = 0;
      setPressedHint(false);
    }, DEVTOOLS_WINDOW_MS);
  }, [push]);

  return (
    <View backgroundColor="darkBlue">
      <StyledRoot>
        <StyledAtmosphere aria-hidden="true" />
        <BackAction action={pop}>
          <NavigationContainer>
            <AppNavigationHeader
              title={
                // TRANSLATORS: Title of the app info view.
                messages.pgettext('app-info-view', 'App info')
              }
            />

            <SettingsNavigationScrollbars fillContainer>
              <View.Content>
                <View.Container horizontalMargin="medium" flexDirection="column" gap="medium">
                  <StyledBody>
                    <StyledHero>
                      <StyledHeroMark>
                        <StyledHeroMarkImage source="logo-icon" alt="VPN.vu" />
                      </StyledHeroMark>
                      <StyledHeroBrand>
                        VPN<StyledHeroBrandAccent>.vu</StyledHeroBrandAccent>
                      </StyledHeroBrand>
                      <StyledHeroTagline>
                        {
                          // TRANSLATORS: Tagline shown under the brand in the App Info hero.
                          messages.pgettext('app-info-view', 'Your VPN · no name, no trace')
                        }
                      </StyledHeroTagline>
                      <StyledHeroVersionChip
                        type="button"
                        onClick={handleVersionTap}
                        aria-pressed={pressedHint}
                        aria-label={current}>
                        {current}
                      </StyledHeroVersionChip>
                    </StyledHero>

                    {showUpdateAvailable && <UpdateAvailableListItem />}

                    <StyledSection>
                      <StyledKicker>
                        {
                          // TRANSLATORS: Section kicker label above the version + changelog rows.
                          messages.pgettext('app-info-view', 'Version')
                        }
                      </StyledKicker>
                      <StyledRowsGroup>
                        <ChangelogListItem />
                        <VersionListItem />
                      </StyledRowsGroup>
                    </StyledSection>
                  </StyledBody>

                  <StyledFooter aria-hidden="true">
                    VPN.vu <StyledFooterAccent>{current}</StyledFooterAccent>
                  </StyledFooter>
                </View.Container>
              </View.Content>
            </SettingsNavigationScrollbars>
          </NavigationContainer>
        </BackAction>
      </StyledRoot>
    </View>
  );
}
