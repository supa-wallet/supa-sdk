import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${({ theme }) => theme.colors.bg.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    min-height: 100vh;
    line-height: 1.5;
    transition: background-color 250ms ease, color 250ms ease;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  code, pre {
    font-family: ${({ theme }) => theme.fonts.mono};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bg.secondary};
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.hover};
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.muted};
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }

  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

