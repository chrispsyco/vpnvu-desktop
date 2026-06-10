import { useCallback } from 'react';
import { sprintf } from 'sprintf-js';

import { messages } from '../../../../../../../../../../shared/gettext';
import { RoutePath } from '../../../../../../../../../../shared/routes';
import { Button, ButtonProps } from '../../../../../../../../../lib/components';
import { TransitionType, useHistory } from '../../../../../../../../../lib/history';
import { useSelectedRelayName } from '../../../../hooks/useSelectedRelayName';

export function SelectLocationButton(props: ButtonProps) {
  const { push } = useHistory();

  const selectedRelayName = useSelectedRelayName();

  const onSelectLocation = useCallback(() => {
    push(RoutePath.selectLocation, { transition: TransitionType.show });
  }, [push]);

  return (
    <Button
      onClick={onSelectLocation}
      aria-label={sprintf(
        messages.pgettext('accessibility', 'Select location. Current location is %(location)s'),
        { location: selectedRelayName },
      )}
      {...props}>
      {/* PSYCO · botão sempre "Selecionar servidor" (não mostra mais o nome do
          servidor selecionado) · paridade com o mobile. */}
      <Button.Text>{messages.pgettext('tunnel-control', 'Select a server')}</Button.Text>
      <Button.Icon icon="chevron-right" />
    </Button>
  );
}
