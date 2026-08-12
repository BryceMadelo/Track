import { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Chip, Divider, TextField, Select, MenuItem,
  FormControl, IconButton, Tooltip,
  Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, ToggleButton, ToggleButtonGroup,
  Switch, FormControlLabel,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { runVisualWebTest } from '../api/executions';
import { getEnvironments } from '../api/environments';
import type { Environment } from '../api/environments';
import { useEffect } from 'react';

interface TestStep {
  id: string;
  keyword: 'Given' | 'When' | 'Then' | 'And';
  title: string;
  description: string;
  captureScreenshot: boolean;
}

const keywordColors: Record<string, string> = {
  Given: '#1565C0',
  When: '#F57C00',
  Then: '#2E7D32',
  And: '#757575',
};

const defaultSteps: TestStep[] = [
  { id: '1', keyword: 'Given', title: 'Open Login Page', description: 'Given the user is on login page', captureScreenshot: true },
  { id: '2', keyword: 'When', title: 'Click Login Button', description: 'When the user clicks the login button', captureScreenshot: false },
  { id: '3', keyword: 'Then', title: 'Verify Login Success', description: 'Then the user should be logged in', captureScreenshot: true },
];

export default function VisualTestBuilderPage() {
  const [steps, setSteps] = useState<TestStep[]>(defaultSteps);
  const [featureTitle, setFeatureTitle] = useState('');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [engine, setEngine] = useState<'playwright' | 'selenium'>('playwright');
  const [platform, setPlatform] = useState<'web' | 'mobile'>('web');
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captureAll, setCaptureAll] = useState(false);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRunDialog, setShowRunDialog] = useState(false);

  useEffect(() => {
    getEnvironments().then(setEnvironments).catch(() => {});
  }, []);

  const addStep = () => {
    const newStep: TestStep = {
      id: String(Date.now()),
      keyword: 'And',
      title: 'New Step',
      description: '',
      captureScreenshot: false,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: keyof TestStep, value: string | boolean) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const toggleAllScreenshots = (value: boolean) => {
    setCaptureAll(value);
    setSteps(steps.map(s => ({ ...s, captureScreenshot: value })));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newSteps = [...steps];
    const [removed] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, removed);
    setSteps(newSteps);
  };

  const generateFeatureFile = () => {
    if (!featureTitle || !scenarioTitle) {
      setError('Please fill in Feature Title and Scenario Title');
      return;
    }
    setError('');
    const stepsText = steps
      .map(s => `    ${s.keyword} ${s.title}${s.captureScreenshot ? ' #screenshot' : ''}`)
      .join('\n');

    const feature = `Feature: ${featureTitle}

  Scenario: ${scenarioTitle}
${stepsText}
`;
    setGenerated(feature);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generated], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenarioTitle.replace(/\s+/g, '_').toLowerCase()}.feature`;
    a.click();
  };

  const handleRun = async () => {
    if (!username || !password) {
      setError('Please enter credentials to run the test');
      return;
    }
    if (!featureTitle || !scenarioTitle) {
      setError('Please fill in Feature Title and Scenario Title');
      return;
    }
    if (platform === 'web' && !selectedEnvId) {
      setError('Please select an environment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedEnv = environments.find(e => String(e.id) === selectedEnvId);

      await runVisualWebTest({
        username,
        password,
        url: selectedEnv?.webUrl || '',
        environment: selectedEnv?.name,
        engine,
        featureTitle,
        scenarioTitle,
        steps: steps.map(s => ({
          keyword: s.keyword,
          title: s.title,
          description: s.description,
          captureScreenshot: s.captureScreenshot,
        })),
      });

      setSuccess(`✅ Test queued with ${engine.toUpperCase()}! The feature file was automatically saved and the test is now running. Check Execution History for results.`);
      setShowRunDialog(false);
    } catch {
      setError('Failed to queue test. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            backgroundColor: '#7B1FA215',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7B1FA2',
          }}>
            <AutoFixHighIcon />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Visual Test Builder</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Build test steps visually — drag, reorder, capture screenshots
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AutoFixHighIcon />}
            onClick={generateFeatureFile}
          >
            Generate
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => setShowRunDialog(true)}
            sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
          >
            Run Test
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Feature Title"
                  value={featureTitle}
                  onChange={(e) => setFeatureTitle(e.target.value)}
                  fullWidth size="small"
                  placeholder="e.g. PPGIS Web Login"
                />
                <TextField
                  label="Scenario Title"
                  value={scenarioTitle}
                  onChange={(e) => setScenarioTitle(e.target.value)}
                  fullWidth size="small"
                  placeholder="e.g. User logs in successfully"
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={captureAll}
                      onChange={(e) => toggleAllScreenshots(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CameraAltIcon sx={{ fontSize: 16, color: '#1565C0' }} />
                      <Typography sx={{ fontSize: 13 }}>Capture screenshot on every step</Typography>
                    </Box>
                  }
                />
                <Typography sx={{ fontSize: 12, color: "text.secondary", ml: "auto" }}>
                  {steps.filter(s => s.captureScreenshot).length} of {steps.length} steps will capture
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, px: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", letterSpacing: "0.08em" }}>
              SCENARIO STEPS
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {steps.length} steps
            </Typography>
          </Box>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {steps.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 1.5,
                            border: snapshot.isDragging ? '2px solid #1565C0' : '1px solid #E5E7EB',
                            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                            transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Box {...provided.dragHandleProps} sx={{ cursor: 'grab', color: '#9CA3AF', display: 'flex' }}>
                                <DragIndicatorIcon fontSize="small" />
                              </Box>

                              <Chip
                                label={step.keyword}
                                size="small"
                                sx={{
                                  backgroundColor: keywordColors[step.keyword],
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: 11,
                                  minWidth: 56,
                                }}
                              />

                              <TextField
                                value={step.title}
                                onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                size="small"
                                fullWidth
                                variant="standard"
                                slotProps={{
                                  input: {
                                    disableUnderline: false,
                                    style: { fontSize: 14, fontWeight: 500 },
                                  },
                                }}
                                placeholder="Step title..."
                              />

                              <Tooltip title={step.captureScreenshot ? 'Screenshot ON' : 'Screenshot OFF'}>
                                <IconButton
                                  size="small"
                                  onClick={() => updateStep(step.id, 'captureScreenshot', !step.captureScreenshot)}
                                  sx={{
                                    color: step.captureScreenshot ? '#1565C0' : '#D1D5DB',
                                    backgroundColor: step.captureScreenshot ? '#1565C015' : 'transparent',
                                  }}
                                >
                                  <CameraAltIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Move up">
                                <IconButton size="small" onClick={() => moveStep(index, 'up')} disabled={index === 0}>
                                  <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move down">
                                <IconButton size="small" onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}>
                                  <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Remove step">
                                <IconButton size="small" color="error" onClick={() => removeStep(step.id)}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <FormControl size="small" sx={{ minWidth: 90 }}>
                                <Select
                                  value={step.keyword}
                                  onChange={(e) => updateStep(step.id, 'keyword', e.target.value)}
                                  sx={{ fontSize: 12 }}
                                >
                                  <MenuItem value="Given">Given</MenuItem>
                                  <MenuItem value="When">When</MenuItem>
                                  <MenuItem value="Then">Then</MenuItem>
                                  <MenuItem value="And">And</MenuItem>
                                </Select>
                              </FormControl>
                              <TextField
                                value={step.description}
                                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                size="small"
                                fullWidth
                                placeholder="Describe what happens in this step..."
                                slotProps={{
                                  input: {
                                    style: {
                                      fontSize: 12,
                                      fontFamily: 'monospace',
                                      color: '#6B7280',
                                    },
                                  },
                                }}
                              />
                            </Box>

                            {step.captureScreenshot && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                <CameraAltIcon sx={{ fontSize: 12, color: '#1565C0' }} />
                                <Typography sx={{ fontSize: 11, color: '#1565C0' }}>
                                  Screenshot will be captured after this step
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
          </DragDropContext>

          <Button
            startIcon={<AddIcon />}
            onClick={addStep}
            fullWidth
            variant="outlined"
            sx={{ mt: 1, borderStyle: 'dashed' }}
          >
            Add Step
          </Button>
        </Box>

        <Box sx={{ flex: 1, minWidth: 340 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generated Feature File
                </Typography>
                {generated && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                      <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download .feature file">
                      <IconButton size="small" color="primary" onClick={handleDownload}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {generated ? (
                <Box sx={{
                  backgroundColor: '#1e1e1e',
                  borderRadius: 2,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  minHeight: 300,
                  lineHeight: 1.8,
                }}>
                  {generated.split('\n').map((line, i) => {
                    let color = '#d4d4d4';
                    if (line.startsWith('Feature:')) color = '#569cd6';
                    else if (line.trim().startsWith('Scenario:')) color = '#4ec9b0';
                    else if (line.trim().startsWith('Given')) color = '#ce9178';
                    else if (line.trim().startsWith('When')) color = '#dcdcaa';
                    else if (line.trim().startsWith('Then')) color = '#4ec9b0';
                    else if (line.trim().startsWith('And')) color = '#c586c0';
                    const hasScreenshot = line.includes('#screenshot');
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color }}>{line.replace(' #screenshot', '') || ' '}</span>
                        {hasScreenshot && (
                          <CameraAltIcon sx={{ fontSize: 12, color: '#1565C0' }} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{
                  backgroundColor: '#F4F6F8',
                  borderRadius: 2,
                  p: 3,
                  minHeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Typography color="text.secondary" align="center" sx={{ fontSize: 14 }}>
                    Fill in the feature title, scenario title,<br />
                    and click <strong>Generate</strong> to see the output
                  </Typography>
                </Box>
              )}

              {generated && (
                <Alert severity="success" sx={{ mt: 2 }} icon={false}>
                  Click <strong>Run Test</strong> to automatically save and execute this test — no manual file copying needed.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Step Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Step Summary</Typography>
              {steps.map((step, index) => (
                <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                    {index + 1}
                  </Typography>
                  <Chip
                    label={step.keyword}
                    size="small"
                    sx={{
                      backgroundColor: keywordColors[step.keyword] + '20',
                      color: keywordColors[step.keyword],
                      fontSize: 10,
                      height: 18,
                      minWidth: 48,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, flex: 1 }} noWrap>{step.title}</Typography>
                  {step.captureScreenshot && (
                    <CameraAltIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Run Test Dialog */}
      <Dialog open={showRunDialog} onClose={() => setShowRunDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Run Test</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Engine Selection */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", mb: 1 }}>
            TEST ENGINE
          </Typography>
          <ToggleButtonGroup
            value={engine}
            exclusive
            onChange={(_, v) => v && setEngine(v)}
            size="small"
            sx={{ mb: 3 }}
            fullWidth
          >
            <ToggleButton value="playwright" sx={{ flex: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>Playwright</Typography>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Chromium · Fast · Modern</Typography>
              </Box>
            </ToggleButton>
            <ToggleButton value="selenium" sx={{ flex: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>Selenium</Typography>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Chrome · Firefox · Edge</Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Platform */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", mb: 1 }}>
            PLATFORM
          </Typography>
          <ToggleButtonGroup
            value={platform}
            exclusive
            onChange={(_, v) => v && setPlatform(v)}
            size="small"
            sx={{ mb: 3 }}
            fullWidth
          >
            <ToggleButton value="web" sx={{ flex: 1 }}>Web</ToggleButton>
            <ToggleButton value="mobile" sx={{ flex: 1 }}>Mobile</ToggleButton>
          </ToggleButtonGroup>

          {/* Environment */}
          {platform === 'web' && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", mb: 1 }}>
                ENVIRONMENT
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {environments.map((env) => (
                  <Chip
                    key={env.id}
                    label={env.name}
                    onClick={() => setSelectedEnvId(String(env.id))}
                    color={selectedEnvId === String(env.id) ? 'primary' : 'default'}
                    variant={selectedEnvId === String(env.id) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Credentials */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", mb: 1 }}>
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
            fullWidth size="small" sx={{ mb: 2 }}
          />

          {/* Screenshot info */}
          <Alert severity="info" icon={<CameraAltIcon />} sx={{ fontSize: 12 }}>
            {steps.filter(s => s.captureScreenshot).length} steps will capture screenshots.
            Find them in <strong>runners/{engine}/screenshots/</strong> after the run.
          </Alert>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowRunDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRun}
            disabled={loading}
            sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
          >
            {loading ? 'Queuing...' : `Run with ${engine.charAt(0).toUpperCase() + engine.slice(1)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}