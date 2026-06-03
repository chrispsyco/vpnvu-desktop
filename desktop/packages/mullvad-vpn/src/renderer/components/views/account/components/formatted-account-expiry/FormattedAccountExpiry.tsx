import { useCallback } from 'react';
import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { urls } from '../../../../../../shared/constants';
import { closeToExpiry, formatDate, hasExpired } from '../../../../../../shared/account-expiry';
import { DateDiff } from '../../../../../../shared/date-helper';
import { messages } from '../../../../../../shared/gettext';
import { RoutePath } from '../../../../../../shared/routes';
import { useAppContext } from '../../../../../context';
import { Text } from '../../../../../lib/components';
import { FlexColumn } from '../../../../../lib/components/flex-column';
import { useHistory } from '../../../../../lib/history';

// Three tones: ok (cyan), warning (yellow ≤ 7d), danger (red expired).
type ExpiryTone = 'ok' | 'warning' | 'danger';

const TONE_COLORS: Record<ExpiryTone, { fg: string; chipBg: string; chipFg: string; barFg: string }> = {
  ok: {
    fg: 'rgb(91, 200, 218)',
    chipBg: 'rgba(91, 200, 218, 0.16)',
    chipFg: 'rgb(91, 200, 218)',
    barFg: 'linear-gradient(90deg, rgb(9, 158, 180) 0%, rgb(91, 200, 218) 100%)',
  },
  warning: {
    fg: 'rgb(232, 172, 46)',
    chipBg: 'rgba(232, 172, 46, 0.16)',
    chipFg: 'rgb(232, 172, 46)',
    barFg: 'rgb(232, 172, 46)',
  },
  danger: {
    fg: 'rgb(227, 67, 73)',
    chipBg: 'rgba(227, 67, 73, 0.16)',
    chipFg: 'rgb(227, 67, 73)',
    barFg: 'rgb(227, 67, 73)',
  },
};

const StyledTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StyledChip = styled.span<{ $tone: ExpiryTone }>`
  padding: 3px 8px;
  border-radius: 8px;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: ${({ $tone }) => TONE_COLORS[$tone].chipBg};
  color: ${({ $tone }) => TONE_COLORS[$tone].chipFg};
`;

const StyledDays = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 800;
  font-size: 38px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: rgb(255, 255, 255);
`;

const StyledDaysUnit = styled.span`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  color: rgb(155, 174, 182);
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-top: 4px;
`;

const StyledBarFill = styled.div<{ $width: number; $tone: ExpiryTone }>`
  height: 100%;
  width: ${({ $width }) => `${Math.min(100, Math.max(2, $width))}%`};
  border-radius: 3px;
  background: ${({ $tone }) => TONE_COLORS[$tone].barFg};
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const StyledExpiredLabel = styled(Text)`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
`;

// Empty-state styling: cyan headline + muted helper, sitting above a pair of
// stacked CTAs. Matches the editorial weight of the "OUT OF TIME" branch so
// the empty state doesn't read as broken (an empty Account row historically
// rendered "Currently unavailable" — useless on first launch).
const StyledEmptyHeadline = styled(Text)`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: rgb(91, 200, 218);
`;

const StyledEmptyHelper = styled(Text)`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 1.45;
  color: rgb(155, 174, 182);
`;

const StyledEmptyActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const baseEmptyButton = `
  height: 44px;
  border-radius: 12px;
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: -0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:focus-visible {
    outline: 2px solid rgb(91, 200, 218);
    outline-offset: 3px;
  }
`;

const StyledPrimaryEmptyButton = styled.button`
  ${baseEmptyButton}
  border: 0;
  color: rgb(255, 255, 255);
  background: linear-gradient(135deg, rgb(91, 200, 218), rgb(9, 158, 180));
  box-shadow:
    0 10px 24px -8px rgba(91, 200, 218, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);

  &:hover {
    box-shadow:
      0 14px 28px -8px rgba(91, 200, 218, 0.65),
      0 0 24px rgba(9, 158, 180, 0.35),
      inset 0 0 0 1px rgba(255, 255, 255, 0.14);
  }
`;

const StyledGhostEmptyButton = styled.button`
  ${baseEmptyButton}
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgb(220, 234, 240);

  &:hover {
    color: rgb(255, 255, 255);
    border-color: rgba(91, 200, 218, 0.5);
    background: rgba(91, 200, 218, 0.06);
  }
`;

function computeFill(days: number): number {
  // Assume an annual plan baseline (360 days) so the bar reads "x% remaining".
  // For longer plans the bar caps at 100 and feels generous; for short ones it
  // visibly empties.
  const baseline = 360;
  return (days / baseline) * 100;
}

