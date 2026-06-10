import styled from 'styled-components';

import { messages } from '../../../../../../../../shared/gettext';
import { colors } from '../../../../../../../lib/foundations';
import { useSelector } from '../../../../../../../redux/store';
import { largeText } from '../../../../../../common-styles';
import Marquee from '../../../../../../Marquee';
import { ConnectionPanelAccordion } from '../../../../styles';
import { useSelectedRelayName } from '../../hooks/useSelectedRelayName';

// PSYCO · linha "Servidor selecionado: <relay>" do card de conexão · paridade
// com o mobile. Só aparece quando DESCONECTADO — ao conectar vira redundante
// com a geo de saída (Location/Hostname), então some já no "conectando".

const StyledLabel = styled.span({
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '16px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: colors.whiteAlpha60,
  flexShrink: 0,
});

const StyledServer = styled.span(largeText, {
  color: colors.white,
  flexShrink: 0,
});

const StyledContainer = styled.div({
  marginTop: '8px',
});

export function SelectedServer() {
  const state = useSelector((s) => s.connection.status.state);
  const selectedRelayName = useSelectedRelayName();

  return (
    <ConnectionPanelAccordion expanded={state === 'disconnected'}>
      <StyledContainer>
        {/* TRANSLATORS: Eyebrow label above the server the user picked to connect to. */}
        <StyledLabel>{messages.pgettext('connection-info', 'Selected server')}</StyledLabel>
        <StyledServer>
          <Marquee>{selectedRelayName}</Marquee>
        </StyledServer>
      </StyledContainer>
    </ConnectionPanelAccordion>
  );
}
