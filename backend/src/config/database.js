const mysql = require('mysql2'); // Import mysql2 package for MySQL database connection
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file


// Create a connection pool to the MySQL database using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, 
    connectionLimit: 10, // Maximum number of connections to create at once
    queueLimit: 0 
  });
  
  module.exports = pool;