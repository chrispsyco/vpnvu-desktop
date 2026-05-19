import { sprintf } from 'sprintf-js';
import styled from 'styled-components';

import { messages } from '../../../../../../shared/gettext';
import {
  BlockAdsSetting,
  BlockAdultContentSetting,
  BlockGamblingSetting,
  BlockMalwareSetting,
  BlockSocialMediaSetting,
  BlockTrackersSetting,
} from '../../../../../features/dns/components';
import { useDns } from '../../../../../features/dns/hooks';
import { AccordionProps } from '../../../../../lib/components/accordion';
import { ListItemProps } from '../../../../../lib/components/list-item';
import { formatHtml } from '../../../../../lib/html-formatter';
import InfoButton from '../../../../InfoButton';
import { ModalMessage } from '../../../../Modal';
import { SettingsAccordion } from '../../../../settings-accordion';
import { CustomDnsEnabledFooter } from './components';

export type DnsBlockerSettingsProps = Omit<AccordionProps, 'children'> &
  Pick<ListItemProps, 'position'>;

const StyledAccordionTrigger = styled(SettingsAccordion.Header.AccordionTrigger)`
  display: grid;
  place-items: center;
`;

/**
 * Cyan icon tile · matches the 6 BlockX rows below so the accordion header
 * reads as the family root. 28x28, soft brand tint, brand-glow border + stroke.
 */
const HeaderIconBox = styled.span({
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

/**
 * Tightens the gap between the icon tile and the accordion title so the header
 * reads as a single visual unit (matches the row layout below).
 */
const HeaderLabelWrap = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
});

// Shield-with-slash glyph · canonical "content blocked" mnemonic.
function ShieldOffIcon() {
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
      <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18" />
      <path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function DnsBlockerSettings({ position, ...props }: DnsBlockerSettingsProps) {
  const { dns } = useDns();
  const customDnsFeatureName = messages.pgettext('vpn-settings-view', 'Use custom DNS server');

  return (
    <>
      <SettingsAccordion
        accordionId="dns-blocker-setting"
        anchorId="dns-blocker-setting"
        aria-label={messages.pgettext('vpn-settings-view', 'DNS content blockers')}
        disabled={dns.state === 'custom'}
        {...props}>
        <SettingsAccordion.Container>
          <SettingsAccordion.Header position={position}>
            <SettingsAccordion.Header.Item>
              <HeaderLabelWrap>
                <HeaderIconBox aria-hidden="true">
                  <ShieldOffIcon />
                </HeaderIconBox>
                <SettingsAccordion.Header.Item.Title variant="bodySmallSemibold">
                  {messages.pgettext('vpn-settings-view', 'DNS content blockers')}
                </SettingsAccordion.Header.Item.Title>
              </HeaderLabelWrap>
              <SettingsAccordion.Header.Item.ActionGroup>
                <InfoButton>
                  <ModalMessage>
                    {messages.pgettext(
                      'vpn-settings-view',
                      'When this feature is enabled it stops the device from contacting certain domains or websites known for distributing ads, malware, trackers and more.',
                    )}
                  </ModalMessage>
                  <ModalMessage>
                    {messages.pgettext(
                      'vpn-settings-view',
                      'This might cause issues on certain websites, services, and apps.',
                    )}
                  </ModalMessage>
                  <ModalMessage>
                    {formatHtml(
                      sprintf(
                        messages.pgettext(
                          'vpn-settings-view',
                          'Attention: this setting cannot be used in combination with <b>%(customDnsFeatureName)s</b>',
                        ),
                        { customDnsFeatureName },
                      ),
                    )}
                  </ModalMessage>
                </InfoButton>
                <StyledAccordionTrigger>
                  <SettingsAccordion.Header.Item.Chevron />
                </StyledAccordionTrigger>
              </SettingsAccordion.Header.Item.ActionGroup>
            </SettingsAccordion.Header.Item>
          </SettingsAccordion.Header>
          <SettingsAccordion.Content>
            <BlockAdsSetting position="middle" />
            <BlockTrackersSetting />
            <BlockMalwareSetting />
            <BlockGamblingSetting />
            <BlockAdultContentSetting />
            <BlockSocialMediaSetting />
          </SettingsAccordion.Content>
        </SettingsAccordion.Container>
      </SettingsAccordion>
      {dns.state === 'custom' && <CustomDnsEnabledFooter />}
    </>
  );
}
