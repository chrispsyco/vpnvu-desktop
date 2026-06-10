import styled from 'styled-components';

import { TunnelState } from '../../../../../../../../shared/daemon-rpc-types';
import { messages } from '../../../../../../../../shared/gettext';
import { colors } from '../../../../../../../lib/foundations';
import { useSelector } from '../../../../../../../redux/store';
import { largeText } from '../../../../../../common-styles';
import Marquee from '../../../../../../Marquee';
import { ConnectionPanelAccordion } from '../../../../styles';

// PSYCO · eyebrow "Local atual" acima da geo · paridade com o card do mobile
// (rótulos "Local atual" / "Servidor selecionado"). Real quando desconectado,
// saída da VPN quando conectado.
const StyledLabel = styled.span({
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '16px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: colors.whiteAlpha60,
  flexShrink: 0,
});

const StyledLocation = styled.span(largeText, {
  color: colors.white,
  flexShrink: 0,
});

export function Location() {
  const connection = useSelector((state) => state.connection);
  const text = getLocationText(connection.status, connection.country, connection.city);
  // PSYCO · sem geo resolvida (ex: desconectado antes do daemon devolver o IP
  // real) o texto fica vazio → colapsa o bloco inteiro pra não deixar o rótulo
  // "Local atual" órfão sobre o nada.
  const hasText = text.trim().length > 0;

  return (
    <ConnectionPanelAccordion expanded={connection.status.state !== 'error' && hasText}>
      {/* TRANSLATORS: Eyebrow label above the location on the main screen. */}
      <StyledLabel>{messages.pgettext('connection-info', 'Current location')}</StyledLabel>
      <StyledLocation>
        <Marquee>{text}</Marquee>
      </StyledLocation>
    </ConnectionPanelAccordion>
  );
}

function getLocationText(tunnelState: TunnelState, country?: string, city?: string): string {
  country = country ?? '';

  switch (tunnelState.state) {
    case 'connected':
    case 'connecting':
      return city ? `${country}, ${city}` : country;
    case 'disconnecting':
    case 'disconnected':
      return country;
    case 'error':
      return '';
  }
}
