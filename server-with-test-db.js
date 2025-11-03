require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const employeeRoutes = require('./routes/employee');
const enquiryRoutes = require('./routes/enquiry');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'CRM System API',
    version: '1.0.0',
    database: 'In-Memory MongoDB (for testing)',
    endpoints: {
      employee: {
        register: 'POST /api/employee/register',
        login: 'POST /api/employee/login'
      },
      enquiry: {
        submit: 'POST /api/enquiry/submit (no auth required)',
        unclaimed: 'GET /api/enquiry/unclaimed (auth required)',
        claimed: 'GET /api/enquiry/claimed (auth required)',
        claim: 'POST /api/enquiry/claim/:id (auth required)'
      }
    }
  });
});

app.use('/api/employee', employeeRoutes);
app.use('/api/enquiry', enquiryRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    console.log('Starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    console.log('Connecting to in-memory MongoDB...');
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation: http://localhost:${PORT}`);
      console.log('\nYou can now run tests with: node test-api.js');
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
