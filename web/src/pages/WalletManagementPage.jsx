import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountBalance as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import api from '../api';
import ManualDepositManagement from '../components/ManualDepositManagement';

export default function WalletManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformFeeConfig, setPlatformFeeConfig] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [feeConfigLoading, setFeeConfigLoading] = useState(false);

  // Determine active tab based on URL
  const currentTab = location.pathname === '/wallet/nap-vi' ? 'nap-vi' : 'overview';

  useEffect(() => {
    if (currentTab === 'overview') {
      loadWalletData();
    }
  }, [currentTab]);

  async function loadWalletData() {
    try {
      setLoading(true);
      const [configRes, statsRes, walletsRes] = await Promise.all([
        api.get('/api/wallet/platform-fee-config'),
        api.get('/api/wallet/stats'),
        api.get('/api/wallet/all?limit=50'),
      ]);

      setPlatformFeeConfig(configRes.data.data || {});
      setWalletStats(statsRes.data.data);
      setWallets(walletsRes.data.data?.wallets || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePlatformFee(e) {
    e.preventDefault();
    setFeeConfigLoading(true);
    try {
      const formData = new FormData(e.target);
      const updatedConfig = {
        platformFeePercentage: parseFloat(formData.get('platformFeePercentage')),
        workerEarningPercentage: parseFloat(formData.get('workerEarningPercentage')),
      };
      await api.put('/api/wallet/platform-fee-config', updatedConfig);
      alert('Cập nhật cấu hình phí thành công!');
      loadWalletData();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi cập nhật cấu hình');
    } finally {
      setFeeConfigLoading(false);
    }
  }

  function formatCurrency(value) {
    if (!value && value !== 0) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        💰 Quản lý Ví
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Theo dõi và quản lý ví của người dùng
      </Typography>

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => {
            navigate(newValue === 'overview' ? '/wallet' : `/wallet/${newValue}`)
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tổng quan" value="overview" icon={<WalletIcon />} iconPosition="start" />
          <Tab label="Nạp Ví" value="nap-vi" icon={<QrCodeIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content - Overview */}
      {currentTab === 'overview' && (
        <>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              {/* Wallet Statistics */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Tổng số dư
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            {formatCurrency(walletStats?.totalBalance)}
                          </Typography>
                        </Box>
                        <WalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Tổng nạp
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            {formatCurrency(walletStats?.totalDeposits)}
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Tổng rút
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="error.main">
                            {formatCurrency(walletStats?.totalWithdrawals)}
                          </Typography>
                        </Box>
                        <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            Số người dùng
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {walletStats?.userCount || 0}
                          </Typography>
                        </Box>
                        <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Platform Fee Configuration */}
              <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  ⚙️ Cấu hình Phí Nền tảng
                </Typography>
                <form onSubmit={updatePlatformFee}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phí nền tảng (%)"
                        name="platformFeePercentage"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 100 }}
                        defaultValue={platformFeeConfig?.platformFeePercentage || 0}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phần trăm thu nhập thợ (%)"
                        name="workerEarningPercentage"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 100 }}
                        defaultValue={platformFeeConfig?.workerEarningPercentage || 0}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={feeConfigLoading}
                        startIcon={feeConfigLoading && <CircularProgress size={20} />}
                      >
                        {feeConfigLoading ? 'Đang cập nhật...' : 'Cập nhật cấu hình'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>

              {/* Wallets List */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  📋 Danh sách Ví
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Người dùng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Số dư</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="right">Cập nhật</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {wallets.map((wallet) => (
                        <TableRow key={wallet._id} hover>
                          <TableCell>{wallet.user?.name || 'N/A'}</TableCell>
                          <TableCell>{wallet.user?.email || 'N/A'}</TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight="bold"
                              color={wallet.balance >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(wallet.balance)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                wallet.balance < 0
                                  ? 'Âm'
                                  : wallet.balance === 0
                                  ? 'Trống'
                                  : 'Bình thường'
                              }
                              color={
                                wallet.balance < 0
                                  ? 'error'
                                  : wallet.balance === 0
                                  ? 'default'
                                  : 'success'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {new Date(wallet.updatedAt).toLocaleDateString('vi-VN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </>
      )}

      {/* Tab Content - Nạp Ví */}
      {currentTab === 'nap-vi' && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📱 Nạp Ví - Quản lý yêu cầu nạp tiền
          </Typography>
          <ManualDepositManagement />
        </Paper>
      )}
    </Box>
  );
}
