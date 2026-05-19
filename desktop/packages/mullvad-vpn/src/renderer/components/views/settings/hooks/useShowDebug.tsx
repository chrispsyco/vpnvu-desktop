export const useShowDebug = () => {
  // Surface the Developer tools entry in mock test builds too, not just dev,
  // so we can reach Preview routes (privacy disclaimer, etc.) without rebuilding.
  // Intentionally NOT `e2e` — that flag also disables the globe Canvas, which
  // breaks the manual QA we're trying to enable here.
  return window.env.development || window.env.mock;
};
