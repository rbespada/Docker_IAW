require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/cart', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cart_items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/cart', async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cart_items (product_id, quantity) VALUES ($1,$2) RETURNING *',
      [product_id, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(process.env.PORT || 4002, () => {
  console.log('Cart service running on port', process.env.PORT || 4002);
});
