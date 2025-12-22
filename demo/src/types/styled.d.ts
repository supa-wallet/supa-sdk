import 'styled-components';
import type { darkTheme } from '../ui/theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof darkTheme.colors;
    fonts: typeof darkTheme.fonts;
    radii: typeof darkTheme.radii;
    shadows: typeof darkTheme.shadows;
    transitions: typeof darkTheme.transitions;
    space: typeof darkTheme.space;
  }
}

