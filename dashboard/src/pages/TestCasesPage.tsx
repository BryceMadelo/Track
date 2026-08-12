import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Alert, Divider,
  IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getTestCases, createTestCase, deleteTestCase } from '../api/testCases';
import type { TestCase } from '../api/testCases';

const platformColors: Record<string, string> = {
  web: '#1565C0',
  mobile: '#F57C00',
  api: '#2E7D32',
};

const priorityColors: Record<string, 'error' | 'warning' | 'success'> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const statusColors: Record<string, string> = {
  automated: '#2E7D32',
  manual: '#757575',
  in_progress: '#F57C00',
};

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'web',
    priority: 'medium',
    automationStatus: 'manual',
    tags: '',
    expectedResult: '',
  });

  const loadTestCases = async () => {
    try {
      const data = await getTestCases();
      setTestCases(data);
    } catch {
      setError('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTestCases();
  }, []);
  const handleCreate = async () => {
    if (!form.title) {
      setError('Title is required');
      return;
    }
    try {
      await createTestCase(form as Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>);
      setSuccess('Test case created successfully');
      setOpenDialog(false);
      setForm({ title: '', description: '', platform: 'web', priority: 'medium', automationStatus: 'manual', tags: '', expectedResult: '' });
      loadTestCases();
    } catch {
      setError('Failed to create test case');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this test case?')) return;
    try {
      await deleteTestCase(id);
      setSuccess('Test case deleted');
      loadTestCases();
    } catch {
      setError('Failed to delete test case');
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
            <AssignmentIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Test Cases</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {testCases.length} test cases total
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Test Case
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
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Platform</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Tags</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No test cases yet. Click "New Test Case" to create one.
                  </TableCell>
                </TableRow>
              ) : testCases.map((tc) => (
                <TableRow key={tc.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 12 }} color="text.secondary">TC-{String(tc.id).padStart(3, '0')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{tc.title}</Typography>
                    {tc.description && (
                      <Typography color="text.secondary" noWrap sx={{ fontSize: 12, maxWidth: 300 }}>
                        {tc.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tc.platform.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: platformColors[tc.platform] + '15',
                        color: platformColors[tc.platform],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tc.priority.toUpperCase()}
                      size="small"
                      color={priorityColors[tc.priority]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tc.automationStatus.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[tc.automationStatus] + '15',
                        color: statusColors[tc.automationStatus],
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12 }} color="text.secondary">{tc.tags || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(tc.id)}>
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
        <DialogTitle sx={{ fontWeight: 600 }}>New Test Case</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth size="small" sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth size="small" multiline rows={2} sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select value={form.platform} label="Platform"
                onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <MenuItem value="web">Web</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="api">API</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Automation Status</InputLabel>
            <Select value={form.automationStatus} label="Automation Status"
              onChange={(e) => setForm({ ...form, automationStatus: e.target.value })}>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="automated">Automated</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            fullWidth size="small" sx={{ mb: 2 }}
            placeholder="smoke, regression, login"
          />
          <TextField
            label="Expected Result"
            value={form.expectedResult}
            onChange={(e) => setForm({ ...form, expectedResult: e.target.value })}
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