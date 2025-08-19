import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';

// ESM-specific helpers
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'assessmate'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  createUsersTable();
});

// Function to create users table
const createUsersTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      roll_no VARCHAR(50) UNIQUE,
      year_of_study INT,
      department VARCHAR(100),
      college_name VARCHAR(255),
      mobile_no VARCHAR(15) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      user_role TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
      createDefaultAdmin();
    }
  });
};

// Function to create default admin user
const createDefaultAdmin = () => {
  const checkAdminQuery = 'SELECT * FROM users WHERE user_role = 0 LIMIT 1';
  
  db.query(checkAdminQuery, (err, results) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }
    
    if (results.length === 0) {
      const createAdminQuery = `
        INSERT INTO users (name, email, password, mobile_no, user_role) 
        VALUES ('Admin', 'admin@assessmate.com', 'admin123', '9999999999', 0)
      `;
      
      db.query(createAdminQuery, (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Default admin user created');
          console.log('Admin login: admin@assessmate.com / admin123');
        }
      });
    }
  });
};

// Attach DB to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Debug middleware - IMPORTANT: This shows all incoming requests
app.use((req, res, next) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Path: ${req.path}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`========================\n`);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AssessMate API is running' });
});

// 404 handler - MUST be at the end
app.use('*', (req, res) => {
  console.log(`\n!!! 404 NOT FOUND !!!`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`!!!!!!!!!!!!!!!!!!!!\n`);
  
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;