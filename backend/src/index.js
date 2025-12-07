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
// Bind to 0.0.0.0 in development so remote forwarded ports (codespaces / devhosts)
// can reach the server. You can override HOST in production via .env.
const HOST = process.env.HOST || '0.0.0.0';
// Allow additional origins for Codespaces preview; keep configurable via .env
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

// Root route to make the server friendly when opened directly in the browser
app.get('/', (req, res) => {
  res.json({
    message: 'PointOfPresence backend - available API endpoints under /api',
    routes: ['/api/health', '/api/products', '/api/sales', '/api/users', '/api/inventory']
  });
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
