import { useState } from 'react';
import {
  Box, Card, CardContent, Typography,
  TextField, Button, Alert, InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { login, saveToken, saveUser } from '../api/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter your username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await login(username, password);
      saveToken(response.access_token);
      saveUser(response.user);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
      }}
    >
      <Card sx={{ width: 420, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
              QATrack
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
              Automation Platform
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Sign in to your account
          </Typography>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 3 }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Typography
            color="text.secondary"
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            Contact your administrator if you need access
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}