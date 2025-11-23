import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Campaign as CampaignIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Receipt as ReceiptIcon,
  PersonSearch as PersonSearchIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';
import SearchBox from './SearchBox';
import NotificationSystem from './NotificationSystem';
import logo from '../assets/logo.png';

/**
 * Responsive Navigation Bar với Material UI
 * Thay thế nav cũ trong App.jsx
 */
export default function ResponsiveNav({ user, onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode } = useThemeMode();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'worker');
  const userMenuOpen = Boolean(anchorEl);

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

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Menu items for admin/worker
  const adminMenuItems = isAdmin ? [
    { text: 'Bảng điều khiển', path: '/admin', icon: <DashboardIcon /> },
    ...(user?.role === 'admin' ? [
      { text: 'Người dùng', path: '/users', icon: <PeopleIcon /> },
      { text: 'Quản trị viên', path: '/administrators', icon: <AdminIcon /> },
      { text: 'Banner & Thông báo', path: '/banners', icon: <CampaignIcon /> },
    ] : []),
  ] : [];

  // Menu items for customer
  const customerMenuItems = user?.role === 'customer' ? [
    { text: 'Tìm thợ gần đây', path: '/nearby-workers', icon: <PersonSearchIcon /> },
    { text: 'Đơn của tôi', path: '/my-bookings', icon: <ReceiptIcon /> },
  ] : [];

  // Public menu items (available to all users)
  const publicMenuItems = [
    { text: 'Dịch Vụ Vận Chuyển', path: '/transport-services', icon: <LocalShippingIcon /> },
  ];

  // User dropdown menu items
  const userDropdownItems = [
    ...customerMenuItems,
    { text: 'Thông tin cá nhân', path: '/profile', icon: <AccountCircleIcon /> },
  ];

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            Thợ HCM
          </Typography>
        </Box>
      </Box>

      <Divider />

      {user ? (
        <>
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${user.avatar}`) : undefined}
                sx={{ mr: 2 }}
              >
                {!user.avatar && user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body1" fontWeight="medium">
                {user.name}
              </Typography>
            </Box>
          </Box>
          <Divider />
        </>
      ) : null}

      <List>
        {/* Public menu items */}
        {publicMenuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>
        ))}

        {!user && (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/register" 
              onClick={handleDrawerToggle}
              sx={{ 
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Đăng ký" 
                primaryTypographyProps={{ color: 'text.primary' }}
              />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/login" 
              onClick={handleDrawerToggle}
              sx={{ 
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Đăng nhập"
                primaryTypographyProps={{ color: 'text.primary' }}
              />
            </ListItem>
          </>
        )}

        {adminMenuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>
        ))}

        {user && userDropdownItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>
        ))}

        {user && (
          <ListItem 
            button 
            onClick={() => { handleDrawerToggle(); handleLogout(); }}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
            <ListItemText 
              primary="Đăng xuất"
              primaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 'auto', md: 4 },
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ height: isMobile ? 32 : 40, marginRight: 8 }}
              />
              <Typography
                variant={isMobile ? 'body1' : 'h6'}
                fontWeight="bold"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Thợ HCM
              </Typography>
            </Box>

            {/* Desktop navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                {/* Public menu items */}
                {publicMenuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}

                {!user && (
                  <>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      component={Link} 
                      to="/register"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Đăng ký
                    </Button>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/login"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </>
                )}

                {adminMenuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search box */}
            <Box sx={{ flexGrow: { xs: 0, md: 1 }, mx: { xs: 1, md: 2 }, maxWidth: { md: 400 } }}>
              <SearchBox />
            </Box>

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notification */}
              {user && <NotificationSystem user={user} />}

              {/* User menu */}
              {user && !isMobile && (
                <>
                  <IconButton
                    onClick={handleUserMenuClick}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Avatar
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'https://thohcm-application-475603.as.r.appspot.com'}${user.avatar}`) : undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {!user.avatar && user.name.charAt(0).toUpperCase()}
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
                        {user.name}
                      </Typography>
                    </Box>
                    <Divider />
                    {userDropdownItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={Link}
                        to={item.path}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.text}</ListItemText>
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon /></ListItemIcon>
                      <ListItemText>Đăng xuất</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
