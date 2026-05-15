import { motion, type Transition, useReducedMotion } from 'motion/react';
import React from 'react';
import styled from 'styled-components';

/**
 * Direction of the slide for the entrance animation.
 *
 * - `forward` (default): slides in from the right (+12px → 0).
 * - `backward`: slides in from the left (−8px → 0). Use for "pop"/back navigation.
 * - `none`: fade only, no translation. Equivalent to reduced-motion behavior.
 */
export type PageTransitionDirection = 'forward' | 'backward' | 'none';

export interface PageTransitionProps {
  children: React.ReactNode;
  /** Direction of the slide. Defaults to `forward`. */
  direction?: PageTransitionDirection;
  /** Optional delay before entrance, in seconds. Defaults to `0`. */
  delay?: number;
  /** Optional className for layout overrides. */
  className?: string;
}

// Standard PSYCO ease curve — quick out, soft settle.
const PSYCO_EASE: Transition['ease'] = [0.22, 1, 0.36, 1];
const DURATION_S = 0.24;

const offsetForDirection = (direction: PageTransitionDirection): number => {
  switch (direction) {
    case 'forward':
      return 12;
    case 'backward':
      return -8;
    case 'none':
    default:
      return 0;
  }
};

const Root = styled(motion.div)`
  display: contents;
`;

/**
 * Wraps a view (or any UI region) with a subtle entrance animation that runs
 * once on mount: opacity 0 → 1 plus a small horizontal slide.
 *
 * Composes cleanly with the native View Transitions API already used at the
 * router level (`useViewTransitions`) — that handles the cross-fade between
 * route snapshots; this adds an extra polish layer for the *new* view's
 * content.
 *
 * Respects `prefers-reduced-motion: reduce` via Motion's `useReducedMotion`
 * (which honors the project-wide `<MotionConfig reducedMotion="user" />` set
 * in `app.tsx`). When reduced motion is requested, only opacity animates.
 *
 * @example
 * ```tsx
 * export function MyView() {
 *   return (
 *     <PageTransition>
 *       <View backgroundColor="darkBlue">...</View>
 *     </PageTransition>
 *   );
 * }
 * ```
 *
 * @remarks
 * Does NOT replace the router-level transition — both run together by design.
 * Drop into any view's render root. Keep it outside `<View>` if possible so
 * `display: contents` does not interfere with layout (default behavior).
 */
export function PageTransition({
  children,
  direction = 'forward',
  delay = 0,
  className,
}: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = shouldReduceMotion ? 0 : offsetForDirection(direction);

  return (
    <Root
      className={className}
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: DURATION_S,
        ease: PSYCO_EASE,
        delay,
      }}>
      {children}
    </Root>
  );
}

// TODO(state-transitions): connection-state flash glow.
// When `state.connection.status` transitions disconnected → connecting →
// connected, briefly animate an inset box-shadow (e.g. green/cyan glow at
// 0.08 alpha, 600ms ease-out, then back to 0). Implement via a sibling
// component (e.g. `<ConnectionStateGlow />`) that listens to redux and
// overlays the viewport. Out of scope for this batch since AppMainHeader.tsx
// and MainView.tsx are owned by another agent.
