import { useEffect, useState } from 'react';
import { adminHttp } from 'services/http';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Chip, Button, Alert } from '@mui/material';

interface BookingItem {
  _id: string;
  customerId?: string;
  workerId?: string;
  serviceId?: string;
  status?: string;
  scheduledTime?: string;
}

export default function BookingList() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminHttp.get('/api/bookings');
      setBookings(res.data.bookings || res.data || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải booking');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Đơn đặt
      </Typography>
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb:2 }} action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Box mb={2} display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={load}>Tải lại</Button>
          {/* Future: <Button variant="contained" size="small">Xuất CSV</Button> */}
        </Box>
      )}
      {!loading && !error && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Khách</TableCell>
                <TableCell>Thợ</TableCell>
                <TableCell>Dịch vụ</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b: BookingItem) => (
                <TableRow key={b._id}>
                  <TableCell>{b._id}</TableCell>
                  <TableCell>{b.customerId || '-'}</TableCell>
                  <TableCell>{b.workerId || '-'}</TableCell>
                  <TableCell>{b.serviceId || '-'}</TableCell>
                  <TableCell>{b.scheduledTime ? new Date(b.scheduledTime).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Chip label={b.status || 'N/A'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Chưa có đơn đặt.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
