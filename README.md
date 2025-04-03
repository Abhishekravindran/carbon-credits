# Carbon Credits Trading Platform

A MERN stack application for managing and trading carbon credits between organizations based on employee travel patterns.

## Features

- User registration and authentication (Employee, Employer, Bank Admin)
- Organization management and approval system
- Employee trip tracking with multiple verification methods
- Carbon credits calculation based on travel mode
- Credit trading system between organizations
- Real-time statistics and reporting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd carbon-credits
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the variables as needed

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the server:
```bash
cd server
npm run dev
```

3. Start the client:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Organizations
- POST /api/organizations - Create organization
- GET /api/organizations/:id - Get organization details
- PATCH /api/organizations/:id - Update organization
- POST /api/organizations/:id/approve - Approve organization
- POST /api/organizations/:id/employees - Add employee

### Trips
- POST /api/trips - Create new trip
- GET /api/trips/my-trips - Get user's trips
- GET /api/trips/organization/:orgId - Get organization's trips
- POST /api/trips/:id/verify - Verify trip
- GET /api/trips/statistics - Get trip statistics

### Carbon Credits
- POST /api/credits/transactions - Initiate credit transaction
- POST /api/credits/transactions/:id/approve - Approve transaction
- GET /api/credits/transactions/organization - Get organization's transactions
- GET /api/credits/market-stats - Get market statistics

## User Roles

1. **Employee**
   - Register and log in
   - Record trips and travel modes
   - View personal carbon credits
   - Upload trip verification data

2. **Employer**
   - Manage organization
   - Approve employee registrations
   - View organization's carbon credits
   - Trade credits with other organizations

3. **Bank Admin**
   - Approve organization registrations
   - Monitor credit transactions
   - View market statistics

## Trip Verification Methods

1. **GPS Tracking**
   - Real-time location tracking
   - Route verification
   - Distance calculation

2. **Ticket Upload**
   - Public transport ticket verification
   - OCR for ticket details
   - Manual review option

3. **Manual Review**
   - Trip details submission
   - Supporting documentation
   - Employer verification

## Carbon Credits Calculation

Points per mile based on transport mode:
- Public Transport: 3 points
- Carpooling: 2 points
- Rideshare: 1.5 points
- Work from Home: 4 points

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing
- Input validation
- Request rate limiting
- Secure headers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License. 