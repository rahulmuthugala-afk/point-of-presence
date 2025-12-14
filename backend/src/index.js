import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { database } from './config/database.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';
import usersRouter from './routes/users.js';
import inventoryRouter from './routes/inventory.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173';

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message received:', data.type);
      
      // Broadcast to all other clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast function for server-side events
export function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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

// Get public path for static files
const publicPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'public')
  : path.join(process.cwd(), '../dist');

// Serve static frontend files
app.use(express.static(publicPath));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/users', usersRouter);
app.use('/api/inventory', inventoryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend service is running', timestamp: new Date().toISOString() });
});

// Role-based routes - redirect to main app with role parameter
app.get('/customer', (req, res) => {
  res.redirect('/?role=customer');
});

app.get('/manager', (req, res) => {
  res.redirect('/?role=manager');
});

app.get('/cashier', (req, res) => {
  res.redirect('/?role=cashier');
});

// Error handling for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message });
});

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Endpoint not found' });
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// Initialize database and start server
async function start() {
  try {
    await database.init();
    server.listen(PORT, HOST, () => {
      console.log(`\n✓ Backend server running at http://${HOST}:${PORT}`);
      console.log(`✓ WebSocket server running at ws://${HOST}:${PORT}`);
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
