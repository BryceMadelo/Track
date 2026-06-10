import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField,
  Button, Divider, Alert, Select, MenuItem,
  FormControl, InputLabel, IconButton, Tooltip,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';

interface TestStep {
  id: number;
  keyword: 'Given' | 'When' | 'Then' | 'And';
  action: string;
}

export default function TestConverterPage() {
  const [featureTitle, setFeatureTitle] = useState('');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [platform, setPlatform] = useState('web');
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 1, keyword: 'Given', action: '' },
    { id: 2, keyword: 'When', action: '' },
    { id: 3, keyword: 'Then', action: '' },
  ]);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const addStep = () => {
    setSteps([...steps, {
      id: Date.now(),
      keyword: 'And',
      action: '',
    }]);
  };

  const removeStep = (id: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: number, field: keyof TestStep, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const generateFeatureFile = () => {
    if (!featureTitle) { setError('Please enter a feature title'); return; }
    if (!scenarioTitle) { setError('Please enter a scenario title'); return; }
    if (steps.some(s => !s.action.trim())) { setError('Please fill in all step actions'); return; }

    setError('');

    const stepsText = steps
      .map(s => `    ${s.keyword} ${s.action}`)
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

  const platformTemplates: Record<string, TestStep[]> = {
    web_login: [
      { id: 1, keyword: 'Given', action: 'I open the web portal' },
      { id: 2, keyword: 'When', action: 'I enter my username and password' },
      { id: 3, keyword: 'And', action: 'I click the Login button' },
      { id: 4, keyword: 'Then', action: 'I should be logged in successfully' },
    ],
    mobile_launch: [
      { id: 1, keyword: 'Given', action: 'I launch the mobile app' },
      { id: 2, keyword: 'When', action: 'the app loads completely' },
      { id: 3, keyword: 'Then', action: 'I should see the home screen' },
    ],
    web_form: [
      { id: 1, keyword: 'Given', action: 'I am on the form page' },
      { id: 2, keyword: 'When', action: 'I fill in all required fields' },
      { id: 3, keyword: 'And', action: 'I click the Submit button' },
      { id: 4, keyword: 'Then', action: 'I should see a success message' },
    ],
    api_check: [
      { id: 1, keyword: 'Given', action: 'the API endpoint is available' },
      { id: 2, keyword: 'When', action: 'I send a GET request' },
      { id: 3, keyword: 'Then', action: 'I should receive a 200 response' },
    ],
  };

  const applyTemplate = (key: string) => {
    const template = platformTemplates[key];
    if (template) setSteps(template.map((s, i) => ({ ...s, id: i + 1 })));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          backgroundColor: '#7B1FA215',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7B1FA2',
        }}>
          <AutoFixHighIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Test Converter</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Convert manual test steps into Cucumber feature files
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left — Input */}
        <Card sx={{ flex: 1, minWidth: 340 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Test Details
            </Typography>

            {/* Quick templates */}
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              QUICK TEMPLATES
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {[
                { key: 'web_login', label: 'Web Login' },
                { key: 'mobile_launch', label: 'Mobile Launch' },
                { key: 'web_form', label: 'Web Form' },
                { key: 'api_check', label: 'API Check' },
              ].map(t => (
                <Chip
                  key={t.key}
                  label={t.label}
                  size="small"
                  onClick={() => applyTemplate(t.key)}
                  sx={{ cursor: 'pointer' }}
                  variant="outlined"
                />
              ))}
            </Box>

            <TextField
              label="Feature Title"
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              fullWidth size="small" sx={{ mb: 2 }}
              placeholder="e.g. PPGIS Web Login"
            />

            <TextField
              label="Scenario Title"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              fullWidth size="small" sx={{ mb: 2 }}
              placeholder="e.g. User logs in with valid credentials"
            />

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Platform</InputLabel>
              <Select value={platform} label="Platform"
                onChange={(e) => setPlatform(e.target.value)}>
                <MenuItem value="web">Web</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="api">API</MenuItem>
              </Select>
            </FormControl>

            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              TEST STEPS
            </Typography>

            {steps.map((step, index) => (
              <Box key={step.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <Typography color="text.secondary" sx={{ fontSize: 12, minWidth: 20 }}>
                  {index + 1}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <Select
                    value={step.keyword}
                    onChange={(e) => updateStep(step.id, 'keyword', e.target.value)}
                  >
                    <MenuItem value="Given">Given</MenuItem>
                    <MenuItem value="When">When</MenuItem>
                    <MenuItem value="Then">Then</MenuItem>
                    <MenuItem value="And">And</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  value={step.action}
                  onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="describe the action..."
                />
                <Tooltip title="Remove step">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addStep}
              size="small"
              sx={{ mt: 1, mb: 3 }}
            >
              Add Step
            </Button>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<AutoFixHighIcon />}
              onClick={generateFeatureFile}
              sx={{ backgroundColor: '#7B1FA2', '&:hover': { backgroundColor: '#6A1B9A' } }}
            >
              Generate Feature File
            </Button>
          </CardContent>
        </Card>

        {/* Right — Output */}
        <Card sx={{ flex: 1, minWidth: 340 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Generated Feature File
              </Typography>
              {generated && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                    <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download .feature file">
                    <IconButton size="small" onClick={handleDownload} color="primary">
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
                color: '#d4d4d4',
                minHeight: 300,
                lineHeight: 1.8,
              }}>
                {generated.split('\n').map((line, i) => {
                  let color = '#d4d4d4';
                  if (line.startsWith('Feature:')) color = '#569cd6';
                  else if (line.startsWith('  Scenario:')) color = '#4ec9b0';
                  else if (line.trim().startsWith('Given')) color = '#ce9178';
                  else if (line.trim().startsWith('When')) color = '#dcdcaa';
                  else if (line.trim().startsWith('Then')) color = '#4ec9b0';
                  else if (line.trim().startsWith('And')) color = '#c586c0';
                  return (
                    <div key={i} style={{ color }}>{line || ' '}</div>
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
                <Typography color="text.secondary" sx={{ fontSize: 14, textAlign: 'center' }}>
                  Fill in the test details and click<br />
                  <strong>Generate Feature File</strong> to see the output here
                </Typography>
              </Box>
            )}

            {generated && (
              <Alert severity="success" sx={{ mt: 2 }} icon={false}>
                ✅ Feature file ready! Copy it or download it, then place it in
                <strong> runners/playwright/features/</strong> or <strong>runners/mobile/features/</strong>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}