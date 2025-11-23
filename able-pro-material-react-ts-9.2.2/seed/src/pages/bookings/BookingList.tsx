import { useEffect, useState } from 'react';
import { http } from 'services/http';
import { Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, Button, Alert } from '@mui/material';

interface BookingItem {
  _id: string;
  status?: string;
  scheduledTime?: string;
  serviceId?: string;
}

export default function BookingList() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get('/api/bookings/my');
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
      <Typography variant="h4" gutterBottom>Đơn đặt của tôi</Typography>
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb:2 }} action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Box mb={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" size="small" onClick={load}>Tải lại</Button>
        </Box>
      )}
      {!loading && !error && (
        <Grid container spacing={2}>
          {bookings.map((b: BookingItem) => (
            <Grid item xs={12} sm={6} md={4} key={b._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Mã: {b._id}</Typography>
                  <Typography variant="body2">Dịch vụ: {b.serviceId || '-'}</Typography>
                  <Typography variant="body2">Thời gian: {b.scheduledTime ? new Date(b.scheduledTime).toLocaleString() : '-'}</Typography>
                  <Chip label={b.status || 'N/A'} size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {bookings.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center">Chưa có đơn đặt.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
