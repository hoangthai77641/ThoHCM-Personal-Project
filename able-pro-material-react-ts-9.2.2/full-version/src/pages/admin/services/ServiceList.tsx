import { useEffect, useState } from 'react';
import { adminHttp } from 'services/http';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Button, Alert } from '@mui/material';

interface ServiceItem {
  _id: string;
  name: string;
  price?: number;
  category?: string;
  status?: string;
}

export default function ServiceList() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminHttp.get('/api/services');
      setServices(res.data.services || res.data || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải dịch vụ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Danh sách dịch vụ
      </Typography>
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Box mb={2} display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={load}>Tải lại</Button>
          {/* Placeholder for future: <Button variant="contained" size="small">Thêm dịch vụ</Button> */}
        </Box>
      )}
      {!loading && !error && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((s: ServiceItem) => (
                <TableRow key={s._id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.price ?? '-'}</TableCell>
                  <TableCell>{s.category ?? '-'}</TableCell>
                  <TableCell>{s.status ?? '-'}</TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Chưa có dịch vụ.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
