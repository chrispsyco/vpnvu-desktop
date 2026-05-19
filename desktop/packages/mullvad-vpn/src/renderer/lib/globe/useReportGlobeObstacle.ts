import { RefObject, useEffect } from 'react';

import {
  clearGlobeObstacle,
  reportGlobeObstacle,
  setGlobeViewportHeight,
} from './globe-viewport';

/**
 * Watches the size of a UI element that overlaps the globe (notification
 * banner at the top, connection panel at the bottom) and feeds its current
 * height into the globe-viewport store. The globe focus tilts to keep the
 * active pin inside the visible band.
 *
 * `obstacleRef` is the overlay element (notif banner / panel). `containerRef`
 * is the globe canvas container — we report the obstacle's intrusion relative
 * to that container, so margins between the overlay and the container edge
 * are accounted for. The container's own height is published to the same
 * store so consumers can normalise obstacle heights.
 */
export function useReportGlobeObstacle(
  obstacleRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  position: 'top' | 'bottom',
): void {
  useEffect(() => {
    const obstacle = obstacleRef.current;
    const container = containerRef.current;
    if (!container) {
      clearGlobeObstacle(position);
      return;
    }

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      setGlobeViewportHeight(containerRect.height);

      if (!obstacleRef.current) {
        clearGlobeObstacle(position);
        return;
      }
      const elRect = obstacleRef.current.getBoundingClientRect();
      // Treat zero-area elements (mid-fade in/out) as absent so the focus
      // doesn't snap into the wrong target during a transition.
      if (elRect.width === 0 || elRect.height === 0) {
        clearGlobeObstacle(position);
        return;
      }
      const height =
        position === 'top'
          ? elRect.bottom - containerRect.top
          : containerRect.bottom - elRect.top;
      reportGlobeObstacle(position, Math.max(0, height));
    };

    const ro = new ResizeObserver(update);
    ro.observe(container);
    if (obstacle) ro.observe(obstacle);
    update();

    return () => {
      ro.disconnect();
      clearGlobeObstacle(position);
    };
  }, [obstacleRef, containerRef, position]);
}
