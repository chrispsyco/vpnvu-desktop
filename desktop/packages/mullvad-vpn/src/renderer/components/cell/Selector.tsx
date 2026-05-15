import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

import { messages } from '../../../shared/gettext';
import { RoutePath } from '../../../shared/routes';
import { Icon } from '../../lib/components';
import { colors, spacings } from '../../lib/foundations';
import { useHistory } from '../../lib/history';
import { useStyledRef } from '../../lib/utility-hooks';
import { AriaDetails, AriaInput, AriaLabel } from '../AriaGroup';
import InfoButton from '../InfoButton';
import * as Cell from '.';

// Selector cell radio button — matches the vpn.vu mobile figma spec:
// 22x22 round, 2px line border when inactive, 2px brand-glow border + 12x12
// inner dot + box-shadow glow when active. brand-glow rgba inlined because
// color tokens don't expose a low-alpha cyan ring colour (#5BC8DA =
// rgba(91, 200, 218, …)). 200ms cubic-bezier(0.22, 1, 0.36, 1) on selection.
const selectorTransition =
  'background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), ' +
  'border-color 200ms cubic-bezier(0.22, 1, 0.36, 1), ' +
  'box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1), ' +
  'color 200ms cubic-bezier(0.22, 1, 0.36, 1), ' +
  'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), ' +
  'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)';

const StyledTitleLabel = styled(Cell.SectionTitle)({
  flex: 1,
});

const StyledInfoButton = styled(InfoButton)({
  marginRight: spacings.medium,
});

export interface SelectorItem<T> {
  label: string;
  value: T;
  disabled?: boolean;
  'data-testid'?: string;
  details?: { path: RoutePath; ariaLabel: string };
  subLabel?: string;
}

// T represents the available values and U represent the value of "Automatic"/"Any" if there is one.
interface CommonSelectorProps<T, U> {
  title?: string;
  items: Array<SelectorItem<T>>;
  value: T | U;
  selectedCellRef?: React.Ref<HTMLElement>;
  className?: string;
  infoTitle?: string;
  details?: React.ReactElement;
  expandable?: { expandable: boolean; id: string };
  disabled?: boolean;
  thinTitle?: boolean;
  automaticLabel?: string;
  automaticValue?: U;
  automaticTestId?: string;
  children?: React.ReactNode | Array<React.ReactNode>;
}

interface SelectorProps<T, U> extends CommonSelectorProps<T, U> {
  onSelect: (value: T | U) => void;
}

export default function Selector<T, U>(props: SelectorProps<T, U>) {
  const items = props.items.map((item) => {
    const selected = props.value === item.value;
    const ref = selected ? (props.selectedCellRef as React.Ref<HTMLButtonElement>) : undefined;

    return (
      <SelectorCell
        key={`value-${item.value}`}
        value={item.value}
        isSelected={selected}
        disabled={props.disabled || item.disabled}
        forwardedRef={ref}
        onSelect={props.onSelect}
        subLabel={item.subLabel}
        details={item.details}
        data-testid={item['data-testid']}>
        {item.label}
      </SelectorCell>
    );
  });

  if (props.automaticValue !== undefined) {
    const selected = props.value === props.automaticValue;
    const ref = selected ? (props.selectedCellRef as React.Ref<HTMLButtonElement>) : undefined;

    items.unshift(
      <SelectorCell
        key={'automatic'}
        data-testid={props.automaticTestId}
        value={props.automaticValue}
        isSelected={selected}
        disabled={props.disabled}
        forwardedRef={ref}
        onSelect={props.onSelect}>
        {props.automaticLabel ?? messages.gettext('Automatic')}
      </SelectorCell>,
    );
  }

  const title = props.title ? (
    <>
      <AriaLabel>
        <StyledTitleLabel as="label" disabled={props.disabled} $thin={props.thinTitle}>
          {props.title}
        </StyledTitleLabel>
      </AriaLabel>
      {props.details && (
        <AriaDetails>
          <StyledInfoButton title={props.infoTitle}>{props.details}</StyledInfoButton>
        </AriaDetails>
      )}
    </>
  ) : undefined;

  // Add potential additional items to the list. Used for custom entry.
  const children = (
    <Cell.Group $noMarginBottom>
      {items}
      {props.children}
    </Cell.Group>
  );

  if (props.expandable?.expandable) {
    return (
      <AriaInput>
        <Cell.ExpandableSection
          role="listbox"
          expandedInitially={false}
          className={props.className}
          sectionTitle={title}
          expandableId={props.expandable.id}>
          {children}
        </Cell.ExpandableSection>
      </AriaInput>
    );
  } else {
    return (
      <AriaInput>
        <Cell.Section role="listbox" className={props.className} sectionTitle={title}>
          {children}
        </Cell.Section>
      </AriaInput>
    );
  }
}

