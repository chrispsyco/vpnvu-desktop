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

  body {
    background-color: ${colors.darkBlue};
    background-image:
      radial-gradient(ellipse 600px 400px at 20% 15%, rgba(9, 158, 180, 0.10), transparent 60%),
      radial-gradient(ellipse 400px 300px at 90% 85%, rgba(91, 200, 218, 0.06), transparent 60%);
    background-attachment: fixed;
    font-family: "Geist", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    -webkit-app-region: drag;
  }

  button, a, input, textarea, select, [role="button"], [role="link"], [data-no-drag] {
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
