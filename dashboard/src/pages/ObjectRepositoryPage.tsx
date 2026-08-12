import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert,
  IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { getObjects, createObject, updateObject, deleteObject } from '../api/objects';
import type { ObjectEntity } from '../api/objects';

export default function ObjectRepositoryPage() {
  const [objects, setObjects] = useState<ObjectEntity[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
  const [selectedObj, setSelectedObj] = useState<ObjectEntity | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    locatorType: 'css',
    locatorValue: '',
    description: '',
  });

  const loadData = async () => {
    try {
      const data = await getObjects();
      setObjects(data);
    } catch {
      setError('Failed to load object repository');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.locatorValue) {
      setError('Name and Locator Value are required');
      return;
    }
    try {
      if (selectedObj) {
        await updateObject(selectedObj.id, form);
        setSuccess('Object updated successfully');
      } else {
        await createObject(form as Omit<ObjectEntity, 'id' | 'createdAt' | 'updatedAt'>);
        setSuccess('Object created successfully');
      }
      setOpenDialog(false);
      loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save object');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this object?')) return;
    try {
      await deleteObject(id);
      setSuccess('Object deleted');
    } catch {
      setError('Failed to delete object');
    }
  };

  const openForEdit = (obj: ObjectEntity) => {
    setSelectedObj(obj);
    setForm({
      name: obj.name,
      locatorType: obj.locatorType,
      locatorValue: obj.locatorValue,
      description: obj.description || '',
    });
    setOpenDialog(true);
  };

  const openForCreate = () => {
    setSelectedObj(null);
    setForm({ name: '', locatorType: 'css', locatorValue: '', description: '' });
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '2.5rem' }}>
          <FolderSpecialIcon fontSize="large" color="primary" />
          Object Repository
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openForCreate}>
          New Object
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Locator Type</TableCell>
                <TableCell>Locator Value</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objects.map((obj) => (
                <TableRow key={obj.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }} color="primary">{obj.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={obj.locatorType.toUpperCase()} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <code>{obj.locatorValue}</code>
                  </TableCell>
                  <TableCell>{obj.description}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openForEdit(obj)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(obj.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {objects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No objects saved yet. Capture or add elements manually.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedObj ? 'Edit Object' : 'New Object'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Element Name (e.g., Btn_Login)"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Locator Type</InputLabel>
              <Select
                value={form.locatorType}
                label="Locator Type"
                onChange={(e) => setForm({ ...form, locatorType: e.target.value })}
              >
                <MenuItem value="css">CSS Selector</MenuItem>
                <MenuItem value="xpath">XPath</MenuItem>
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="name">Name Attribute</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Locator Value"
              fullWidth
              value={form.locatorValue}
              onChange={(e) => setForm({ ...form, locatorValue: e.target.value })}
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
