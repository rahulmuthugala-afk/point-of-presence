import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database.js';

const router = express.Router();

// Get low stock products - MUST come before /:id routes
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const products = await database.all(
      `SELECT * FROM products WHERE stock_quantity <= reorder_level ORDER BY stock_quantity ASC`
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await database.all(
      'SELECT * FROM products ORDER BY name ASC'
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await database.get(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, price, cost_price, stock_quantity, reorder_level, image_url, description } = req.body;

    if (!name || !sku || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, sku, price' });
    }

    const id = uuidv4();
    await database.run(
      `INSERT INTO products (id, name, sku, category, price, cost_price, stock_quantity, reorder_level, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, sku, category, price, cost_price, stock_quantity || 0, reorder_level || 10, image_url, description]
    );

    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category, price, cost_price, stock_quantity, reorder_level, image_url, description } = req.body;
    const id = req.params.id;

    // Check if product exists
    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await database.run(
      `UPDATE products SET name = ?, sku = ?, category = ?, price = ?, cost_price = ?, stock_quantity = ?, reorder_level = ?, image_url = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || product.name, sku || product.sku, category || product.category, price !== undefined ? price : product.price, cost_price || product.cost_price, stock_quantity !== undefined ? stock_quantity : product.stock_quantity, reorder_level || product.reorder_level, image_url || product.image_url, description || product.description, id]
    );

    const updated = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await database.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
