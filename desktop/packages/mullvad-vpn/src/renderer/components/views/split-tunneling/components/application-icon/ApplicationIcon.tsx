import styled from 'styled-components';

import { type IApplication } from '../../../../../../shared/application-types';
import { spacings } from '../../../../../lib/foundations';
import { CellImage } from '../../../../cell';
import { disabledApplication, type DisabledApplicationProps } from '../../utils';

/**
 * VPN.vu · application icon tile. Wraps the raw `CellImage` (an `<img>`) with
 * a cyan-tinted rounded tile so apps without a transparent PNG icon get a
 * consistent visual frame. Mirrors the Figma `.mv-row__icon` token (32x32
 * rounded square, soft cyan background).
 */
export const StyledIcon = styled(CellImage)<DisabledApplicationProps>(disabledApplication, {
  marginRight: spacings.small,
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(91, 200, 218, 0.08)',
  border: '1px solid rgba(91, 200, 218, 0.16)',
  padding: '2px',
  objectFit: 'contain',
});

export const StyledIconPlaceholder = styled.div({
  width: '32px',
  height: '32px',
  marginRight: spacings.small,
  borderRadius: '8px',
  background: 'rgba(91, 200, 218, 0.04)',
  border: '1px solid rgba(91, 200, 218, 0.10)',
  flexShrink: 0,
});

export type ApplicationIconProps = {
  disabled?: boolean;
  icon?: IApplication['icon'];
};

export function ApplicationIcon({ disabled, icon }: ApplicationIconProps) {
  if (icon) {
    return <StyledIcon source={icon} width={32} height={32} $lookDisabled={disabled} />;
  }

  return <StyledIconPlaceholder />;
}
