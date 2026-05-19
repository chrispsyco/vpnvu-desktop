import React from 'react';

import { useHistory } from '../../../lib/history';
import { isPlatform } from '../../../utils';
import { BackActionFn } from '../KeyboardNavigation';

export function useHandleKeyDown(backAction: BackActionFn | undefined) {
  const { pop } = useHistory();
  const isMacOS = isPlatform('darwin');

  return React.useCallback(
    (event: KeyboardEvent) => {
      const modifierKey = isMacOS ? event.metaKey : event.altKey;
      // Escape pops to the previous view when no other modifier is held and
      // the focus isn't currently inside an editable field — typing Esc in
      // an input should cancel the field interaction, not navigate away.
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (
        event.key === 'Escape' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !isEditable
      ) {
        // Prefer the view-scoped back action if one is registered (lets a
        // view cancel a modal instead of popping the router). If no view
        // registered one, fall back to history.pop() so Esc still feels
        // global. We bail out for the root routes (launch / login / main /
        // expired) — there's nowhere to pop to and pop() would no-op anyway,
        // but the explicit guard keeps intent obvious.
        if (backAction) {
          backAction();
        } else {
          pop();
        }
        return;
      }
      if ((event.key === '[' || event.key === 'ArrowLeft') && modifierKey) {
        backAction?.();
      } else if (window.env.development) {
        if (event.key === 'h' && event.shiftKey && modifierKey) {
          pop(true);
        }
      }
    },
    [isMacOS, backAction, pop],
  );
}
