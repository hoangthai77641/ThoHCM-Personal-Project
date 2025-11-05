import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
  Collapse,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  AccountBalance as WalletIcon,
  Campaign as CampaignIcon,
  LocalShipping as TransportIcon,
  ExpandLess,
  ExpandMore,
  PersonSearch as PersonSearchIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const DRAWER_WIDTH = 280;

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user?.role === 'admin';

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleUsersMenuToggle = () => {
    setUsersMenuOpen(!usersMenuOpen);
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
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
      show: true,
    },
    {
      text: 'Người dùng',
      icon: <PeopleIcon />,
      show: isAdmin,
      subItems: [
        { text: 'Khách hàng', icon: <PersonSearchIcon />, path: '/users' },
        { text: 'Thợ', icon: <BuildIcon />, path: '/workers' },
        { text: 'Tài xế', icon: <TransportIcon />, path: '/drivers' },
        { text: 'Quản trị viên', icon: <AdminIcon />, path: '/administrators' },
      ],
    },
    {
      text: 'Dịch vụ',
      icon: <BuildIcon />,
      path: '/services',
      show: true,
    },
    {
      text: 'Dịch vụ Vận Chuyển',
      icon: <TransportIcon />,
      path: '/transport-services',
      show: isAdmin,
    },
    {
      text: 'Đặt lịch',
      icon: <ReceiptIcon />,
      path: '/bookings',
      show: true,
    },
    {
      text: 'Quản lý Ví',
      icon: <WalletIcon />,
      path: '/admin',
      show: isAdmin,
      onClick: () => {
        navigate('/admin');
        // Trigger wallet tab - có thể emit event hoặc dùng query param
      },
    },
    {
      text: 'Banner & Thông báo',
      icon: <CampaignIcon />,
      path: '/banners',
      show: isAdmin,
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? DRAWER_WIDTH : 65}px)`,
          ml: `${open ? DRAWER_WIDTH : 65}px`,
          transition: 'width 0.3s, margin 0.3s',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bảng điều khiển Admin
          </Typography>
          <IconButton color="inherit" onClick={handleUserMenuClick}>
            <Avatar
              src={user?.avatar}
              sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Thông tin cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : 65,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : 65,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            p: 2,
            minHeight: 64,
          }}
        >
          <img
            src={logo}
            alt="Thợ HCM"
            style={{ width: 40, height: 40, borderRadius: '8px' }}
          />
          {open && (
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Thợ HCM
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* User Profile */}
        {open && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#f1f5f9', noWrap: true }}
                >
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Thợ'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Menu Items */}
        <List sx={{ px: 1, pt: 2 }}>
          {menuItems.map((item) => {
            if (!item.show) return null;

            // Item with submenu
            if (item.subItems) {
              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={handleUsersMenuToggle}
                      sx={{
                        borderRadius: 2,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: '#8B5CF6',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {open && (
                        <>
                          <ListItemText primary={item.text} />
                          {usersMenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {open && (
                    <Collapse in={usersMenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem) => (
                          <ListItemButton
                            key={subItem.path}
                            onClick={() => navigate(subItem.path)}
                            selected={isActive(subItem.path)}
                            sx={{
                              pl: 4,
                              py: 1,
                              borderRadius: 2,
                              mx: 1,
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                '&:hover': {
                                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 36 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            }

            // Regular menu item
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderLeft: '4px solid #6366f1',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.3)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive(item.path) ? '#6366f1' : '#94a3b8',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
