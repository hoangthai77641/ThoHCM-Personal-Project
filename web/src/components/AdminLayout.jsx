import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Campaign as CampaignIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  AccountBalance as WalletIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import logo from '../assets/logo.png';
import NotificationSystem from './NotificationSystem';

const drawerWidth = 260;

export default function AdminLayout({ children, user, onLogout }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user?.role === 'admin';
  const userMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      onLogout();
      navigate('/');
    }
  };

  // Menu items for admin sidebar
  const menuItems = [
    { text: 'Trang chủ', path: '/', icon: <HomeIcon /> },
    { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    ...(isAdmin ? [
      { text: 'Người dùng', path: '/users', icon: <PeopleIcon /> },
      { text: 'Quản trị viên', path: '/administrators', icon: <AdminIcon /> },
      { text: 'Banner & Thông báo', path: '/banners', icon: <CampaignIcon /> },
      { text: 'Thông báo', path: '/notifications', icon: <NotificationsIcon /> },
      { text: 'Quản lý Ví', path: '/wallet', icon: <WalletIcon /> },
      { text: 'Nạp tiền QR', path: '/qr-deposit', icon: <QrCodeIcon /> },
    ] : []),
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ height: 36, marginRight: 12 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            Thợ HCM
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${user.avatar}`) : undefined}
            sx={{ width: 40, height: 40 }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role === 'admin' ? 'Quản trị viên' : 'Thợ'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout Button */}
      <List sx={{ pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: desktopOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bảng điều khiển Admin
          </Typography>

          {/* Notification */}
          {user && <NotificationSystem user={user} />}

          {/* User Menu */}
          <IconButton
            onClick={handleUserMenuClick}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar
              src={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${user.avatar}`) : undefined}
              sx={{ width: 36, height: 36 }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Xin chào,
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {user?.name}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} to="/profile">
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText>Thông tin cá nhân</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: desktopOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
