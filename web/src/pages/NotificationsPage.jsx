import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import NotificationManager from '../components/NotificationManager';

export default function NotificationsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📢 Quản lý Thông báo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gửi thông báo đến người dùng, khách hàng hoặc thợ
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <NotificationManager />
      </Paper>
    </Box>
  );
}
