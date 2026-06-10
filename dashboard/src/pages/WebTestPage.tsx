import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, Chip, Divider, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
} from '@mui/material';
import WebIcon from '@mui/icons-material/Web';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { runWebTest } from '../api/executions';
import { getEnvironments } from '../api/environments';
import type { Environment } from '../api/environments';

export default function WebTestPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedEnvId, setSelectedEnvId] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEnvs, setLoadingEnvs] = useState(true);
  const [result, setResult] = useState<{ jobId: string; executionId: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEnvironments()
      .then(setEnvironments)
      .finally(() => setLoadingEnvs(false));
  }, []);

  const getUrl = () => {
    if (useCustomUrl) return customUrl;
    const env = environments.find(e => String(e.id) === selectedEnvId);
    return env?.webUrl || '';
  };

  const handleRun = async () => {
    if (!username || !password) {
      setError('Please enter your username and password');
      return;
    }
    if (!getUrl()) {
      setError('Please select an environment or enter a custom URL');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const selectedEnv = environments.find(e => String(e.id) === selectedEnvId);
      const response = await runWebTest({
        username,
        password,
        url: getUrl(),
        environment: selectedEnv?.name || 'Custom',
      });
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
          backgroundColor: '#C6282815',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#C62828',
        }}>
          <WebIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Web Tests</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>Playwright — Chromium</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Card sx={{ maxWidth: 580 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Run a web test
          </Typography>

          {/* Environment selector */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1 }}>
            ENVIRONMENT
          </Typography>

          {loadingEnvs ? (
            <CircularProgress size={20} sx={{ mb: 2 }} />
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {environments.map((env) => (
                <Chip
                  key={env.id}
                  label={env.name}
                  onClick={() => { setSelectedEnvId(String(env.id)); setUseCustomUrl(false); }}
                  color={selectedEnvId === String(env.id) && !useCustomUrl ? 'primary' : 'default'}
                  variant={selectedEnvId === String(env.id) && !useCustomUrl ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
              <Chip
                label="Custom URL"
                onClick={() => { setUseCustomUrl(true); setSelectedEnvId(''); }}
                color={useCustomUrl ? 'primary' : 'default'}
                variant={useCustomUrl ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          )}

          {useCustomUrl && (
            <TextField
              label="Custom URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              fullWidth size="small" sx={{ mb: 2 }}
              placeholder="https://your-app-url.com"
            />
          )}

          {selectedEnvId && !useCustomUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              URL: {environments.find(e => String(e.id) === selectedEnvId)?.webUrl}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Credentials */}
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
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Check History to see results when complete.</Typography>
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
              backgroundColor: '#C62828',
              '&:hover': { backgroundColor: '#B71C1C' },
            }}
          >
            {loading ? 'Queuing test...' : 'Run Web Test'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}