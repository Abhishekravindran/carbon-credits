import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
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
  TextField,
  Chip,
  Box,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
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
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const BankApprovals = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [comment, setComment] = useState('');

  const fetchApprovalData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [orgsResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API_URL}/organizations/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/credits/pending-transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPendingOrgs(orgsResponse.data);
      setPendingTransactions(transactionsResponse.data);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error fetching approval data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item, type) => {
    setSelectedItem({ ...item, type });
    setOpenDialog(true);
    setComment('');
  };

  const handleApproval = async (approved) => {
    try {
      const token = localStorage.getItem('token');
      const { type, _id } = selectedItem;
      
      if (type === 'organization') {
        await axios.put(`${API_URL}/organizations/${_id}/status`, {
          status: approved ? 'APPROVED' : 'REJECTED',
          comment
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`${API_URL}/credits/transactions/${_id}/status`, {
          status: approved ? 'COMPLETED' : 'REJECTED',
          comment
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setNotification({
        open: true,
        message: `${type === 'organization' ? 'Organization' : 'Transaction'} ${approved ? 'approved' : 'rejected'} successfully!`,
        severity: 'success'
      });
      setOpenDialog(false);
      fetchApprovalData();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error processing approval',
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
              Approval Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Organizations
                    </Typography>
                    <Typography variant="h4">
                      {pendingOrgs.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Transactions
                    </Typography>
                    <Typography variant="h4">
                      {pendingTransactions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
              <Tab label="Organization Approvals" />
              <Tab label="Transaction Approvals" />
            </Tabs>
            <Divider />

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingOrgs.map((org) => (
                      <TableRow key={org._id}>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.email}</TableCell>
                        <TableCell>{org.phone}</TableCell>
                        <TableCell>{org.address}</TableCell>
                        <TableCell>
                          {new Date(org.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleOpenDialog(org, 'organization')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleOpenDialog(org, 'organization')}
                            >
                              Reject
                            </Button>
                          </Box>
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
                      <TableCell>Organization</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{transaction.organization.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'BUY' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>${transaction.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(transaction.amount * transaction.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleOpenDialog(transaction, 'transaction')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleOpenDialog(transaction, 'transaction')}
                            >
                              Reject
                            </Button>
                          </Box>
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
        <DialogTitle>
          {selectedItem?.type === 'organization' ? 'Organization' : 'Transaction'} Review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Details
            </Typography>
            {selectedItem?.type === 'organization' ? (
              <>
                <Typography variant="body1">
                  Organization: {selectedItem?.name}
                </Typography>
                <Typography variant="body1">
                  Email: {selectedItem?.email}
                </Typography>
                <Typography variant="body1">
                  Phone: {selectedItem?.phone}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  Organization: {selectedItem?.organization?.name}
                </Typography>
                <Typography variant="body1">
                  Type: {selectedItem?.type}
                </Typography>
                <Typography variant="body1">
                  Amount: {selectedItem?.amount} credits
                </Typography>
                <Typography variant="body1">
                  Total Value: ${selectedItem?.amount * selectedItem?.price}
                </Typography>
              </>
            )}
          </Box>
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleApproval(false)}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApproval(true)}
          >
            Approve
          </Button>
        </DialogActions>
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

export default BankApprovals; 