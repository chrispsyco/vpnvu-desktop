import React from 'react';

import { colors, spacings } from '../lib/foundations';

export const openSans: React.CSSProperties = {
  fontFamily: 'Open Sans',
};

export const sourceSansPro: React.CSSProperties = {
  fontFamily: '"Source Sans Pro", "Noto Sans Myanmar", "Noto Sans Thai", sans-serif',
};

export const tinyText = {
  ...openSans,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: '18px',
};

export const smallText = {
  ...openSans,
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  color: colors.whiteAlpha80,
};

export const smallNormalText = {
  ...smallText,
  fontWeight: 'normal',
};

export const normalText = {
  ...openSans,
  fontSize: '15px',
  lineHeight: '18px',
};

export const largeText = {
  ...sourceSansPro,
  fontWeight: 600,
  fontSize: '18px',
  lineHeight: '24px',
};

export const buttonText = {
  ...largeText,
  color: colors.white,
};

export const bigText = {
  ...sourceSansPro,
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: '28px',
};

export const hugeText = {
  ...sourceSansPro,
  fontSize: '32px',
  fontWeight: 700,
  lineHeight: '34px',
  color: colors.white,
};

// Geist Mono stack — used by `kickerText` and inline mono fragments. We don't
// have a Mono FontFamilyTokens entry yet (typography-tokens declares both
// families as Geist Sans aliases), so the font stack is inlined here.
export const geistMono =
  '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/**
 * Kicker / eyebrow label — small all-caps Geist Mono used as a section header
 * or section sub-header. Mirrors the vpn.vu mobile figma `.mullvad-card__kicker`
 * and `.frame-label` patterns. Default color is `var(--muted)` family
 * (`whiteOnDarkBlue60`). Use `kickerText` with `color: colors.blue80` to get the
 * cyan brand-glow accent variant.
 */
export const kickerText = {
  fontFamily: geistMono,
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '15px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: colors.whiteOnDarkBlue60,
};

/** Cyan-accented kicker — use when the kicker is the focal point. */
export const kickerTextAccent = {
  ...kickerText,
  color: colors.blue80,
};

export const measurements = {
  rowMinHeight: '48px',
  horizontalViewMargin: spacings.large,
  verticalViewMargin: spacings.large,
  rowVerticalMargin: spacings.large,
  buttonVerticalMargin: spacings.medium,
};