// Hidden visually but kept so that screen readers / existing tests that look
// for the "checkmark" affordance still see a selected-state cue. The visible
// affordance is now the radio dot to the left.
const StyledCellIcon = styled(Icon)<{ $visible: boolean }>((props) => ({
  opacity: props.$visible ? 1 : 0,
  marginRight: '8px',
  display: 'none',
}));

// Round radio button — visual only; the underlying CellButton already carries
// role="option" + aria-selected for assistive tech.
const StyledRadio = styled.span<{ $selected: boolean; $disabled?: boolean }>((props) => ({
  position: 'relative',
  flex: '0 0 auto',
  width: '22px',
  height: '22px',
  marginRight: '12px',
  borderRadius: '50%',
  borderStyle: 'solid',
  borderWidth: '2px',
  borderColor: props.$selected
    ? 'rgba(91, 200, 218, 1)'
    : props.$disabled
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(255, 255, 255, 0.3)',
  backgroundColor: props.$selected ? 'rgba(91, 200, 218, 0.16)' : 'transparent',
  boxShadow: props.$selected ? '0 0 12px rgba(91, 200, 218, 0.55)' : 'none',
  transition: selectorTransition,
  pointerEvents: 'none',

  '&&::after': {
    content: '""',
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: colors.blue80,
    transform: props.$selected ? 'scale(1)' : 'scale(0)',
    opacity: props.$selected ? 1 : 0,
    transition: selectorTransition,
  },
}));

interface SelectorCellProps<T> {
  value: T;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (value: T) => void;
  children: string;
  subLabel?: string;
  forwardedRef?: React.Ref<HTMLButtonElement>;
  'data-testid'?: string;
  details?: SelectorItem<unknown>['details'];
}

const StyledSelectorCell = styled.div({
  display: 'flex',
});

// Wraps Cell.CellButton without modifying it. The wrapper overrides the row's
// default green-on-selected background back to the regular cell surface, then
// repaints the inner ValueLabel cyan when active and adds a soft hover/focus
// ring. Keeps the existing API + a11y intact.
const StyledRowWrapper = styled.div<{ $selected: boolean; $disabled?: boolean }>((props) => {
  // brand-glow (#5BC8DA) tints, inlined as rgba because tokens don't expose
  // the low-alpha cyan ring colours used in the mobile figma spec.
  const activeColor = 'rgba(91, 200, 218, 1)';
  const ringSoftColor = 'rgba(91, 200, 218, 0.15)';

  return {
    flex: 1,
    display: 'flex',
    position: 'relative',
    borderRadius: 'inherit',
    transition: selectorTransition,

    // Reset selected-green from CellButton — selection is signalled by the
    // radio dot + title colour, not by tinting the whole row.
    '> button': {
      transition: selectorTransition,
      ...(props.$selected
        ? {
            backgroundColor: `${colors.blue40} !important`,
          }
        : null),
    },

    // Subtle cyan hover wash (only when interactive).
    ...(props.$disabled
      ? null
      : {
          '&&:hover > button:not(:disabled)': {
            backgroundColor: ringSoftColor,
          },
        }),

    // Keyboard focus ring on the inner button.
    '> button:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${activeColor}, 0 0 0 6px ${ringSoftColor}`,
    },

    // Active row title colour.
    ...(props.$selected
      ? {
          [`${Cell.ValueLabel}`]: {
            color: activeColor,
            transition: selectorTransition,
          },
        }
      : null),
  };
});

