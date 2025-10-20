# 🎨 Material UI (MUI) - Setup Complete!

## ✅ Đã cài đặt thành công

### 📦 Packages
```json
{
  "dependencies": {
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x"
  }
}
```

### 📂 Files đã tạo
- ✅ `src/theme.js` - Theme configuration (light & dark)
- ✅ `src/ThemeProvider.jsx` - Theme provider wrapper
- ✅ `src/components/MaterialUIExamples.jsx` - Component examples
- ✅ `src/main.jsx` - Updated với ThemeProvider

---

## 🚀 Sử dụng Material UI

### 1. **Import Components**
```jsx
import {
  Box,
  Container,
  Grid,
  Card,
  Button,
  Typography,
  TextField,
} from '@mui/material';
```

### 2. **Basic Component**
```jsx
import { Button } from '@mui/material';

function MyComponent() {
  return (
    <Button variant="contained" color="primary">
      Click Me
    </Button>
  );
}
```

### 3. **Responsive Layout**
```jsx
import { Container, Grid, Box } from '@mui/material';

function ResponsiveLayout() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* xs=12 (mobile), sm=6 (tablet), md=4 (desktop) */}
        <Grid item xs={12} sm={6} md={4}>
          <Box>Card 1</Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box>Card 2</Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box>Card 3</Box>
        </Grid>
      </Grid>
    </Container>
  );
}
```

### 4. **Styling với sx prop**
```jsx
<Box
  sx={{
    p: 2,                    // padding: 16px
    m: { xs: 1, md: 2 },    // margin responsive
    bgcolor: 'primary.main', // background color
    color: 'white',
    borderRadius: 2,         // border-radius: 16px
    boxShadow: 3,
    '&:hover': {
      bgcolor: 'primary.dark',
      transform: 'scale(1.05)',
    },
  }}
>
  Content
</Box>
```

### 5. **Dark Mode Toggle**
```jsx
import { useThemeMode } from './ThemeProvider';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

function DarkModeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  
  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
```

---

## 📱 Responsive Breakpoints

Material UI sử dụng breakpoints sau:
```javascript
xs: 0px      // Extra small (mobile)
sm: 600px    // Small (mobile landscape/tablet)
md: 900px    // Medium (tablet/laptop)
lg: 1200px   // Large (desktop)
xl: 1536px   // Extra large (large desktop)
```

### Cách sử dụng:
```jsx
// In sx prop
<Box sx={{ 
  width: { xs: '100%', sm: '50%', md: '33.33%' },
  p: { xs: 2, md: 4 },
  display: { xs: 'block', md: 'flex' }
}}>

// In Grid
<Grid item xs={12} sm={6} md={4} lg={3}>

// Using useMediaQuery
import { useMediaQuery, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </Box>
  );
}
```

---

## 🎨 Theme Customization

### Colors
```jsx
// Primary colors
color="primary"
bgcolor="primary.main"
bgcolor="primary.light"
bgcolor="primary.dark"

// Secondary colors
color="secondary"

// Text colors
color="text.primary"
color="text.secondary"

// Background
bgcolor="background.default"
bgcolor="background.paper"

// Status colors
color="error"
color="warning"
color="success"
color="info"
```

### Typography
```jsx
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="body2">Secondary text</Typography>
<Typography variant="caption">Caption text</Typography>
```

### Spacing Scale
```jsx
// p, m, px, py, pt, pb, pl, pr, mx, my, mt, mb, ml, mr
sx={{ p: 1 }}  // padding: 8px
sx={{ p: 2 }}  // padding: 16px
sx={{ p: 3 }}  // padding: 24px
sx={{ p: 4 }}  // padding: 32px

// Responsive spacing
sx={{ p: { xs: 2, md: 4 } }}
```

---

## 📚 Common Components

### Button
```jsx
import { Button } from '@mui/material';

<Button variant="contained" color="primary">Contained</Button>
<Button variant="outlined" color="primary">Outlined</Button>
<Button variant="text" color="primary">Text</Button>
<Button variant="contained" size="small">Small</Button>
<Button variant="contained" size="large">Large</Button>
<Button variant="contained" fullWidth>Full Width</Button>
<Button variant="contained" disabled>Disabled</Button>
```

