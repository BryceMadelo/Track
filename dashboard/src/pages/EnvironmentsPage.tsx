import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Divider, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { getEnvironments, createEnvironment, deleteEnvironment } from '../api/environments';
import type { Environment } from '../api/environments';

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    webUrl: '',
    apiUrl: '',
  });

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const data = await getEnvironments();
      setEnvironments(data);
    } catch {
      setError('Failed to load environments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.webUrl) {
      setError('Name and Web URL are required');
      return;
    }
    try {
      await createEnvironment(form);
      setSuccess('Environment created');
      setOpenDialog(false);
      setForm({ name: '', description: '', webUrl: '', apiUrl: '' });
      loadEnvironments();
    } catch {
      setError('Failed to create environment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this environment?')) return;
    try {
      await deleteEnvironment(id);
      setSuccess('Environment deleted');
      loadEnvironments();
    } catch {
      setError('Failed to delete environment');
    }
  };

  const envColors: Record<string, string> = {
    Staging: '#1565C0',
    Prebau: '#F57C00',
    Production: '#C62828',
    Development: '#2E7D32',
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            backgroundColor: '#1565C015',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1565C0',
          }}>
            <SettingsIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Environments</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Manage test environments
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Environment
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Web URL</strong></TableCell>
                <TableCell><strong>API URL</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading...</TableCell>
                </TableRow>
              ) : environments.map((env) => (
                <TableRow key={env.id} hover>
                  <TableCell>
                    <Chip
                      label={env.name}
                      size="small"
                      sx={{
                        backgroundColor: (envColors[env.name] || '#1565C0') + '15',
                        color: envColors[env.name] || '#1565C0',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, maxWidth: 300 }} noWrap>
                      {env.webUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }} color="text.secondary">
                      {env.apiUrl || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }} color="text.secondary">
                      {env.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(env.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>New Environment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Name (e.g. Staging, Prebau, Production)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth size="small" sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Web URL"
            value={form.webUrl}
            onChange={(e) => setForm({ ...form, webUrl: e.target.value })}
            fullWidth size="small" sx={{ mb: 2 }}
            placeholder="https://your-app.com"
          />
          <TextField
            label="API URL (optional)"
            value={form.apiUrl}
            onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
            fullWidth size="small" sx={{ mb: 2 }}
            placeholder="https://api.your-app.com"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth size="small" multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}