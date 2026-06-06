import { createContext, ReactNode, useContext } from 'react';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';

export type Theme = typeof colors & {
  typography: typeof typography;
  spacing: typeof spacing;
};

const theme: Theme = {
  ...colors,
  typography,
  spacing,
};

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
