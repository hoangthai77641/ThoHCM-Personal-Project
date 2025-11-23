import { useEffect, useState } from 'react';
import { http } from 'services/http';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Button, Alert } from '@mui/material';

interface ServiceItem {
  _id: string;
  name: string;
  price?: number;
  description?: string;
}

export default function ServiceCatalog() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get('/api/services');
      setServices(res.data.services || res.data || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải dịch vụ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dịch vụ
      </Typography>
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>
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
          {services.map((s: ServiceItem) => (
            <Grid item xs={12} sm={6} md={4} key={s._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.description || 'Chưa có mô tả.'}
                  </Typography>
                  <Typography variant="subtitle2" mt={1}>
                    Giá: {s.price ? s.price + '₫' : 'Liên hệ'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {services.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center">Chưa có dịch vụ.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
