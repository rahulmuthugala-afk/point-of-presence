import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './config/database.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';
import usersRouter from './routes/users.js';
import inventoryRouter from './routes/inventory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: CORS_ORIGIN.split(',').map(url => url.trim()),
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/users', usersRouter);
app.use('/api/inventory', inventoryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend service is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
async function start() {
  try {
    await database.init();
    app.listen(PORT, HOST, () => {
      console.log(`\n✓ Backend server running at http://${HOST}:${PORT}`);
      console.log(`✓ API endpoints available at http://${HOST}:${PORT}/api/`);
      console.log(`✓ CORS enabled for: ${CORS_ORIGIN}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});

start();
