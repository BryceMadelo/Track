import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
} from '@mui/material';
import { logout, getUser } from '../api/auth';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import WebIcon from '@mui/icons-material/Web';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartIcon from '@mui/icons-material/BarChart';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/', section: null },
  { label: 'TEST MANAGEMENT', icon: null, path: null, section: 'header' },
  { label: 'Visual Builder', icon: <BuildIcon />, path: '/visual-builder', section: null },
  { label: 'Object Repository', icon: <FolderSpecialIcon />, path: '/objects', section: null },
  { label: 'Test Converter', icon: <AutoFixHighIcon />, path: '/test-converter', section: null },
  { label: 'Test Cases', icon: <AssignmentIcon />, path: '/test-cases', section: null },
  { label: 'Test Suites', icon: <FolderIcon />, path: '/test-suites', section: null },
  { label: 'EXECUTION', icon: null, path: null, section: 'header' },
  { label: 'Web Tests', icon: <WebIcon />, path: '/web', section: null },
  { label: 'Mobile Tests', icon: <PhoneAndroidIcon />, path: '/mobile', section: null },
  { label: 'Schedules', icon: <ScheduleIcon />, path: '/schedules', section: null },
  { label: 'REPORTS', icon: null, path: null, section: 'header' },
  { label: 'BUG TRACKER', icon: null, path: null, section: 'header' },
  { label: 'Bug Tracker', icon: <BugReportIcon />, path: '/bugs', section: null },
  { label: 'Executions', icon: <HistoryIcon />, path: '/history', section: null },
  { label: 'Analytics', icon: <BarChartIcon />, path: '/analytics', section: null },
  { label: 'DEVICES', icon: null, path: null, section: 'header' },
  { label: 'Device Farm', icon: <DevicesIcon />, path: '/devices', section: null },
  { label: 'ADMINISTRATION', icon: null, path: null, section: 'header' },
  { label: 'Users & Roles', icon: <PeopleIcon />, path: '/users', section: null },
  { label: 'Environments', icon: <SettingsIcon />, path: '/environments', section: null },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{
      width: 240,
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="white">
          QATrack
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Automation Platform
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Nav items */}
      <List sx={{ pt: 1, flex: 1 }}>
        {navItems.map((item, index) => {
          // Section header
          if (item.section === 'header') {
            return (
              <Typography
                key={index}
                sx={{
                  px: 2, pt: 2, pb: 0.5,
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.08em',
                }}
              >
                {item.label}
              </Typography>
            );
          }

          // Nav item
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path!)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  py: 0.8,
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: 'white',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info + logout */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AccountCircleIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
              {getUser()?.fullName || getUser()?.username}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
              {getUser()?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={() => {
            logout();
            navigate('/login');
          }}
          sx={{
            borderRadius: 2,
            py: 0.8,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            sx={{ '& .MuiTypography-root': { fontSize: 13, color: 'rgba(255,255,255,0.7)' } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}