### Card
```jsx
import { Card, CardContent, CardActions, CardMedia } from '@mui/material';

<Card>
  <CardMedia
    component="img"
    height="200"
    image="/image.jpg"
    alt="Image"
  />
  <CardContent>
    <Typography variant="h5">Title</Typography>
    <Typography variant="body2">Content</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Learn More</Button>
  </CardActions>
</Card>
```

### TextField
```jsx
import { TextField } from '@mui/material';

<TextField 
  label="Name" 
  variant="outlined" 
  fullWidth 
  required 
/>

<TextField 
  label="Description" 
  variant="outlined" 
  multiline 
  rows={4} 
  fullWidth 
/>
```

### Container & Box
```jsx
import { Container, Box } from '@mui/material';

<Container maxWidth="lg">
  <Box sx={{ p: 2 }}>
    Content
  </Box>
</Container>

// maxWidth options: xs, sm, md, lg, xl, false
```

---

## 🎯 Component Examples

### Responsive Card
```jsx
import { Card, CardContent, Button, Typography } from '@mui/material';

function ServiceCard({ title, price }) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        transition: 'all 0.3s',
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" color="primary">
          {price.toLocaleString('vi-VN')}đ
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" fullWidth>
          Đặt ngay
        </Button>
      </CardActions>
    </Card>
  );
}
```

### Responsive Navigation
```jsx
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useMediaQuery, useTheme } from '@mui/material';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <AppBar position="sticky">
      <Toolbar>
        {isMobile && (
          <IconButton color="inherit" edge="start">
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ThoHCM
        </Typography>
        
        {!isMobile && (
          <>
            <Button color="inherit">Trang chủ</Button>
            <Button color="inherit">Dịch vụ</Button>
            <Button color="inherit">Đặt lịch</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
```

### Form Layout
```jsx
import { Grid, TextField, Button } from '@mui/material';

function BookingForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField label="Họ tên" fullWidth required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Số điện thoại" fullWidth required />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Địa chỉ" fullWidth required />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" size="large">
          Đặt lịch
        </Button>
      </Grid>
    </Grid>
  );
}
```

---

## 📖 Icons

### Import Icons
```jsx
import {
  Home as HomeIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Sử dụng
<HomeIcon />
<HomeIcon color="primary" />
<HomeIcon fontSize="small" />
<HomeIcon fontSize="large" />
```

### Icon Button
```jsx
import { IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

<IconButton color="primary">
  <DeleteIcon />
</IconButton>
```

---

## 💡 Pro Tips

### 1. **Use Theme Spacing**
```jsx
// Good ✅
sx={{ p: 2, m: 3 }}

// Avoid ❌
sx={{ padding: '16px', margin: '24px' }}
```

### 2. **Responsive Helper**
```jsx
import { useMediaQuery, useTheme } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
```

### 3. **Custom Components**
```jsx
// Tạo styled component
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const CustomButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(2, 4),
  fontWeight: 'bold',
}));
```

### 4. **Stack for Quick Layouts**
```jsx
import { Stack } from '@mui/material';

// Vertical
<Stack spacing={2}>
  <Item>1</Item>
  <Item>2</Item>
</Stack>

// Horizontal
<Stack direction="row" spacing={2}>
  <Item>1</Item>
  <Item>2</Item>
</Stack>

// Responsive
<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
```

---

## 🔧 Troubleshooting

### Fonts not loading
Material UI sử dụng Roboto font. Thêm vào HTML nếu cần:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### Icons not working
Đảm bảo đã cài `@mui/icons-material`:
```bash
npm install @mui/icons-material
```

---

## 📚 Resources

- [Material UI Docs](https://mui.com/material-ui/getting-started/)
- [Component API](https://mui.com/material-ui/api/button/)
- [Icons Browser](https://mui.com/material-ui/material-icons/)
- [Theme Customization](https://mui.com/material-ui/customization/theming/)
- [Examples & Templates](https://mui.com/material-ui/getting-started/templates/)

---

## 🎊 Next Steps

1. ✅ Material UI installed
2. ✅ Theme configured (light & dark)
3. ✅ Example components created
4. 🔲 Start using in your pages
5. 🔲 Customize theme colors
6. 🔲 Add more icons as needed

---

**Material UI is ready! Start building beautiful UIs! 🚀**
