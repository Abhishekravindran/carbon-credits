import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  DirectionsCar,
  EmojiTransportation,
  Home,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DashboardCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              padding: 1,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';

        switch (user.role) {
          case 'EMPLOYEE':
            endpoint = '/trips/statistics';
            break;
          case 'EMPLOYER':
            endpoint = `/organizations/${user.organization}/credits`;
            break;
          case 'BANK_ADMIN':
            endpoint = '/credits/market-stats';
            break;
          default:
            throw new Error('Invalid role');
        }

        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  const renderEmployeeDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Total Trips"
          value={stats?.totalTrips || 0}
          icon={<DirectionsCar color="primary" />}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Total Distance (miles)"
          value={stats?.totalDistance || 0}
          icon={<EmojiTransportation color="secondary" />}
          color="#9c27b0"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Carbon Credits Earned"
          value={stats?.totalCredits || 0}
          icon={<TrendingUp sx={{ color: '#4caf50' }} />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <DashboardCard
          title="Work From Home Days"
          value={stats?.wfhDays || 0}
          icon={<Home sx={{ color: '#ff9800' }} />}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" href="/trips">
                Record New Trip
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined">View Trip History</Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderEmployerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <DashboardCard
          title="Total Carbon Credits"
          value={stats?.total || 0}
          icon={<TrendingUp sx={{ color: '#4caf50' }} />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <DashboardCard
          title="Available Credits"
          value={stats?.available || 0}
          icon={<TrendingUp sx={{ color: '#2196f3' }} />}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <DashboardCard
          title="Traded Credits"
          value={stats?.traded || 0}
          icon={<TrendingUp sx={{ color: '#ff9800' }} />}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" href="/credits">
                Trade Credits
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" href="/organization">
                Manage Organization
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderBankAdminDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <DashboardCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          icon={<TrendingUp sx={{ color: '#2196f3' }} />}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <DashboardCard
          title="Total Credits Traded"
          value={stats?.totalCreditsTraded || 0}
          icon={<TrendingUp sx={{ color: '#4caf50' }} />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <DashboardCard
          title="Average Price"
          value={`$${stats?.averagePrice?.toFixed(2) || '0.00'}`}
          icon={<TrendingUp sx={{ color: '#ff9800' }} />}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <DashboardCard
          title="Total Market Value"
          value={`$${stats?.totalValue?.toFixed(2) || '0.00'}`}
          icon={<TrendingUp sx={{ color: '#9c27b0' }} />}
          color="#9c27b0"
        />
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" href="/approvals">
                Review Pending Approvals
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined">View Transaction History</Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.profile.firstName}!
      </Typography>
      {user.role === 'EMPLOYEE' && renderEmployeeDashboard()}
      {user.role === 'EMPLOYER' && renderEmployerDashboard()}
      {user.role === 'BANK_ADMIN' && renderBankAdminDashboard()}
    </Container>
  );
};

export default Dashboard; 