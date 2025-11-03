require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation: http://localhost:${PORT}`);
  });
});
