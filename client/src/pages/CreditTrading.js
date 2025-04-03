import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  History as HistoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Sell as SellIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`credit-tabpanel-${index}`}
      aria-labelledby={`credit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const CreditTrading = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('buy');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    amount: '',
    price: '',
  });

  const fetchMarketData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [marketResponse, transactionResponse] = await Promise.all([
        axios.get(`${API_URL}/credits/market`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/credits/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMarketData(marketResponse.data);
      setTransactions(transactionResponse.data);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error fetching market data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setFormData({
      amount: '',
      price: type === 'buy' ? marketData?.currentPrice || '' : '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = dialogType === 'buy' ? '/credits/buy' : '/credits/sell';
      await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({
        open: true,
        message: `Credits ${dialogType === 'buy' ? 'purchased' : 'sold'} successfully!`,
        severity: 'success'
      });
      setOpenDialog(false);
      fetchMarketData();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || `Error ${dialogType}ing credits`,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Carbon Credits Market
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Current Price
                    </Typography>
                    <Typography variant="h4">
                      ${marketData?.currentPrice?.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={marketData?.priceChange >= 0 ? 'success.main' : 'error.main'}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {marketData?.priceChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                      {Math.abs(marketData?.priceChange || 0).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Available Credits
                    </Typography>
                    <Typography variant="h4">
                      {marketData?.availableCredits}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      24h Volume
                    </Typography>
                    <Typography variant="h4">
                      {marketData?.volume24h}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Your Balance
                    </Typography>
                    <Typography variant="h4">
                      {marketData?.userBalance}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={() => handleOpenDialog('buy')}
              >
                Buy Credits
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SellIcon />}
                onClick={() => handleOpenDialog('sell')}
              >
                Sell Credits
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Market Activity" />
              <Tab label="Your Transactions" />
            </Tabs>
            <Divider />

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marketData?.recentTransactions?.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'BUY' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>${transaction.price.toFixed(2)}</TableCell>
                        <TableCell>${(transaction.amount * transaction.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'BUY' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>${transaction.price.toFixed(2)}</TableCell>
                        <TableCell>${(transaction.amount * transaction.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {dialogType === 'buy' ? 'Buy Carbon Credits' : 'Sell Carbon Credits'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price per Credit"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              {formData.amount && formData.price && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Total Value: ${(formData.amount * formData.price).toFixed(2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {dialogType === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreditTrading; 