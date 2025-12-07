# Point of Presence - Backend Service

A Node.js/Express backend service for the Point of Presence Point-of-Sale system with SQLite database support.

## Features

- **Product Management**: CRUD operations for products with inventory tracking
- **Sales Management**: Record and track sales transactions with line items
- **User Management**: User authentication and role-based access (Manager, Cashier)
- **Inventory Tracking**: Real-time inventory levels, low-stock alerts, and movement history
- **REST API**: Comprehensive REST API for all operations
- **CORS Support**: Configured for local development and production

## Prerequisites

- Node.js 16+ 
- npm

## Installation

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` file (or use the included `.env.example`):

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```
NODE_ENV=development
PORT=3000
HOST=localhost
DATABASE_PATH=./data/pos.db
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Seed Sample Data

```bash
npm run seed
```

This will populate the database with sample products and users:

**Sample Users:**
- Username: `admin` | Password: `admin123` | Role: Manager
- Username: `cashier1` | Password: `pass123` | Role: Cashier
- Username: `cashier2` | Password: `pass123` | Role: Cashier
- Username: `manager1` | Password: `pass123` | Role: Manager

**Sample Products:** 8 products across Electronics, Accessories, Cables, and Furniture

## API Endpoints

### Health Check
- **GET** `/api/health` - Server status

### Products
- **GET** `/api/products` - List all products
- **GET** `/api/products/:id` - Get product by ID
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product
- **GET** `/api/products/inventory/low-stock` - Get low-stock products

### Sales
- **GET** `/api/sales` - List all sales
- **GET** `/api/sales/:id` - Get sale details with items
- **POST** `/api/sales` - Create new sale
- **GET** `/api/sales/summary/daily` - Get daily sales summary (last 30 days)

### Users
- **GET** `/api/users` - List all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user
- **POST** `/api/users/login` - User login

### Inventory
- **GET** `/api/inventory/levels` - Get current inventory levels
- **GET** `/api/inventory/alerts` - Get low-stock alerts
- **GET** `/api/inventory/movements` - Get inventory movement history
- **POST** `/api/inventory/restock` - Add stock (restock)
- **POST** `/api/inventory/adjust` - Manual inventory adjustment

## API Usage Examples

### Login User
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name":"New Product",
    "sku":"SKU-001",
    "price":99.99,
    "category":"Electronics",
    "stock_quantity":10,
    "reorder_level":5
  }'
```

### Record a Sale
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "cashier_id":"user-id-here",
    "items":[
      {"product_id":"product-id-1","quantity":2,"unit_price":29.99}
    ],
    "payment_method":"cash"
  }'
```

### Restock Product
```bash
curl -X POST http://localhost:3000/api/inventory/restock \
  -H "Content-Type: application/json" \
  -d '{
    "product_id":"product-id",
    "quantity":50,
    "notes":"Weekly restock"
  }'
```

## Database Schema

### users
- `id` (TEXT, PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `password` (TEXT)
- `role` (TEXT: 'manager', 'cashier')
- `name` (TEXT)
- `email` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### products
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT)
- `sku` (TEXT, UNIQUE)
- `category` (TEXT)
- `price` (REAL)
- `cost_price` (REAL)
- `stock_quantity` (INTEGER)
- `reorder_level` (INTEGER)
- `image_url` (TEXT)
- `description` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### sales
- `id` (TEXT, PRIMARY KEY)
- `customer_id` (TEXT)
- `cashier_id` (TEXT, FOREIGN KEY)
- `total_amount` (REAL)
- `payment_method` (TEXT)
- `status` (TEXT)
- `created_at` (DATETIME)

### sales_items
- `id` (TEXT, PRIMARY KEY)
- `sale_id` (TEXT, FOREIGN KEY)
- `product_id` (TEXT, FOREIGN KEY)
- `quantity` (INTEGER)
- `unit_price` (REAL)
- `total_price` (REAL)
- `created_at` (DATETIME)

### inventory_movements
- `id` (TEXT, PRIMARY KEY)
- `product_id` (TEXT, FOREIGN KEY)
- `movement_type` (TEXT: 'sale', 'restock', 'adjustment')
- `quantity` (INTEGER)
- `reference_type` (TEXT)
- `reference_id` (TEXT)
- `notes` (TEXT)
- `created_at` (DATETIME)

## Running Backend with Frontend

From the root directory, run both frontend and backend concurrently:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:backend
```

## Troubleshooting

### Database locked error
- Ensure only one instance of the backend is running
- Delete `data/pos.db` to start fresh

### CORS errors
- Verify `CORS_ORIGIN` in `.env` matches your frontend URL
- Check that both frontend and backend are running

### Port already in use
- Change `PORT` in `.env` to an available port
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`

## Development

The backend uses:
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **UUID** - Unique ID generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## License

MIT
