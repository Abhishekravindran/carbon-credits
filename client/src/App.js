import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeTrips from './pages/EmployeeTrips';
import OrganizationManagement from './pages/OrganizationManagement';
import CreditTrading from './pages/CreditTrading';
import BankApprovals from './pages/BankApprovals';

// Components
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green color for environmental theme
    },
    secondary: {
      main: '#1565C0',
    },
    background: {
      default: '#F5F5F5',
    },
  },
});

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route
                path="trips"
                element={
                  <PrivateRoute roles={['EMPLOYEE']}>
                    <EmployeeTrips />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="organization"
                element={
                  <PrivateRoute roles={['EMPLOYER']}>
                    <OrganizationManagement />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="credits"
                element={
                  <PrivateRoute roles={['EMPLOYER']}>
                    <CreditTrading />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="approvals"
                element={
                  <PrivateRoute roles={['BANK_ADMIN']}>
                    <BankApprovals />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 