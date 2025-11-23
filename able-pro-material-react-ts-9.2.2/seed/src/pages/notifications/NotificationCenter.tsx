import { useEffect, useState } from 'react';
import { http } from 'services/http';
import { getSocket } from 'services/socket';
import { Box, Typography, List, ListItem, ListItemText, Chip, CircularProgress, Paper, Button, Alert } from '@mui/material';

interface NotificationItem {
  _id: string;
  title?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
}

export default function NotificationCenter() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get('/api/notifications/user');
      setItems(res.data.notifications || res.data || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải thông báo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const sock = getSocket();
    if (sock) {
      sock.on('notification', (payload: any) => {
        setItems((prev: NotificationItem[]) => [{
          _id: payload.id || Math.random().toString(36).slice(2),
          title: payload.title,
          body: payload.body,
          type: payload.type,
          isRead: false,
          createdAt: new Date().toISOString()
        }, ...prev]);
      });
    }
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Thông báo</Typography>
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
        <Paper>
          <List dense>
            {items.map((n: NotificationItem) => (
              <ListItem key={n._id} divider>
                <ListItemText primary={n.title || n.type || 'Không có tiêu đề'} secondary={n.body} />
                <Chip label={n.isRead ? 'Đã đọc' : 'Mới'} size="small" color={n.isRead ? 'default' : 'primary'} />
              </ListItem>
            ))}
            {items.length === 0 && (
              <ListItem>
                <ListItemText primary="Chưa có thông báo." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}
