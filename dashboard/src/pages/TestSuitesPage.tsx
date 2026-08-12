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
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { getTestSuites, createTestSuite, type TestSuite } from '../api/testSuites';
import { getTestCases, type TestCase } from '../api/testCases';

const typeColors: Record<string, string> = {
  smoke: '#F57C00',
  regression: '#1565C0',
  sanity: '#2E7D32',
  release: '#C62828',
};

export default function TestSuitesPage() {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCaseIds, setSelectedCaseIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'regression',
  });

  const loadData = async () => {
    try {
      const [suitesData, casesData] = await Promise.all([
        getTestSuites(),
        getTestCases(),
      ]);
      setSuites(suitesData);
      setTestCases(casesData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);
  const handleCreate = async () => {
    if (!form.name) {
      setError('Name is required');
      return;
    }
    try {
      await createTestSuite({
        ...form,
        type: form.type as TestSuite['type'],
        testCaseIds: selectedCaseIds,
      });
      setSuccess('Test suite created successfully');
      setOpenDialog(false);
      setForm({ name: '', description: '', type: 'regression' });
      setSelectedCaseIds([]);
      loadData();
    } catch {
      setError('Failed to create test suite');
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
            <FolderIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Test Suites</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {suites.length} suites total
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Suite
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
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Test Cases</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading...</TableCell>
                </TableRow>
              ) : suites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No test suites yet. Click "New Suite" to create one.
                  </TableCell>
                </TableRow>
              ) : suites.map((suite) => (
                <TableRow key={suite.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{suite.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={suite.type.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: typeColors[suite.type] + '15',
                        color: typeColors[suite.type],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${suite.testCases?.length || 0} cases`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary" noWrap sx={{ maxWidth: 300, fontSize: 13 }}>
                      {suite.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
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
        <DialogTitle sx={{ fontWeight: 600 }}>New Test Suite</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Suite Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth size="small" sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth size="small" multiline rows={2} sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Suite Type</InputLabel>
            <Select value={form.type} label="Suite Type"
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="smoke">Smoke</MenuItem>
              <MenuItem value="regression">Regression</MenuItem>
              <MenuItem value="sanity">Sanity</MenuItem>
              <MenuItem value="release">Release Validation</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Add Test Cases</InputLabel>
            <Select
              multiple
              value={selectedCaseIds}
              label="Add Test Cases"
              onChange={(e) => setSelectedCaseIds(e.target.value as number[])}
              renderValue={(selected) => `${(selected as number[]).length} selected`}
            >
              {testCases.map((tc) => (
                <MenuItem key={tc.id} value={tc.id}>
                  TC-{String(tc.id).padStart(3, '0')} — {tc.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Suite</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}