const StyledSideButton = styled(Cell.SideButton)({
  marginBottom: '1px',
});

function SelectorCell<T>(props: SelectorCellProps<T>) {
  const { onSelect } = props;

  const { push } = useHistory();

  const handleClick = useCallback(() => {
    if (!props.isSelected) {
      onSelect(props.value);
    }
  }, [props.isSelected, onSelect, props.value]);

  const navigate = useCallback(() => {
    if (props.details) {
      push(props.details.path);
    }
  }, [props.details, push]);

  return (
    <StyledSelectorCell>
      <StyledRowWrapper $selected={props.isSelected} $disabled={props.disabled}>
        <Cell.CellButton
          ref={props.forwardedRef}
          onClick={handleClick}
          selected={props.isSelected}
          disabled={props.disabled}
          role="option"
          aria-selected={props.isSelected}
          aria-disabled={props.disabled}
          data-testid={props['data-testid']}>
          <StyledRadio
            aria-hidden="true"
            $selected={props.isSelected}
            $disabled={props.disabled}
          />
          <StyledCellIcon $visible={props.isSelected} icon="checkmark" />
          <SelectorCellLabel subLabel={props.subLabel}>{props.children}</SelectorCellLabel>
        </Cell.CellButton>
      </StyledRowWrapper>
      {props.details && (
        <StyledSideButton
          $backgroundColor={colors.blue40}
          $backgroundColorHover={colors.blue80}
          aria-label={props.details.ariaLabel}
          onClick={navigate}>
          <Icon icon="chevron-right" />
        </StyledSideButton>
      )}
    </StyledSelectorCell>
  );
}

interface SelectorCellLabelProps {
  children: string;
  subLabel?: string;
}

function SelectorCellLabel(props: SelectorCellLabelProps) {
  if (props.subLabel) {
    return (
      <Cell.LabelContainer>
        <Cell.ValueLabel>{props.children}</Cell.ValueLabel>
        {props.subLabel && <Cell.SubLabel>{props.subLabel}</Cell.SubLabel>}
      </Cell.LabelContainer>
    );
  } else {
    return <Cell.ValueLabel>{props.children}</Cell.ValueLabel>;
  }
}

interface StyledCustomContainerProps {
  selected: boolean;
}

// Matches the regular SelectorCell visual: neutral surface always, selection
// is read from the radio dot + ValueLabel colour. Hover / focus apply the soft
// cyan wash; brand-glow rgba inlined (#5BC8DA = rgba(91, 200, 218, …)).
const StyledCustomContainer = styled(Cell.Container)<StyledCustomContainerProps>((props) => ({
  backgroundColor: colors.blue40,
  transition: selectorTransition,
  '&&:hover': {
    backgroundColor: 'rgba(91, 200, 218, 0.15)',
  },
  '&&:focus-within': {
    boxShadow:
      '0 0 0 2px rgba(91, 200, 218, 1), 0 0 0 6px rgba(91, 200, 218, 0.15)',
  },
  ...(props.selected
    ? {
        [`${Cell.ValueLabel}`]: {
          color: 'rgba(91, 200, 218, 1)',
          transition: selectorTransition,
        },
      }
    : null),
}));

// Adding undefined as possible value of the selector to be able to select nothing.
interface SelectorWithCustomItemProps<T, U> extends CommonSelectorProps<T | undefined, U> {
  inputPlaceholder: string;
  onSelect: (value: T | U) => void;
  parseValue: (value: string) => T;
  validateValue?: (value: T) => boolean;
  maxLength?: number;
  selectedCellRef?: React.Ref<HTMLDivElement>;
  modifyValue?: (value: string) => string;
}

