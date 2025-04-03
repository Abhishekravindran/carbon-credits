import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const EmployeeTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [newTrip, setNewTrip] = useState({
    date: new Date().toISOString().split('T')[0],
    distance: '',
    isWorkFromHome: false,
    transportMode: '',
    description: '',
  });

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setNewTrip(prev => ({
      ...prev,
      [name]: name === 'isWorkFromHome' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/trips`, newTrip, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({
        open: true,
        message: 'Trip recorded successfully!',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchTrips();
      setNewTrip({
        date: new Date().toISOString().split('T')[0],
        distance: '',
        isWorkFromHome: false,
        transportMode: '',
        description: '',
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error recording trip',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({
        open: true,
        message: 'Trip deleted successfully!',
        severity: 'success'
      });
      fetchTrips();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Error deleting trip',
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
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">My Trips</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Record Trip
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Distance (miles)</TableCell>
                  <TableCell>Transport Mode</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Credits Earned</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                    <TableCell>{trip.isWorkFromHome ? 'Work From Home' : 'Commute'}</TableCell>
                    <TableCell>{trip.isWorkFromHome ? '-' : trip.distance}</TableCell>
                    <TableCell>{trip.isWorkFromHome ? '-' : trip.transportMode}</TableCell>
                    <TableCell>{trip.description}</TableCell>
                    <TableCell>{trip.creditsEarned}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(trip._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Record New Trip</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newTrip.isWorkFromHome}
                      onChange={handleInputChange}
                      name="isWorkFromHome"
                    />
                  }
                  label="Work From Home Day"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={newTrip.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {!newTrip.isWorkFromHome && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Distance (miles)"
                      name="distance"
                      value={newTrip.distance}
                      onChange={handleInputChange}
                      required={!newTrip.isWorkFromHome}
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transport Mode"
                      name="transportMode"
                      value={newTrip.transportMode}
                      onChange={handleInputChange}
                      required={!newTrip.isWorkFromHome}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select transport mode</option>
                      <option value="car">Car</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="walk">Walk</option>
                    </TextField>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newTrip.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
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

export default EmployeeTrips; 