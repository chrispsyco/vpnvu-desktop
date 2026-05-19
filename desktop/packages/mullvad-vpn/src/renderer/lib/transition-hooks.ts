import { Location } from 'history';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ViewTransition } from '../../../types/global';
import { LocationState } from '../../shared/ipc-types';
import { useAppContext } from '../context';
import { TransitionType, useHistory } from '../lib/history';
import { useEffectEvent } from './utility-hooks';

type QueueItem = { location: Location<LocationState>; transition: TransitionType };

const viewTransitionRef: { current?: ViewTransition } = {};

export function useAfterTransition() {
  const runAfterTransition = useCallback((fn: () => void) => {
    if (viewTransitionRef.current) {
      void viewTransitionRef.current.finished.then(() => runAfterTransition(fn));
    } else {
      fn();
    }
  }, []);

  return runAfterTransition;
}

export function useViewTransitions(onTransition?: () => void): Location<LocationState> {
  const history = useHistory();
  const [currentLocation, setCurrentLocation] = useState(history.location);
  const queuedLocationRef = useRef<QueueItem>(undefined);
  const { setNavigationHistory } = useAppContext();

  const updateView = useEffectEvent((location: Location<LocationState>) => {
    setCurrentLocation(location);
    setNavigationHistory(history.asObject);
  });

  const onTransitionEnd = useEffectEvent((location: Location<LocationState>) => {
    if (window.env.e2e) {
      window.e2e.location = location.pathname;
    }

    onTransition?.();
  });

  const transitionToView = useEffectEvent(
    (location: Location<LocationState>, _transition: TransitionType) => {
      // Skip the View Transitions snapshot animation entirely. The snapshot
      // pair leaves a visible "middle frame" where old and new sit side by
      // side at partial transforms, which reads as a flash on the 405x720
      // viewport. Each view's <PageTransition> still runs its own component-
      // level entrance (opacity + small slide) for polish.
      updateView(location);
      setTimeout(() => onTransitionEnd(location));
    },
  );

  useEffect(() => {
    // React throttles updates, so it's impossible to capture the intermediate navigation without
    // listening to the history directly.
    const unobserveHistory = history.listen((location, _, transition) => {
      if (viewTransitionRef.current === undefined) {
        transitionToView(location, transition);
      } else {
        queuedLocationRef.current = { location, transition };
      }
    });

    return () => {
      unobserveHistory?.();
    };
    // These lint rules are disabled for now because the react plugin for eslint does
    // not understand that useEffectEvent should not be added to the dependency array.
    // Enable these rules again when eslint can lint useEffectEvent properly.
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return currentLocation;
}

