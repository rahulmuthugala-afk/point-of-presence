# Point of Presence - POS System

A modern, full-stack Point-of-Sale system with a React frontend and Node.js/Express backend.

## Project Structure

```
point-of-presence/
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── store/           # Zustand store
│   └── ...
├── backend/             # Express.js backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── config/     # Database config
│   │   └── index.js    # Server entry
│   └── package.json
├── package.json         # Root dependencies
└── vite.config.ts       # Frontend build config
```

## Quick Start

### Prerequisites
- Node.js 16+
- npm

### Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev

# Frontend runs at http://localhost:8080
```

### Backend Setup

```bash
# Install backend dependencies
cd backend && npm install

# Start backend server
npm run dev

# Backend runs at http://localhost:3000
```

### Run Both Concurrently

```bash
npm run dev:all
```

This starts both frontend (port 8080) and backend (port 3000) simultaneously.

## Backend Documentation

See [backend/README.md](./backend/README.md) for detailed API documentation and backend setup instructions.

### Quick Backend Commands

```bash
# Start backend dev server
npm run dev:backend

# Seed database with sample data
npm run backend:seed

# Backend API health check
curl http://localhost:3000/api/health
```

### Sample Login Credentials

After seeding the database, use these credentials:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Manager |
| cashier1 | pass123 | Cashier |
| cashier2 | pass123 | Cashier |

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/summary/daily` - Daily summary

### Inventory
- `GET /api/inventory/levels` - Current stock levels
- `GET /api/inventory/alerts` - Low stock alerts
- `POST /api/inventory/restock` - Add stock

### Users
- `GET /api/users` - List users
- `POST /api/users/login` - User login

See [backend/README.md](./backend/README.md) for complete API documentation.

## Development

### Frontend Development

Edit React components in `src/components/` and pages in `src/pages/`. Changes hot-reload automatically.

### Backend Development

Edit Express routes in `backend/src/routes/`. Changes require server restart.

Database schema and models are in `backend/src/config/database.js`.

## Database

Uses SQLite for easy local development. Database file is stored at `backend/data/pos.db`.

Tables:
- `users` - User accounts and roles
- `products` - Product catalog
- `sales` - Sales transactions
- `sales_items` - Line items in sales
- `inventory_movements` - Stock tracking history
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/762e86c2-4db0-40c3-884b-e6dc0a832ebd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
