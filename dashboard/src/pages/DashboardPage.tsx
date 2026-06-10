import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import WebIcon from '@mui/icons-material/Web';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';

const stats = [
  { label: 'Mobile Tests Run', value: '0', icon: <PhoneAndroidIcon />, color: '#1565C0' },
  { label: 'Web Tests Run', value: '0', icon: <WebIcon />, color: '#C62828' },
  { label: 'Tests Passed', value: '0', icon: <CheckCircleIcon />, color: '#2E7D32' },
  { label: 'Total Executions', value: '0', icon: <HistoryIcon />, color: '#F57C00' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Welcome to QATrack — your company automation platform
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" sx={{ fontSize: 13, mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    backgroundColor: stat.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                Use the sidebar to run Mobile or Web tests. Results will appear in History.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                No recent executions yet. Run your first test to see results here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}