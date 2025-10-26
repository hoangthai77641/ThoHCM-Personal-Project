import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Grid,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Search,
  AccountBalanceWallet,
  Schedule,
  Person,
  Payment,
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../api';

const ManualDepositManagement = () => {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingDeposits();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchPendingDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/wallet/pending-manual-deposits');
      console.log('📡 Pending deposits API response:', response.data);
      if (response.data.success) {
        setPendingDeposits(response.data.data || []); // Backend returns data in 'data' field
      } else {
        setError(response.data.message || 'Không thể tải danh sách');
      }
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
      setError('Lỗi kết nối: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDeposit || !actualAmount) return;

    setActionLoading(true);
    try {
      const response = await api.post(
        `/api/wallet/approve-manual-deposit/${selectedDeposit.id}`,
        {
          adminNotes: adminNotes || 'Đã xác nhận chuyển khoản',
          actualAmount: parseFloat(actualAmount),
        }
      );

      if (response.data.success) {
        setSuccess('✅ Đã duyệt nạp tiền thành công!');
        setActionDialog({ open: false, type: null });
        setSelectedDeposit(null);
        setAdminNotes('');
        setActualAmount('');
        fetchPendingDeposits(); // Refresh list
      } else {
        setError(response.data.message || 'Lỗi duyệt nạp tiền');
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
      setError('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit || !adminNotes.trim()) return;

    setActionLoading(true);
    try {
      const response = await api.post(
        `/api/wallet/reject-manual-deposit/${selectedDeposit.id}`,
        {
          adminNotes: adminNotes,
        }
      );

      if (response.data.success) {
        setSuccess('✅ Đã từ chối nạp tiền');
        setActionDialog({ open: false, type: null });
        setSelectedDeposit(null);
        setAdminNotes('');
        fetchPendingDeposits(); // Refresh list
      } else {
        setError(response.data.message || 'Lỗi từ chối nạp tiền');
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      setError('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (deposit, type) => {
    setSelectedDeposit(deposit);
    setActionDialog({ open: true, type });
    setAdminNotes('');
    setActualAmount(deposit.amount.toString());
    setError('');
    setSuccess('');
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedDeposit(null);
    setAdminNotes('');
    setActualAmount('');
  };

  const filteredDeposits = (pendingDeposits || []).filter(deposit => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deposit.workerInfo?.name?.toLowerCase().includes(searchLower) ||
      deposit.workerInfo?.phone?.includes(searchTerm) ||
      deposit.id?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
          Quản lý nạp tiền QR thủ công
          <Badge badgeContent={(pendingDeposits || []).length} color="error" sx={{ ml: 2 }}>
            <Schedule />
          </Badge>
        </Typography>

        {/* Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Tìm theo tên, SĐT, mã giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={fetchPendingDeposits}
            disabled={loading}
            startIcon={<Refresh />}
          >
            Làm mới
          </Button>
          <Typography variant="body2" color="text.secondary">
            {filteredDeposits.length} / {(pendingDeposits || []).length} giao dịch
          </Typography>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Deposits List */}
      {loading && (pendingDeposits || []).length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Đang tải...</Typography>
        </Box>
      ) : filteredDeposits.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AccountBalanceWallet sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {(pendingDeposits || []).length === 0 
                ? 'Không có giao dịch chờ duyệt'
                : 'Không tìm thấy giao dịch phù hợp'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredDeposits.map((deposit) => (
            <Grid item xs={12} md={6} lg={4} key={deposit._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Worker Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {deposit.workerInfo?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {deposit.workerInfo?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Transaction Info */}
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Số tiền:
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(deposit.amount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Mã GD:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {deposit.id}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Thời gian:
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(deposit.createdAt)}
                      </Typography>
                    </Box>

                    {deposit.proofImage && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Ảnh CT:
                        </Typography>
                        <Chip
                          label="Có ảnh"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {/* Bank Info */}
                    {deposit.bankInfo && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Thông tin CK:
                        </Typography>
                        <Typography variant="body2">
                          {deposit.bankInfo.bankName} - {deposit.bankInfo.accountNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {deposit.bankInfo.transferContent}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1}>
                    {deposit.proofImage && (
                      <Tooltip title="Xem ảnh chuyển khoản">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`/storage/proof-of-payment/${deposit.proofImage}`, '_blank')}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => openActionDialog(deposit, 'approve')}
                      sx={{ flexGrow: 1 }}
                    >
                      Duyệt
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => openActionDialog(deposit, 'reject')}
                    >
                      Từ chối
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={closeActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' ? (
            <>
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              Duyệt nạp tiền
            </>
          ) : (
            <>
              <Cancel sx={{ color: 'error.main', mr: 1 }} />
              Từ chối nạp tiền
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedDeposit && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedDeposit.workerId?.name} - {selectedDeposit.workerId?.phone}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Mã giao dịch: <code>{selectedDeposit.transactionId}</code>
              </Typography>
              <Typography variant="body1" gutterBottom>
                Số tiền yêu cầu: <strong>{formatCurrency(selectedDeposit.amount)}</strong>
              </Typography>

              {actionDialog.type === 'approve' && (
                <TextField
                  label="Số tiền thực tế nhận được"
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  helperText="Có thể điều chỉnh nếu số tiền thực tế khác với yêu cầu"
                />
              )}

              <TextField
                label={actionDialog.type === 'approve' ? 'Ghi chú admin (tùy chọn)' : 'Lý do từ chối'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required={actionDialog.type === 'reject'}
                placeholder={
                  actionDialog.type === 'approve'
                    ? 'Ví dụ: Đã xác nhận chuyển khoản thành công'
                    : 'Ví dụ: Không tìm thấy giao dịch chuyển khoản'
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            onClick={actionDialog.type === 'approve' ? handleApprove : handleReject}
            disabled={
              actionLoading ||
              (actionDialog.type === 'reject' && !adminNotes.trim()) ||
              (actionDialog.type === 'approve' && (!actualAmount || isNaN(parseFloat(actualAmount))))
            }
          >
            {actionLoading ? 'Đang xử lý...' : (
              actionDialog.type === 'approve' ? 'Duyệt' : 'Từ chối'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualDepositManagement;