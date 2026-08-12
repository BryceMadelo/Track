import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Divider, IconButton, Tooltip, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { getSchedules, createSchedule, toggleSchedule, deleteSchedule } from '../api/schedules';
import type { Schedule } from '../api/schedules';
import { getEnvironments } from '../api/environments';
import type { Environment } from '../api/environments';

const frequencyLabels: Record<string, string> = {
  hourly: 'Every Hour',
  daily: 'Daily at 8AM',
  weekly: 'Weekly Monday 8AM',
  custom: 'Custom',
};

const platformColors: Record<string, string> = {
  web: '#C62828',
  mobile: '#1565C0',
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    platform: 'web',
    frequency: 'daily',
    environment: '',
    url: '',
    username: '',
    password: '',
  });

  const loadData = async () => {
    try {
      const [schedulesData, envsData] = await Promise.all([
        getSchedules(),
        getEnvironments(),
      ]);
      setSchedules(schedulesData);
      setEnvironments(envsData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password) {
      setError('Name, username and password are required');
      return;
    }
    if (form.platform === 'web' && !form.url && !form.environment) {
      setError('Please select an environment or enter a URL for web tests');
      return;
    }
    try {
      const selectedEnv = environments.find(e => e.name === form.environment);
      await createSchedule({
        ...form,
        url: form.url || selectedEnv?.webUrl || '',
      });
      setSuccess('Schedule created successfully');
      setOpenDialog(false);
      setForm({ name: '', platform: 'web', frequency: 'daily', environment: '', url: '', username: '', password: '' });
      loadData();
    } catch {
      setError('Failed to create schedule');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleSchedule(id);
      loadData();
    } catch {
      setError('Failed to toggle schedule');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      setSuccess('Schedule deleted');
      loadData();
    } catch {
      setError('Failed to delete schedule');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            backgroundColor: '#1565C015',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1565C0',
          }}>
            <ScheduleIcon />
          </Box>
          <Box>
            <Typography component="h4" variant="h4" sx={{ fontWeight: 600 }}>Schedules</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Automate test runs on a schedule
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Schedule
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Alert severity="info" sx={{ mb: 3 }} icon={<ScheduleIcon />}>
        Scheduled tests run automatically in the background. Results appear in Execution History.
      </Alert>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Platform</strong></TableCell>
                <TableCell><strong>Frequency</strong></TableCell>
                <TableCell><strong>Environment</strong></TableCell>
                <TableCell><strong>Last Run</strong></TableCell>
                <TableCell><strong>Next Run</strong></TableCell>
                <TableCell><strong>Active</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Loading...</TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No schedules yet. Click "New Schedule" to automate your first test run.
                  </TableCell>
                </TableRow>
              ) : schedules.map((schedule) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{schedule.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.platform.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: platformColors[schedule.platform] + '15',
                        color: platformColors[schedule.platform],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>
                      {frequencyLabels[schedule.frequency]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {schedule.environment || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {schedule.lastRunAt
                        ? new Date(schedule.lastRunAt).toLocaleString()
                        : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {schedule.nextRunAt
                        ? new Date(schedule.nextRunAt).toLocaleString()
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.isActive}
                      onChange={() => handleToggle(schedule.id)}
                      size="small"
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(schedule.id)}>
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

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ fontWeight: 600 }}>New Schedule</Box></DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Schedule Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth size="small" sx={{ mb: 2, mt: 1 }}
            placeholder="e.g. Nightly Web Regression"
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select value={form.platform} label="Platform"
                onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <MenuItem value="web">Web</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Frequency</InputLabel>
              <Select value={form.frequency} label="Frequency"
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                <MenuItem value="hourly">Every Hour</MenuItem>
                <MenuItem value="daily">Daily at 8AM</MenuItem>
                <MenuItem value="weekly">Weekly Monday 8AM</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {form.platform === 'web' && (
            <>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Environment</InputLabel>
                <Select value={form.environment} label="Environment"
                  onChange={(e) => setForm({ ...form, environment: e.target.value, url: '' })}>
                  <MenuItem value="">Custom URL</MenuItem>
                  {environments.map(env => (
                    <MenuItem key={env.id} value={env.name}>{env.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!form.environment && (
                <TextField
                  label="Custom URL"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  fullWidth size="small" sx={{ mb: 2 }}
                  placeholder="https://your-app.com"
                />
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', mb: 1 }}>
            CREDENTIALS
          </Typography>

          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            fullWidth size="small" sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}