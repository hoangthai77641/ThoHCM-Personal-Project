import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ManualDepositManagement from '../components/ManualDepositManagement';

export default function QRDepositPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📱 Nạp tiền QR
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý các yêu cầu nạp tiền qua mã QR
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <ManualDepositManagement />
      </Paper>
    </Box>
  );
}
