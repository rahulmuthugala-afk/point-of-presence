import { database } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const sampleProducts = [
  {
    name: 'Laptop',
    sku: 'LAPTOP-001',
    category: 'Electronics',
    price: 999.99,
    cost_price: 500,
    stock_quantity: 15,
    reorder_level: 5
  },
  {
    name: 'Wireless Mouse',
    sku: 'MOUSE-001',
    category: 'Accessories',
    price: 29.99,
    cost_price: 10,
    stock_quantity: 50,
    reorder_level: 20
  },
  {
    name: 'USB-C Cable',
    sku: 'CABLE-001',
    category: 'Cables',
    price: 14.99,
    cost_price: 5,
    stock_quantity: 100,
    reorder_level: 30
  },
  {
    name: 'Monitor 27"',
    sku: 'MONITOR-001',
    category: 'Electronics',
    price: 299.99,
    cost_price: 150,
    stock_quantity: 8,
    reorder_level: 3
  },
  {
    name: 'Keyboard Mechanical',
    sku: 'KEYBOARD-001',
    category: 'Accessories',
    price: 89.99,
    cost_price: 40,
    stock_quantity: 25,
    reorder_level: 10
  },
  {
    name: 'Webcam HD',
    sku: 'WEBCAM-001',
    category: 'Electronics',
    price: 59.99,
    cost_price: 25,
    stock_quantity: 32,
    reorder_level: 10
  },
  {
    name: 'USB Hub',
    sku: 'HUB-001',
    category: 'Accessories',
    price: 39.99,
    cost_price: 15,
    stock_quantity: 45,
    reorder_level: 15
  },
  {
    name: 'Desk Lamp LED',
    sku: 'LAMP-001',
    category: 'Furniture',
    price: 44.99,
    cost_price: 20,
    stock_quantity: 2,
    reorder_level: 5
  }
];

const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'manager',
    name: 'Admin User',
    email: 'admin@easymart.com'
  },
  {
    username: 'cashier1',
    password: 'pass123',
    role: 'cashier',
    name: 'John Doe',
    email: 'john@easymart.com'
  },
  {
    username: 'cashier2',
    password: 'pass123',
    role: 'cashier',
    name: 'Jane Smith',
    email: 'jane@easymart.com'
  },
  {
    username: 'manager1',
    password: 'pass123',
    role: 'manager',
    name: 'Mike Johnson',
    email: 'mike@easymart.com'
  }
];

async function seedDatabase() {
  try {
    await database.init();
    
    console.log('Seeding database...');

    // Insert users
    console.log('Adding sample users...');
    for (const user of sampleUsers) {
      const id = uuidv4();
      await database.run(
        `INSERT INTO users (id, username, password, role, name, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, user.username, user.password, user.role, user.name, user.email]
      );
    }

    // Insert products
    console.log('Adding sample products...');
    for (const product of sampleProducts) {
      const id = uuidv4();
      await database.run(
        `INSERT INTO products (id, name, sku, category, price, cost_price, stock_quantity, reorder_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, product.name, product.sku, product.category, product.price, product.cost_price, product.stock_quantity, product.reorder_level]
      );
    }

    console.log('✓ Database seeded successfully!');
    console.log(`✓ Added ${sampleUsers.length} users`);
    console.log(`✓ Added ${sampleProducts.length} products`);
    
    await database.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    await database.close();
    process.exit(1);
  }
}

seedDatabase();
