import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import { useSelectLocationViewContext } from '../../SelectLocationViewContext';

// -----------------------------------------------------------------------------
// NoSearchResult · editorial empty state from figma `.ss-empty`.
//
// Replaces the old LabelTinySemiBold pair with a centered illustration (a
// search-x glyph in a cyan-tinted disc with a dashed orbit ring), an
// editorial title using Geist, and a muted subtext. Existing i18n strings
// are reused — we only re-render them; no new gettext keys introduced so
// the .po files don't drift. The double-line "No result..."/"Try a
// different search." gets fused into one block where the second line
// becomes the subhead.
// -----------------------------------------------------------------------------

export function NoSearchResult() {
  const { searchTerm } = useSelectLocationViewContext();

  // TRANSLATORS: Empty state shown when the search yields no locations.
  // Build the headline text without dangerouslySetInnerHTML — the figma
  // applies a distinct visual treatment to the searched term, so we split
  // the existing "No result for %s." string around the placeholder and
  // wrap the term in a styled span.
  const noResultTemplate = messages.gettext('No result for <b>%(searchTerm)s</b>.');
  const filled = sprintf(noResultTemplate, { searchTerm });
  const [prefix, suffix] = filled.split(/<b>|<\/b>/).reduce<[string, string]>(
    (acc, chunk, i) => {
      if (i === 0) acc[0] = chunk;
      else if (i === 2) acc[1] = chunk;
      return acc;
    },
    ['', ''],
  );

  return (
    <StyledEmpty>
      <StyledIconRing aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
          <line x1="8" y1="8" x2="14" y2="14" />
          <line x1="14" y1="8" x2="8" y2="14" />
        </svg>
      </StyledIconRing>

      <StyledTextBlock>
        <StyledTitle>
          {prefix}
          <StyledQuery>&ldquo;{searchTerm}&rdquo;</StyledQuery>
          {suffix}
        </StyledTitle>
        <StyledSub>{messages.gettext('Try a different search.')}</StyledSub>
      </StyledTextBlock>
    </StyledEmpty>
  );
}

const StyledEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 28px;
  gap: 16px;
`;

// Cyan-tinted disc + dashed orbit. The ::after pseudo gives the
// "scanning" outer ring without needing a second element.
const StyledIconRing = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 42px;
  background: rgba(9, 158, 180, 0.1);
  border: 1px solid rgba(91, 200, 218, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5bc8da;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 1px dashed rgba(91, 200, 218, 0.18);
    pointer-events: none;
  }

  svg {
    width: 38px;
    height: 38px;
  }
`;

const StyledTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
`;

const StyledTitle = styled.div`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #ffffff;
`;

// Editorial accent for the searched term — Geist Mono in cyan-glow with a
// faint tinted pill background. Matches figma `.ss-empty__title .q`.
const StyledQuery = styled.span`
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-weight: 600;
  font-size: 14px;
  color: #5bc8da;
  background: rgba(9, 158, 180, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  margin: 0 2px;
  letter-spacing: 0;
`;

const StyledSub = styled.div`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 400;
  font-size: 12.5px;
  line-height: 1.5;
  color: #9baeb6;
`;
