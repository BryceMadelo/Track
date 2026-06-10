import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MobileTestPage from './pages/MobileTestPage';
import WebTestPage from './pages/WebTestPage';
import HistoryPage from './pages/HistoryPage';
import TestCasesPage from './pages/TestCasesPage';
import TestSuitesPage from './pages/TestSuitesPage';
import EnvironmentsPage from './pages/EnvironmentsPage';
import TestConverterPage from './pages/TestConverterPage';
import SchedulesPage from './pages/SchedulesPage';
import BugTrackerPage from './pages/BugTrackerPage';
import VisualTestBuilderPage from './pages/VisualTestBuilderPage';

function AppLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          p: 4,
          overflow: 'auto',
          minHeight: '100vh',
          width: 'calc(100vw - 240px)',
        }}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mobile" element={<MobileTestPage />} />
          <Route path="/web" element={<WebTestPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/test-cases" element={<TestCasesPage />} />
          <Route path="/test-suites" element={<TestSuitesPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/test-converter" element={<TestConverterPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/bugs" element={<BugTrackerPage />} />
          <Route path="/visual-builder" element={<VisualTestBuilderPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}