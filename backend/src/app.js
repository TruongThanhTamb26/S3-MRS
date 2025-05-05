const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const routes = require('./routes');
const schedulerService = require('./services/scheduler.service');


// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Chạy scheduler mỗi 5 phút
const SCHEDULER_INTERVAL = 5 * 60 * 1000; // 5 phút

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logger
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/api', routes); // API routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Study Space Management API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Import syncModels
const { syncModels } = require('./models');

// Đồng bộ models trước khi khởi động server
syncModels().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

setInterval(async () => {
  console.log('Running scheduled tasks...');
  try {
    const result = await schedulerService.runAllTasks();
    console.log(`Auto tasks completed: cancelled ${result.cancelledCount}, checked-out ${result.checkedOutCount}`);
  } catch (error) {
    console.error('Error running scheduled tasks:', error);
  }
}, SCHEDULER_INTERVAL);