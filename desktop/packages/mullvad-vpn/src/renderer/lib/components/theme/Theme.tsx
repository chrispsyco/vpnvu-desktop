import React from 'react';
import { createGlobalStyle } from 'styled-components';

import {
  colorPrimitives,
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radius,
  spacingPrimitives,
} from '../../foundations/variables';

type VariablesProps = React.PropsWithChildren<object>;

const GlobalStyle = createGlobalStyle`
  :root {
    ${Object.entries({
      ...spacingPrimitives,
      ...colorPrimitives,
      ...radius,
      ...fontFamilies,
      ...fontSizes,
      ...fontWeights,
      ...lineHeights,
    }).reduce((styleString, [key, value]) => ({ ...styleString, [key]: value }), {})}
  }

  html, body {
    /* Window is transparent ONLY so the rounded corners of #app reveal nothing
       (no fake bg) at the four corners. The app surface itself is fully opaque. */
    background: transparent;
  }

  body {
    font-family: "Geist", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  #app {
    /* Solid cyan-dark base — no transparency. */
    background-color: ${colors.darkBlue};
    /* Cyan atmosphere mesh — top-left primary glow, bottom-right secondary, bottom-center accent. */
    background-image:
      radial-gradient(ellipse 600px 400px at 20% 15%, rgba(9, 158, 180, 0.14), transparent 60%),
      radial-gradient(ellipse 400px 300px at 90% 85%, rgba(91, 200, 218, 0.06), transparent 60%),
      radial-gradient(ellipse 300px 200px at 50% 80%, rgba(9, 158, 180, 0.05), transparent 60%);
    background-attachment: fixed;
    /* Rounded container: 16px corners + hairline + clip. */
    border-radius: 16px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  [data-app-region="drag"] {
    -webkit-app-region: drag;
  }

  [data-app-region="drag"] button,
  [data-app-region="drag"] a,
  [data-app-region="drag"] input,
  [data-app-region="drag"] [role="button"] {
    -webkit-app-region: no-drag;
  }
`;

export const Theme = ({ children }: VariablesProps) => {
  return (
    <>
      <GlobalStyle />
      {children}
    </>
  );
};
