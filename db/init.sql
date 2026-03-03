-- Inicialización de esquema para microservicios

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos iniciales
INSERT INTO products (name, description, price, stock) VALUES
  ('Laptop Dell XPS', 'Laptop de rendimiento superior', 999.99, 5),
  ('Mouse Logitech', 'Mouse inalámbrico de precisión', 29.99, 20),
  ('Teclado Mecánico', 'Teclado gaming RGB', 79.99, 10),
  ('Monitor Dell 27"', 'Monitor IPS 4K', 349.99, 3),
  ('Mochila Asus', 'Mochila para laptops', 49.99, 15)
ON CONFLICT DO NOTHING;
