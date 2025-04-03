const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let bankAdminToken, employerToken, employeeToken;
let organizationId;

const test = async () => {
  try {
    console.log('Starting API tests...\n');

    // 1. Register Bank Admin
    console.log('1. Registering Bank Admin...');
    const bankAdminRes = await axios.post(`${API_URL}/auth/register`, {
      email: 'bank@test.com',
      password: 'password123',
      role: 'BANK_ADMIN',
      profile: {
        firstName: 'Bank',
        lastName: 'Admin'
      }
    });
    bankAdminToken = bankAdminRes.data.token;
    console.log('✓ Bank Admin registered successfully\n');

    // 2. Register Employer
    console.log('2. Registering Employer...');
    const employerRes = await axios.post(`${API_URL}/auth/register`, {
      email: 'employer@test.com',
      password: 'password123',
      role: 'EMPLOYER',
      profile: {
        firstName: 'Employer',
        lastName: 'Test'
      },
      organization: {
        name: 'Test Corp',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      }
    });
    employerToken = employerRes.data.token;
    organizationId = employerRes.data.user.organization;
    console.log('✓ Employer registered successfully\n');

    // 3. Bank Admin approves organization
    console.log('3. Approving organization...');
    await axios.post(
      `${API_URL}/organizations/${organizationId}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${bankAdminToken}` }
      }
    );
    console.log('✓ Organization approved successfully\n');

    // 4. Register Employee
    console.log('4. Registering Employee...');
    const employeeRes = await axios.post(`${API_URL}/auth/register`, {
      email: 'employee@test.com',
      password: 'password123',
      role: 'EMPLOYEE',
      profile: {
        firstName: 'Employee',
        lastName: 'Test',
        address: {
          street: '456 Home St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      }
    });
    employeeToken = employeeRes.data.token;
    console.log('✓ Employee registered successfully\n');

    // 5. Employer adds employee to organization
    console.log('5. Adding employee to organization...');
    await axios.post(
      `${API_URL}/organizations/${organizationId}/employees`,
      {
        email: 'employee@test.com',
        role: 'EMPLOYEE'
      },
      {
        headers: { Authorization: `Bearer ${employerToken}` }
      }
    );
    console.log('✓ Employee added to organization successfully\n');

    // 6. Employee records a trip
    console.log('6. Recording employee trip...');
    const tripRes = await axios.post(
      `${API_URL}/trips`,
      {
        transportMode: 'PUBLIC_TRANSPORT',
        startLocation: {
          address: {
            street: '456 Home St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        endLocation: {
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          },
          coordinates: {
            latitude: 40.7589,
            longitude: -73.9851
          }
        },
        distance: 10,
        verificationMethod: 'TICKET_UPLOAD',
        verificationData: {
          ticketImage: 'base64_encoded_image'
        }
      },
      {
        headers: { Authorization: `Bearer ${employeeToken}` }
      }
    );
    const tripId = tripRes.data._id;
    console.log('✓ Trip recorded successfully\n');

    // 7. Employer verifies trip
    console.log('7. Verifying trip...');
    await axios.post(
      `${API_URL}/trips/${tripId}/verify`,
      {
        notes: 'Ticket verified'
      },
      {
        headers: { Authorization: `Bearer ${employerToken}` }
      }
    );
    console.log('✓ Trip verified successfully\n');

    // 8. Check organization's carbon credits
    console.log('8. Checking organization credits...');
    const creditsRes = await axios.get(
      `${API_URL}/organizations/${organizationId}/credits`,
      {
        headers: { Authorization: `Bearer ${employerToken}` }
      }
    );
    console.log('✓ Organization credits:', creditsRes.data, '\n');

    // 9. Get market statistics
    console.log('9. Getting market statistics...');
    const statsRes = await axios.get(
      `${API_URL}/credits/market-stats`,
      {
        headers: { Authorization: `Bearer ${employerToken}` }
      }
    );
    console.log('✓ Market statistics:', statsRes.data, '\n');

    console.log('All tests completed successfully! 🎉');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

test(); 