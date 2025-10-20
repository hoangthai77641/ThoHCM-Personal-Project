import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Typography,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar,
  Chip,
  Rating,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';

/**
 * Material UI Component Examples
 * Responsive và đẹp mắt
 */

// Responsive Card Component
export function ServiceCard({ title, description, image, price, rating }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height={isMobile ? 180 : 200}
        image={image || 'https://via.placeholder.com/400x200'}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        {rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {rating}
            </Typography>
          </Box>
        )}
        {price && (
          <Typography variant="h6" color="primary" fontWeight="bold">
            {price.toLocaleString('vi-VN')}đ
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button 
          variant="contained" 
          fullWidth 
          size={isMobile ? 'medium' : 'large'}
        >
          Đặt ngay
        </Button>
      </CardActions>
    </Card>
  );
}

// Responsive Navigation Bar
export function ResponsiveNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Dịch vụ', icon: <BuildIcon />, path: '/services' },
    { text: 'Đặt lịch', icon: <CalendarIcon />, path: '/booking' },
    { text: 'Tài khoản', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold', color: 'primary.main' }}>
        ThoHCM
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} button>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            ThoHCM
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2}>
              {menuItems.map((item) => (
                <Button key={item.text} color="inherit">
                  {item.text}
                </Button>
              ))}
            </Stack>
          )}

          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

// Responsive Hero Section
export function ResponsiveHero() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant={isMobile ? 'h3' : 'h2'} 
              component="h1" 
              gutterBottom
              fontWeight="bold"
            >
              Tìm thợ chuyên nghiệp
            </Typography>
            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 4, opacity: 0.9 }}>
              Nhanh chóng - Uy tín - Chất lượng
            </Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Đặt lịch ngay
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Xem dịch vụ
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="https://via.placeholder.com/600x400"
              alt="Hero"
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: 6,
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Stat Card Component
export function StatCard({ title, value, icon, trend }) {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 40 } }}>
          {icon}
        </Typography>
        {trend && (
          <Chip 
            label={`${trend > 0 ? '+' : ''}${trend}%`} 
            color={trend > 0 ? 'success' : 'error'}
            size="small"
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: 24, sm: 32 } }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
}

// Booking Form Component
export function BookingForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Đặt lịch dịch vụ
      </Typography>
      <Box component="form" sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả công việc"
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              size="large"
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? '100%' : 200 }}
            >
              Đặt lịch ngay
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

// Complete Example Page
export function MaterialUIExample() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ResponsiveNavbar />
      
      <ResponsiveHero />
      
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Tổng đơn" value="1,234" icon="📦" trend={12} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Hoàn thành" value="1,100" icon="✅" trend={8} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Thợ" value="450" icon="👷" trend={15} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Đánh giá" value="4.8⭐" icon="⭐" trend={5} />
          </Grid>
        </Grid>
        
        {/* Services Grid */}
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
          Dịch vụ nổi bật
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              title="Sửa điện nước"
              description="Dịch vụ sửa chữa điện nước chuyên nghiệp, nhanh chóng"
              price={200000}
              rating={4.8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              title="Sơn nhà"
              description="Thi công sơn nhà đẹp, bền, giá cả hợp lý"
              price={500000}
              rating={4.9}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ServiceCard
              title="Vệ sinh máy lạnh"
              description="Vệ sinh, bảo dưỡng máy lạnh định kỳ"
              price={150000}
              rating={4.7}
            />
          </Grid>
        </Grid>
        
        {/* Booking Form */}
        <BookingForm />
      </Container>
    </Box>
  );
}

export default MaterialUIExample;
