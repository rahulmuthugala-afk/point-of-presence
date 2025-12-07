import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database.js';

const router = express.Router();

// Get current inventory levels
router.get('/levels', async (req, res) => {
  try {
    const inventory = await database.all(
      `SELECT id, name, sku, stock_quantity, reorder_level, price, cost_price
       FROM products
       ORDER BY name ASC`
    );
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get low stock alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await database.all(
      `SELECT id, name, sku, stock_quantity, reorder_level
       FROM products
       WHERE stock_quantity <= reorder_level
       ORDER BY stock_quantity ASC`
    );
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get inventory movements
router.get('/movements', async (req, res) => {
  try {
    const movements = await database.all(
      `SELECT im.*, p.name, p.sku
       FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       ORDER BY im.created_at DESC
       LIMIT 100`
    );
    res.json(movements);
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add stock (restock)
router.post('/restock', async (req, res) => {
  try {
    const { product_id, quantity, notes } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'Missing required fields: product_id, quantity' });
    }

    const product = await database.get('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product stock
    await database.run(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantity, product_id]
    );

    // Record movement
    const movementId = uuidv4();
    await database.run(
      `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [movementId, product_id, 'restock', quantity, notes]
    );

    const updated = await database.get('SELECT * FROM products WHERE id = ?', [product_id]);
    res.json(updated);
  } catch (error) {
    console.error('Error restocking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Adjust stock (manual adjustment)
router.post('/adjust', async (req, res) => {
  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: product_id, quantity' });
    }

    const product = await database.get('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product stock
    await database.run(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantity, product_id]
    );

    // Record movement
    const movementId = uuidv4();
    await database.run(
      `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [movementId, product_id, 'adjustment', quantity, reason]
    );

    const updated = await database.get('SELECT * FROM products WHERE id = ?', [product_id]);
    res.json(updated);
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
