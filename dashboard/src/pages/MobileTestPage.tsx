import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, Divider, CircularProgress,
} from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { runMobileTest } from '../api/executions';

export default function MobileTestPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ jobId: string; executionId: number } | null>(null);
  const [error, setError] = useState('');

  const handleRun = async () => {
    if (!username || !password) {
      setError('Please enter your username and password');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await runMobileTest({ username, password });
      setResult(response);
    } catch {
      setError('Failed to queue test. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          backgroundColor: '#1565C015',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1565C0',
        }}>
          <PhoneAndroidIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Mobile Tests</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Appium — Android (UiAutomator2)
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Card sx={{ maxWidth: 580 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Run a mobile test
          </Typography>

          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1 }}>
            DEVICE
          </Typography>
          <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
            Make sure your Android device is connected via USB with USB debugging enabled.
          </Alert>

          <Divider sx={{ mb: 2 }} />

          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1 }}>
            CREDENTIALS
          </Typography>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth size="small" sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth size="small" sx={{ mb: 3 }}
          />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {result && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Test queued! Job ID: <strong>{result.jobId}</strong> · Execution ID: <strong>{result.executionId}</strong>
              <br />
              <Typography variant="body2" sx={{ fontSize: 12, mt: 0.5 }}>Check History to see results when complete.</Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleRun}
            disabled={loading}
            sx={{
              backgroundColor: '#F57C00',
              '&:hover': { backgroundColor: '#E65100' },
            }}
          >
            {loading ? 'Queuing test...' : 'Run Mobile Test'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}