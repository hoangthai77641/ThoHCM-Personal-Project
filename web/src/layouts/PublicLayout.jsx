import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import ResponsiveNav from '../components/ResponsiveNav';

export default function PublicLayout({ user, onLogout }) {
  return (
    <Box>
      <ResponsiveNav user={user} onLogout={onLogout} />
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
}
