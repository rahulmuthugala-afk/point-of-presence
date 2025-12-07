import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database.js';

const router = express.Router();

// Get sales summary - MUST come before /:id routes
router.get('/summary/daily', async (req, res) => {
  try {
    const summary = await database.all(
      `SELECT DATE(created_at) as date, COUNT(*) as transaction_count, SUM(total_amount) as total_sales
       FROM sales
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    );
    res.json(summary);
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await database.all(
      `SELECT s.*, COUNT(si.id) as item_count FROM sales s
       LEFT JOIN sales_items si ON s.id = si.sale_id
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID with items
router.get('/:id', async (req, res) => {
  try {
    const sale = await database.get(
      'SELECT * FROM sales WHERE id = ?',
      [req.params.id]
    );

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const items = await database.all(
      `SELECT si.*, p.name, p.sku FROM sales_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [req.params.id]
    );

    res.json({ ...sale, items });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const { customer_id, cashier_id, items, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    const saleId = uuidv4();
    let totalAmount = 0;

    // Calculate total and validate items
    for (const item of items) {
      const product = await database.get('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      totalAmount += item.quantity * item.unit_price;
    }

    // Create sale
    await database.run(
      `INSERT INTO sales (id, customer_id, cashier_id, total_amount, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [saleId, customer_id, cashier_id, totalAmount, payment_method]
    );

    // Create sale items and update inventory
    for (const item of items) {
      const itemId = uuidv4();
      const totalPrice = item.quantity * item.unit_price;

      await database.run(
        `INSERT INTO sales_items (id, sale_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, saleId, item.product_id, item.quantity, item.unit_price, totalPrice]
      );

      // Record inventory movement
      const movementId = uuidv4();
      await database.run(
        `INSERT INTO inventory_movements (id, product_id, movement_type, quantity, reference_type, reference_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [movementId, item.product_id, 'sale', -item.quantity, 'sale', saleId]
      );

      // Update product stock
      await database.run(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    const sale = await database.get(
      `SELECT s.*, COUNT(si.id) as item_count FROM sales s
       LEFT JOIN sales_items si ON s.id = si.sale_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [saleId]
    );

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
