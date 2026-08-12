import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody,
  Chip, Divider, Alert, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { getExecutions } from '../api/executions';
import type { Execution } from '../api/executions';

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  passed: 'success',
  failed: 'error',
  running: 'warning',
  queued: 'default',
};

const platformColors: Record<string, string> = {
  web: '#C62828',
  mobile: '#1565C0',
  api: '#2E7D32',
};

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Execution | null>(null);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const data = await getExecutions();
      setExecutions(data);
    } catch {
      setError('Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExecutions();
  }, []);
  const formatDuration = (start: string, end: string) => {
    if (!end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            backgroundColor: '#F57C0015',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F57C00',
          }}>
            <HistoryIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Executions</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {executions.length} total runs
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadExecutions}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Platform</strong></TableCell>
                <TableCell><strong>Environment</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell><strong>Started</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No executions yet. Run a web or mobile test to see results here.
                  </TableCell>
                </TableRow>
              ) : executions.map((exec) => (
                <TableRow key={exec.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 12 }} color="text.secondary">
                      #{exec.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exec.platform.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: platformColors[exec.platform] + '15',
                        color: platformColors[exec.platform],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>
                      {exec.environment || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exec.status.toUpperCase()}
                      size="small"
                      color={statusColors[exec.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>
                      {formatDuration(exec.startedAt, exec.finishedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>
                      {new Date(exec.startedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View output">
                      <IconButton size="small" onClick={() => setSelected(exec)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Output Dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Execution #{selected?.id} — {selected?.status?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {selected?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {selected.error}
            </Alert>
          )}
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>OUTPUT</Typography>
          <Box sx={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            borderRadius: 2,
            p: 2,
            fontFamily: 'monospace',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            maxHeight: 400,
            overflow: 'auto',
          }}>
            {selected?.output || 'No output available'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}