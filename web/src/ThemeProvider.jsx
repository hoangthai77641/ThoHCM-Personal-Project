import React, { createContext, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from './theme';

// Context để quản lý theme mode (chỉ sử dụng dark theme)
const ThemeContext = createContext({
  mode: 'dark',
});

export const useThemeMode = () => useContext(ThemeContext);

/**
 * Theme Provider cho Material UI
 * Bọc toàn bộ app để áp dụng theme (chỉ sử dụng dark theme)
 */
export function ThemeProvider({ children }) {
  // Cố định sử dụng dark theme
  const mode = 'dark';

  const theme = useMemo(() => {
    return darkTheme;
  }, []);

  const contextValue = useMemo(() => ({
    mode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Reset CSS và apply theme background */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
