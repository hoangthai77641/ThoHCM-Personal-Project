import { createTheme } from '@mui/material/styles';

/**
 * Material UI Theme Configuration
 * Tùy chỉnh theme cho ThoHCM
 */

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0ea5e9', // sky-500
      light: '#38bdf8', // sky-400
      dark: '#0284c7', // sky-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b', // slate-500
      light: '#94a3b8', // slate-400
      dark: '#475569', // slate-600
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#64748b', // slate-500
    },
    error: {
      main: '#ef4444', // red-500
    },
    warning: {
      main: '#f59e0b', // amber-500
    },
    success: {
      main: '#10b981', // emerald-500
    },
    info: {
      main: '#3b82f6', // blue-500
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Không uppercase buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Bo góc mặc định
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)', // Custom shadow
    '0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.08)',
    '0 4px 6px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.1)',
    '0 8px 12px rgba(0,0,0,0.12), 0 20px 40px rgba(0,0,0,0.12)',
    ...Array(20).fill('none'), // Fill remaining shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // sky-400 (lighter for better contrast)
      light: '#7dd3fc', // sky-300
      dark: '#0ea5e9', // sky-500
      contrastText: '#0f172a',
    },
    secondary: {
      main: '#94a3b8', // slate-400
      light: '#cbd5e1', // slate-300
      dark: '#64748b', // slate-500
      contrastText: '#0f172a',
    },
    background: {
      default: '#0f172a', // slate-900
      paper: '#1e293b', // slate-800
    },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#94a3b8', // slate-400
    },
    error: {
      main: '#f87171', // red-400
    },
    warning: {
      main: '#fbbf24', // amber-400
    },
    success: {
      main: '#34d399', // emerald-400
    },
    info: {
      main: '#60a5fa', // blue-400
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    '0 6px 8px -1px rgba(0, 0, 0, 0.35), 0 4px 6px -1px rgba(0, 0, 0, 0.25)',
    '0 8px 12px -1px rgba(0, 0, 0, 0.4), 0 6px 8px -1px rgba(0, 0, 0, 0.3)',
    '0 12px 16px -1px rgba(0, 0, 0, 0.45), 0 8px 12px -1px rgba(0, 0, 0, 0.35)',
    ...Array(20).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.35), 0 4px 6px -1px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

// Export default theme (light)
export default lightTheme;
