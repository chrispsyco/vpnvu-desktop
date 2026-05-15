import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Icon } from '../../lib/components';
import { colors } from '../../lib/foundations';
import { AriaInputGroup, AriaLabel } from '../AriaGroup';
import { measurements, smallNormalText, tinyText } from '../common-styles';
import { StyledSettingsGroup, useSettingsGroupContext } from './SettingsGroup';

// Settings input row — matches the framed-input pattern from the vpn.vu mobile
// figma (48-56px height, 12px radius, dark surface, 1.5px cyan-tinted border,
// soft cyan focus ring). brand-glow rgba inlined because color tokens don't
// expose a low-alpha cyan ring color (#5BC8DA = rgba(91, 200, 218, …)).
const StyledSettingsRow = styled.label<{ $invalid: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',

  margin: `0 ${measurements.horizontalViewMargin} ${measurements.rowVerticalMargin}`,
  padding: '0 14px',
  minHeight: '48px',
  backgroundColor: colors.darkBlue,
  borderRadius: '12px',
  transition:
    'border-color 180ms ease, outline-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',

  [`${StyledSettingsGroup} &&`]: {
    marginBottom: 0,
  },

  [`${StyledSettingsGroup} &&:not(:last-child)`]: {
    marginBottom: '1px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  [`${StyledSettingsGroup} &&:not(:first-child)`]: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },

  borderWidth: '1.5px',
  outlineWidth: '0',
  borderStyle: 'solid',
  outlineStyle: 'solid',
  borderColor: props.$invalid ? colors.red : colors.blue20,
  outlineColor: colors.transparent,
  boxShadow: 'none',
  '&&:hover': {
    borderColor: props.$invalid ? colors.red : 'rgba(91, 200, 218, 0.3)',
  },
  '&&:focus-within': {
    borderColor: props.$invalid ? colors.red : 'rgba(91, 200, 218, 1)',
    outlineColor: colors.transparent,
    boxShadow: props.$invalid
      ? '0 0 0 4px rgba(227, 64, 57, 0.12)'
      : '0 0 0 4px rgba(91, 200, 218, 0.12)',
  },
}));

const StyledLabel = styled.div(smallNormalText, {
  display: 'flex',
  flex: 1,
  margin: '4px 0',
});

const StyledInputContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'end',
});

const StyledSettingsRowErrorMessage = styled.div(tinyText, {
  display: 'flex',
  alignItems: 'center',
  marginLeft: measurements.horizontalViewMargin,
  marginRight: measurements.horizontalViewMargin,
  marginTop: '5px',
  color: colors.whiteAlpha60,
});

const StyledErrorMessageAlertIcon = styled(Icon)({
  marginRight: '5px',
});

interface SettingsRowContext {
  invalid: boolean;
  setInvalid: (invalid: boolean) => void;
}

// Keeps track of input validity to show red border if an invalid value is provided.
const settingsRowContext = React.createContext<SettingsRowContext>({
  invalid: false,
  setInvalid: (_invalid: boolean) => {
    throw new Error('setInvalid not defined');
  },
});

export function useSettingsRowContext() {
  return useContext(settingsRowContext);
}

export interface IndentedRowProps {
  label: string;
  infoMessage?: string | Array<string>;
  errorMessage?: string;
}

export function SettingsRow(props: React.PropsWithChildren<IndentedRowProps>) {
  const { reportError, unsetError } = useSettingsGroupContext();
  const [invalid, setInvalid] = useState(false);

  const setInvalidImpl = useCallback(
    (invalid: boolean) => {
      setInvalid(invalid);
      if (reportError !== undefined && props.errorMessage !== undefined && invalid) {
        reportError(props.errorMessage);
      } else if (unsetError !== undefined && !invalid) {
        unsetError?.();
      }
    },
    [props.errorMessage, reportError, unsetError],
  );

  const contextValue = useMemo(
    () => ({ invalid, setInvalid: setInvalidImpl }),
    [invalid, setInvalidImpl],
  );

  return (
    <settingsRowContext.Provider value={contextValue}>
      <AriaInputGroup>
        <AriaLabel>
          <StyledSettingsRow $invalid={invalid}>
            <StyledLabel>{props.label}</StyledLabel>
            <StyledInputContainer>{props.children}</StyledInputContainer>
          </StyledSettingsRow>
        </AriaLabel>
        {reportError === undefined && invalid && props.errorMessage && (
          <SettingsRowErrorMessage>{props.errorMessage}</SettingsRowErrorMessage>
        )}
      </AriaInputGroup>
    </settingsRowContext.Provider>
  );
}

export function SettingsRowErrorMessage(props: React.PropsWithChildren) {
  return (
    <StyledSettingsRowErrorMessage>
      <StyledErrorMessageAlertIcon icon="alert-circle" color="red" size="small" />
      {props.children}
    </StyledSettingsRowErrorMessage>
  );
}
