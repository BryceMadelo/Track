import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, Divider,
  IconButton, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BugReportIcon from '@mui/icons-material/BugReport';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getBugs, getBugStats, createBug, updateBugStatus, deleteBug } from '../api/bugs';
import type { Bug, BugStats } from '../api/bugs';
import { getUser } from '../api/auth';

const statusColumns = [
  { key: 'open', label: 'Open', color: '#C62828' },
  { key: 'in_progress', label: 'In Progress', color: '#F57C00' },
  { key: 'in_review', label: 'In Review', color: '#1565C0' },
  { key: 'fixed', label: 'Fixed', color: '#2E7D32' },
];

const severityColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const priorityColors: Record<string, string> = {
  urgent: '#C62828',
  high: '#F57C00',
  medium: '#1565C0',
  low: '#757575',
};

export default function BugTrackerPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [stats, setStats] = useState<BugStats | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = getUser();

  const [form, setForm] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    priority: 'medium',
    environment: '',
    version: '',
  });

  const loadData = async () => {
    try {
      const [bugsData, statsData] = await Promise.all([
        getBugs(),
        getBugStats(),
      ]);
      setBugs(bugsData);
      setStats(statsData);
    } catch {
      setError('Failed to load bugs');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);
  const handleCreate = async () => {
    if (!form.title) { setError('Title is required'); return; }
    try {
      await createBug({
        ...form,
        reportedById: currentUser?.id,
      });
      setSuccess('Bug reported successfully');
      setOpenDialog(false);
      setForm({
        title: '', description: '', stepsToReproduce: '',
        expectedBehavior: '', actualBehavior: '',
        severity: 'medium', priority: 'medium', environment: '', version: '',
      });
      loadData();
    } catch {
      setError('Failed to create bug');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this bug?')) return;
    try {
      await deleteBug(id);
      setSuccess('Bug deleted');
      loadData();
    } catch {
      setError('Failed to delete bug');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const bugId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    if (result.source.droppableId === newStatus) return;

    setBugs(prev => prev.map(b =>
      b.id === bugId ? { ...b, status: newStatus as Bug['status'] } : b
    ));

    try {
      await updateBugStatus(bugId, newStatus);
      loadData();
    } catch {
      setError('Failed to update bug status');
      loadData();
    }
  };

  const getBugsByStatus = (status: string) =>
    bugs.filter(b => b.status === status);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            backgroundColor: '#C6282815',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#C62828',
          }}>
            <BugReportIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Bug Tracker</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {stats?.open || 0} open · {stats?.critical || 0} critical
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            <ToggleButton value="kanban">
              <ViewKanbanIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <TableRowsIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ backgroundColor: '#C62828', '&:hover': { backgroundColor: '#B71C1C' } }}>
            Report Bug
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Stats */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: '#1565C0' },
            { label: 'Open', value: stats.open, color: '#C62828' },
            { label: 'In Progress', value: stats.inProgress, color: '#F57C00' },
            { label: 'Fixed', value: stats.fixed, color: '#2E7D32' },
            { label: 'Critical', value: stats.critical, color: '#B71C1C' },
          ].map(stat => (
            <Card key={stat.label} sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: 12 }} color="text.secondary">{stat.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }} color={stat.color}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Kanban View */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', pb: 2 }}>
            {statusColumns.map(col => (
              <Box key={col.key} sx={{ minWidth: 280, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{
                    width: 12, height: 12, borderRadius: '50%',
                    backgroundColor: col.color,
                  }} />
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{col.label}</Typography>
                  <Chip
                    label={getBugsByStatus(col.key).length}
                    size="small"
                    sx={{ ml: 'auto', height: 20, fontSize: 11 }}
                  />
                </Box>
                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 400,
                        backgroundColor: snapshot.isDraggingOver ? '#F0F4FF' : '#F4F6F8',
                        borderRadius: 2,
                        p: 1,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {getBugsByStatus(col.key).map((bug, index) => (
                        <Draggable
                          key={bug.id}
                          draggableId={String(bug.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                mb: 1,
                                cursor: 'grab',
                                boxShadow: snapshot.isDragging
                                  ? '0 8px 24px rgba(0,0,0,0.15)'
                                  : '0 1px 3px rgba(0,0,0,0.1)',
                                transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                transition: 'box-shadow 0.2s',
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    BUG-{String(bug.id).padStart(3, '0')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Edit">
                                      <IconButton size="small" onClick={() => setSelectedBug(bug)}>
                                        <EditIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton size="small" color="error" onClick={() => handleDelete(bug.id)}>
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                <Typography sx={{ fontWeight: 500, fontSize: 13, mb: 1 }}>
                                  {bug.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                  <Chip
                                    label={bug.severity.toUpperCase()}
                                    size="small"
                                    color={severityColors[bug.severity]}
                                    sx={{ fontSize: 10, height: 18 }}
                                  />
                                  <Chip
                                    label={bug.priority.toUpperCase()}
                                    size="small"
                                    sx={{
                                      fontSize: 10, height: 18,
                                      backgroundColor: priorityColors[bug.priority] + '15',
                                      color: priorityColors[bug.priority],
                                    }}
                                  />
                                  {bug.environment && (
                                    <Chip
                                      label={bug.environment}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: 10, height: 18 }}
                                    />
                                  )}
                                </Box>
                                {bug.assignedTo && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Avatar sx={{ width: 18, height: 18, fontSize: 10, backgroundColor: '#1565C0' }}>
                                      {bug.assignedTo.fullName?.[0] || bug.assignedTo.username[0].toUpperCase()}
                                    </Avatar>
                                    <Typography sx={{ fontSize: 11 }} color="text.secondary">
                                      {bug.assignedTo.fullName || bug.assignedTo.username}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Environment</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Reported</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">Loading...</TableCell>
                  </TableRow>
                ) : bugs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No bugs reported yet. Click "Report Bug" to log one.
                    </TableCell>
                  </TableRow>
                ) : bugs.map((bug) => (
                  <TableRow key={bug.id} hover>
                    <TableCell>
                      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                        BUG-{String(bug.id).padStart(3, '0')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{bug.title}</Typography>
                      {bug.description && (
                        <Typography color="text.secondary" noWrap sx={{ fontSize: 12, maxWidth: 250 }}>
                          {bug.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bug.severity.toUpperCase()}
                        size="small"
                        color={severityColors[bug.severity]}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bug.priority.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: priorityColors[bug.priority] + '15',
                          color: priorityColors[bug.priority],
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bug.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: statusColumns.find(s => s.key === bug.status)?.color + '15',
                          color: statusColumns.find(s => s.key === bug.status)?.color,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13 }} color="text.secondary">
                        {bug.environment || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {bug.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar sx={{ width: 22, height: 22, fontSize: 11, backgroundColor: '#1565C0' }}>
                            {bug.assignedTo.fullName?.[0] || bug.assignedTo.username[0].toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontSize: 13 }}>
                            {bug.assignedTo.fullName || bug.assignedTo.username}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 13 }} color="text.secondary">Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }} color="text.secondary">
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => setSelectedBug(bug)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(bug.id)}>
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
      )}

      {/* Create Bug Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Report a Bug</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Bug Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth size="small" sx={{ mb: 2, mt: 1 }}
            placeholder="e.g. Login button not responding on mobile"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth size="small" multiline rows={2} sx={{ mb: 2 }}
          />
          <TextField
            label="Steps to Reproduce"
            value={form.stepsToReproduce}
            onChange={(e) => setForm({ ...form, stepsToReproduce: e.target.value })}
            fullWidth size="small" multiline rows={3} sx={{ mb: 2 }}
            placeholder="1. Open app&#10;2. Tap login&#10;3. Nothing happens"
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Expected Behavior"
              value={form.expectedBehavior}
              onChange={(e) => setForm({ ...form, expectedBehavior: e.target.value })}
              fullWidth size="small" multiline rows={2}
            />
            <TextField
              label="Actual Behavior"
              value={form.actualBehavior}
              onChange={(e) => setForm({ ...form, actualBehavior: e.target.value })}
              fullWidth size="small" multiline rows={2}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select value={form.severity} label="Severity"
                onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <MenuItem value="critical">🔴 Critical</MenuItem>
                <MenuItem value="high">🟠 High</MenuItem>
                <MenuItem value="medium">🟡 Medium</MenuItem>
                <MenuItem value="low">🟢 Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="urgent">🚨 Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Environment"
              value={form.environment}
              onChange={(e) => setForm({ ...form, environment: e.target.value })}
              fullWidth size="small"
              placeholder="e.g. QA, UAT, Production"
            />
            <TextField
              label="App Version"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              fullWidth size="small"
              placeholder="e.g. v1.11.5.0"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ backgroundColor: '#C62828', '&:hover': { backgroundColor: '#B71C1C' } }}
          >
            Report Bug
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bug Detail Dialog */}
      <Dialog open={!!selectedBug} onClose={() => setSelectedBug(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          BUG-{String(selectedBug?.id).padStart(3, '0')} — {selectedBug?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={selectedBug?.severity?.toUpperCase()} size="small"
              color={severityColors[selectedBug?.severity || 'medium']} />
            <Chip label={selectedBug?.priority?.toUpperCase()} size="small" variant="outlined" />
            <Chip label={selectedBug?.status?.replace('_', ' ').toUpperCase()} size="small" />
            {selectedBug?.environment && (
              <Chip label={selectedBug.environment} size="small" variant="outlined" />
            )}
            {selectedBug?.version && (
              <Chip label={`v${selectedBug.version}`} size="small" variant="outlined" />
            )}
          </Box>
          {selectedBug?.description && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>DESCRIPTION</Typography>
              <Typography sx={{ fontSize: 14 }}>{selectedBug.description}</Typography>
            </Box>
          )}
          {selectedBug?.stepsToReproduce && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>STEPS TO REPRODUCE</Typography>
              <Typography sx={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{selectedBug.stepsToReproduce}</Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {selectedBug?.expectedBehavior && (
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>EXPECTED</Typography>
                <Typography sx={{ fontSize: 14 }}>{selectedBug.expectedBehavior}</Typography>
              </Box>
            )}
            {selectedBug?.actualBehavior && (
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>ACTUAL</Typography>
                <Typography sx={{ fontSize: 14 }}>{selectedBug.actualBehavior}</Typography>
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 1 }}>UPDATE STATUS</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {statusColumns.map(col => (
              <Button
                key={col.key}
                size="small"
                variant={selectedBug?.status === col.key ? 'contained' : 'outlined'}
                onClick={async () => {
                  if (selectedBug) {
                    await updateBugStatus(selectedBug.id, col.key);
                    setSelectedBug(null);
                    loadData();
                  }
                }}
                sx={{
                  borderColor: col.color,
                  color: selectedBug?.status === col.key ? 'white' : col.color,
                  backgroundColor: selectedBug?.status === col.key ? col.color : 'transparent',
                  '&:hover': { backgroundColor: col.color + '20' },
                }}
              >
                {col.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedBug(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}