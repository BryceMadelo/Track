import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1E88E5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
    },
    error: {
      main: '#C62828',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: 10,
        },
      },
    },
  },
});