function renderRemainingLabel(days: number): { value: string; unit: string } {
  if (days >= 730) {
    const years = Math.floor(days / 365);
    return {
      value: String(years),
      // TRANSLATORS: Unit suffix shown after a remaining-time number, plural years.
      unit: sprintf(messages.ngettext('year remaining', 'years remaining', years)),
    };
  }
  if (days >= 60) {
    const months = Math.floor(days / 30);
    return {
      value: String(months),
      // TRANSLATORS: Unit suffix shown after a remaining-time number, plural months.
      unit: sprintf(messages.ngettext('month remaining', 'months remaining', months)),
    };
  }
  return {
    value: String(Math.max(0, days)),
    // TRANSLATORS: Unit suffix shown after a remaining-time number, plural days.
    unit: sprintf(messages.ngettext('day remaining', 'days remaining', Math.max(1, days))),
  };
}

function renderChipLabel(tone: ExpiryTone, days: number): string {
  if (tone === 'danger') {
    return messages.pgettext('account-view', 'Expired');
  }
  if (tone === 'warning') {
    // TRANSLATORS: Chip label shown when the account is close to expiry.
    return messages.pgettext('account-view', 'Renew');
  }
  if (days >= 300) {
    // TRANSLATORS: Chip label shown when the user has roughly an annual plan worth of time left.
    return messages.pgettext('account-view', 'Annual');
  }
  if (days >= 80) {
    // TRANSLATORS: Chip label shown when the user has roughly a 90-day plan worth of time left.
    return messages.pgettext('account-view', '90 days');
  }
  // TRANSLATORS: Chip label shown when the user has roughly a monthly plan worth of time left.
  return messages.pgettext('account-view', 'Active');
}

export function FormattedAccountExpiry(props: { expiry?: string; locale: string }) {
  if (!props.expiry) {
    return <EmptyExpiryCta />;
  }

  if (hasExpired(props.expiry)) {
    return (
      <FlexColumn gap="small">
        <Text variant="labelTiny" color="whiteAlpha60">
          {formatDate(props.expiry, props.locale)}
        </Text>
        <StyledTopRow>
          <StyledExpiredLabel as="span" style={{ color: TONE_COLORS.danger.fg }}>
            {messages.pgettext('account-view', 'OUT OF TIME')}
          </StyledExpiredLabel>
          <StyledChip $tone="danger">{renderChipLabel('danger', 0)}</StyledChip>
        </StyledTopRow>
        <StyledBar>
          <StyledBarFill $width={2} $tone="danger" />
        </StyledBar>
      </FlexColumn>
    );
  }

  const diff = new DateDiff(new Date(), new Date(props.expiry));
  const days = Math.max(0, diff.days);
  const tone: ExpiryTone = closeToExpiry(props.expiry, 7) ? 'warning' : 'ok';
  const fill = computeFill(days);
  const { value, unit } = renderRemainingLabel(days);

  return (
    <FlexColumn gap="small">
      {/* Date sits directly under the "Paid until" label so it reads as
          "Paid until · <date>". The days-remaining counter follows below. */}
      <Text variant="labelTiny" color="whiteAlpha60">
        {formatDate(props.expiry, props.locale)}
      </Text>
      <StyledTopRow>
        <StyledDays>
          {value}
          <StyledDaysUnit>{unit}</StyledDaysUnit>
        </StyledDays>
        <StyledChip $tone={tone}>{renderChipLabel(tone, days)}</StyledChip>
      </StyledTopRow>
      <StyledBar>
        <StyledBarFill $width={fill} $tone={tone} />
      </StyledBar>
    </FlexColumn>
  );
}

// Empty-state replacement for the "Currently unavailable" leftover. Renders
// when the account has no expiry yet — typically a freshly created account
// that hasn't redeemed a voucher or bought time. Surfaces both flows
// (voucher in-app, purchase in browser) so the row stops being a dead-end.
function EmptyExpiryCta() {
  const { push } = useHistory();
  const { openUrlWithAuth } = useAppContext();

  const openRedeemVoucher = useCallback(() => {
    push(RoutePath.redeemVoucher);
  }, [push]);

  const openPurchase = useCallback(() => {
    void openUrlWithAuth(urls.purchase);
  }, [openUrlWithAuth]);

  return (
    <FlexColumn gap="small">
      <StyledEmptyHeadline as="span">
        {
          // TRANSLATORS: Shown on the Account row when the user has no VPN time on the account yet.
          messages.pgettext('account-view', 'No time on this account')
        }
      </StyledEmptyHeadline>
      <StyledEmptyHelper as="span">
        {
          // TRANSLATORS: Sub-line under the empty-state headline, framing the two CTAs below.
          messages.pgettext(
            'account-view',
            'Add time to start using VPN.vu. Redeem a voucher or buy credit on our site.',
          )
        }
      </StyledEmptyHelper>
      <StyledEmptyActions>
        <StyledPrimaryEmptyButton type="button" onClick={openRedeemVoucher}>
          {
            // TRANSLATORS: Primary button to navigate to the voucher redemption view.
            messages.pgettext('account-view', 'Redeem voucher')
          }
        </StyledPrimaryEmptyButton>
        <StyledGhostEmptyButton type="button" onClick={openPurchase}>
          {
            // TRANSLATORS: Secondary button that opens the external purchase page.
            messages.pgettext('account-view', 'Buy credit')
          }
        </StyledGhostEmptyButton>
      </StyledEmptyActions>
    </FlexColumn>
  );
}
