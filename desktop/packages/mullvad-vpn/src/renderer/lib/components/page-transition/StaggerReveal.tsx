import { motion, type Transition, useReducedMotion, type Variants } from 'motion/react';
import React from 'react';
import styled from 'styled-components';

/**
 * Stagger-reveals its direct children with a sequenced entrance:
 * each item fades + translates from `y:8 → 0` with a small delay between.
 *
 * Two integration modes:
 *
 * 1. **Auto mode** (default) — wrap children in `<StaggerReveal>` directly.
 *    Each direct child is wrapped in a `motion.div` with the item variants.
 *    Best when you don't control the children components and don't want to
 *    edit them (e.g. wrapping a list of `ListItem`s).
 *
 * 2. **Explicit mode** — use `<StaggerReveal.Item>` for each row when you
 *    need finer control (custom delays, skipping certain items, etc).
 *
 * Respects `prefers-reduced-motion` via Motion's `useReducedMotion`. When
 * reduced, the stagger collapses and only opacity animates (no translate).
 *
 * @example Auto
 * ```tsx
 * <StaggerReveal>
 *   <SettingsListItemA />
 *   <SettingsListItemB />
 *   <SettingsListItemC />
 * </StaggerReveal>
 * ```
 *
 * @example Explicit
 * ```tsx
 * <StaggerReveal mode="explicit">
 *   <StaggerReveal.Item><Row /></StaggerReveal.Item>
 *   <StaggerReveal.Item><Row /></StaggerReveal.Item>
 * </StaggerReveal>
 * ```
 */
export interface StaggerRevealProps {
  children: React.ReactNode;
  /**
   * `auto` (default): each direct child is wrapped automatically.
   * `explicit`: only `<StaggerReveal.Item>` children animate; everything
   * else renders inert.
   */
  mode?: 'auto' | 'explicit';
  /** Delay between each child, in seconds. Defaults to `0.04` (40ms). */
  staggerStep?: number;
  /** Delay before the first child starts, in seconds. Defaults to `0.05`. */
  initialDelay?: number;
  /** Optional className for layout overrides. */
  className?: string;
  /** Render as a different element (e.g. `ul`). Defaults to `div`. */
  as?: 'div' | 'ul' | 'ol' | 'section';
}

const ITEM_DURATION_S = 0.2;
const PSYCO_EASE: Transition['ease'] = [0.22, 1, 0.36, 1];

const containerVariants = (staggerStep: number, initialDelay: number): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerStep,
      delayChildren: initialDelay,
    },
  },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: ITEM_DURATION_S, ease: PSYCO_EASE },
  },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: ITEM_DURATION_S, ease: PSYCO_EASE },
  },
};

const Container = styled(motion.div)`
  display: contents;
`;

const ItemWrapper = styled(motion.div)`
  display: contents;
`;

function StaggerRevealRoot({
  children,
  mode = 'auto',
  staggerStep = 0.04,
  initialDelay = 0.05,
  className,
  as,
}: StaggerRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const effectiveStep = shouldReduceMotion ? 0 : staggerStep;
  const itemVars = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <Container
      as={as}
      className={className}
      variants={containerVariants(effectiveStep, initialDelay)}
      initial="hidden"
      animate="show">
      {mode === 'auto'
        ? React.Children.map(children, (child, idx) =>
            child == null || typeof child === 'boolean' ? null : (
              <ItemWrapper key={idx} variants={itemVars}>
                {child}
              </ItemWrapper>
            ),
          )
        : children}
    </Container>
  );
}

export interface StaggerRevealItemProps {
  children: React.ReactNode;
  className?: string;
}

function StaggerRevealItem({ children, className }: StaggerRevealItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const itemVars = shouldReduceMotion ? reducedItemVariants : itemVariants;

  return (
    <ItemWrapper className={className} variants={itemVars}>
      {children}
    </ItemWrapper>
  );
}

const StaggerRevealNamespace = Object.assign(StaggerRevealRoot, {
  Item: StaggerRevealItem,
});

export { StaggerRevealNamespace as StaggerReveal };