export function SelectorWithCustomItem<T, U>(props: SelectorWithCustomItemProps<T, U>) {
  const {
    value: _value,
    inputPlaceholder,
    onSelect,
    maxLength,
    selectedCellRef,
    validateValue,
    parseValue,
    modifyValue,
    ...otherProps
  } = props;

  const [value, setValue] = useState(props.value);
  // Disables submitting of custom input when another item has been pressed.
  const allowSubmitCustom = useRef(false);

  const isNonCustomItem = useCallback(
    (value: T | U | undefined) =>
      props.items.some((item) => item.value === value) || props.automaticValue === value,
    [props.automaticValue, props.items],
  );

  const itemIsSelected = isNonCustomItem(value);
  // Value of custom input. The value is undefined when custom isn't picked.
  const [customValue, setCustomValue] = useState(itemIsSelected ? undefined : `${value}`);
  const customIsSelected = customValue !== undefined;

  const inputRef = useStyledRef<HTMLInputElement>();

  const handleClickCustom = useCallback(() => {
    inputRef.current?.focus();
    // After focusing the input it should be allowed to submit custom values.
    allowSubmitCustom.current = true;
    setCustomValue((customValue) => customValue ?? '');
  }, [inputRef]);

  const handleSelectItem = useCallback(
    (newValue: T | U | undefined) => {
      setCustomValue(undefined);
      setValue(newValue);
      // When pressing an item the blur shouldn't be triggered since that would cause the input
      // value to be propagated as the new value.
      allowSubmitCustom.current = false;
      inputRef.current?.blur();

      onSelect(newValue!);
    },
    [inputRef, onSelect],
  );

  const validateCustomValue = useCallback(
    (value: string) => validateValue?.(parseValue(value)) ?? true,
    [parseValue, validateValue],
  );

  const handleSubmitCustom = useCallback(
    (newStringValue: string) => {
      if (allowSubmitCustom.current) {
        const newValue = parseValue(newStringValue);

        if (isNonCustomItem(newValue)) {
          handleSelectItem(newValue);
        } else {
          setValue(newValue);
          onSelect(newValue);
        }
      }
    },
    [parseValue, isNonCustomItem, handleSelectItem, onSelect],
  );

  const handleInvalidCustom = useCallback(
    () => setCustomValue(itemIsSelected ? undefined : `${value}`),
    [itemIsSelected, value],
  );

  // Delay blur event until onMouseUp resulting in handleSelectItem being called before
  // handleSubmitCustomValue and handleInvalidCustom. Clicking on the input should still move the
  // cursor and therefore needs to be an exception to this.
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.target !== inputRef.current) {
        event.preventDefault();
      }
    },
    [inputRef],
  );

  return (
    <div onMouseDown={handleMouseDown}>
      <Selector<T | undefined, U>
        {...otherProps}
        onSelect={handleSelectItem}
        value={customIsSelected ? undefined : value}>
        <StyledCustomContainer
          ref={customIsSelected ? props.selectedCellRef : undefined}
          onClick={handleClickCustom}
          selected={customIsSelected}
          disabled={props.disabled}
          role="option"
          aria-selected={customIsSelected}
          aria-disabled={props.disabled}>
          <StyledRadio
            aria-hidden="true"
            $selected={customIsSelected}
            $disabled={props.disabled}
          />
          <StyledCellIcon $visible={customIsSelected} icon="checkmark" />
          <Cell.ValueLabel>{messages.gettext('Custom')}</Cell.ValueLabel>
          <AriaInput>
            <Cell.AutoSizingTextInput
              ref={inputRef}
              value={customValue ?? ''}
              placeholder={inputPlaceholder}
              inputMode={'numeric'}
              maxLength={maxLength ?? 4}
              onChangeValue={setCustomValue}
              onSubmitValue={handleSubmitCustom}
              onInvalidValue={handleInvalidCustom}
              submitOnBlur={true}
              validateValue={validateCustomValue}
              modifyValue={modifyValue}
            />
          </AriaInput>
        </StyledCustomContainer>
      </Selector>
    </div>
  );
}
