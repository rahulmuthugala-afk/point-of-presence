import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/database.js';

const router = express.Router();

// Login endpoint - MUST come before /:id routes
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = await database.get(
      'SELECT id, username, role, name FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await database.all(
      'SELECT id, username, role, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, username, role, name, email, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields: username, password' });
    }

    const id = uuidv4();
    await database.run(
      `INSERT INTO users (id, username, password, role, name, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, username, password, role || 'cashier', name, email]
    );

    const user = await database.get(
      'SELECT id, username, role, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { role, name, email } = req.body;
    const id = req.params.id;

    const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await database.run(
      `UPDATE users SET role = ?, name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [role || user.role, name || user.name, email || user.email, id]
    );

    const updated = await database.get(
      'SELECT id, username, role, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await database.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully', id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
