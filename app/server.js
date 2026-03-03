const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inicializar base de datos
const db = new sqlite3.Database('/data/tienda.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL,
      imagen TEXT,
      categoria TEXT
    )
  `);

  // Insertar datos de ejemplo si la tabla está vacía
  db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
    if (err) console.error(err);
    if (row && row.count === 0) {
      const productos = [
        { nombre: 'Laptop Dell XPS 13', descripcion: 'Portátil ultraligero', precio: 1299.99, stock: 5, imagen: '/images/laptop.jpg', categoria: 'Electrónica' },
        { nombre: 'Mouse Logitech MX', descripcion: 'Ratón inalámbrico avanzado', precio: 99.99, stock: 15, imagen: '/images/mouse.jpg', categoria: 'Periféricos' },
        { nombre: 'Teclado Mecánico', descripcion: 'Teclado gaming RGB', precio: 149.99, stock: 8, imagen: '/images/keyboard.jpg', categoria: 'Periféricos' },
        { nombre: 'Monitor LG 27"', descripcion: 'Monitor 4K con HDR', precio: 399.99, stock: 3, imagen: '/images/monitor.jpg', categoria: 'Monitores' },
        { nombre: 'Webcam Logitech HD', descripcion: 'Cámara 1080p para streaming', precio: 79.99, stock: 12, imagen: '/images/webcam.jpg', categoria: 'Periféricos' }
      ];
      
      const stmt = db.prepare("INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?)");
      productos.forEach(p => {
        stmt.run(p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.categoria);
      });
      stmt.finalize();
      console.log('✓ Base de datos inicializada con productos de ejemplo');
    }
  });
});

// Rutas API

// GET /api/productos - Listar todos los productos
app.get('/api/productos', (req, res) => {
  const categoria = req.query.categoria;
  let sql = 'SELECT * FROM productos';
  
  if (categoria) {
    sql += ` WHERE categoria = '${categoria}'`;
  }
  
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/productos/:id - Obtener detalles de un producto
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json(row);
  });
});

// POST /api/carrito - Simular carrito (en memoria para este ejemplo)
const carrito = [];

app.post('/api/carrito', (req, res) => {
  const { productoId, cantidad } = req.body;
  
  if (!productoId || !cantidad) {
    res.status(400).json({ error: 'ID de producto y cantidad son requeridos' });
    return;
  }
  
  db.get('SELECT * FROM productos WHERE id = ?', [productoId], (err, producto) => {
    if (err || !producto) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    
    const item = { ...producto, cantidad };
    carrito.push(item);
    res.json({ mensaje: 'Producto añadido al carrito', carrito });
  });
});

// GET /api/carrito - Ver carrito
app.get('/api/carrito', (req, res) => {
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  res.json({ items: carrito, total: total.toFixed(2), cantidad_items: carrito.length });
});

// DELETE /api/carrito - Vaciar carrito
app.delete('/api/carrito', (req, res) => {
  carrito.length = 0;
  res.json({ mensaje: 'Carrito vaciado', carrito });
});

// Rutas vistas

// GET / - Página principal
app.get('/', (req, res) => {
  db.all('SELECT * FROM productos LIMIT 6', (err, productos) => {
    res.render('index', { titulo: 'Tienda Online - WebStack', productos });
  });
});

// GET /catalogo - Catálogo completo
app.get('/catalogo', (req, res) => {
  db.all('SELECT * FROM productos', (err, productos) => {
    res.render('catalogo', { titulo: 'Catálogo - Tienda Online', productos });
  });
});

// GET /carrito - Vista del carrito
app.get('/carrito-view', (req, res) => {
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  res.render('carrito', { 
    titulo: 'Mi Carrito - Tienda Online', 
    items: carrito, 
    total: total.toFixed(2),
    cantidad_items: carrito.length 
  });
});

// GET /producto/:id - Detalle del producto
app.get('/producto/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, producto) => {
    if (err || !producto) {
      res.status(404).render('error', { mensaje: 'Producto no encontrado' });
      return;
    }
    res.render('producto', { titulo: `${producto.nombre} - Tienda Online`, producto });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', { mensaje: 'Página no encontrada (404)' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`✓ Endpoint de API disponible en http://localhost:${PORT}/api/productos`);
});

// Cerrar base de datos al salir
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Base de datos cerrada');
    process.exit(0);
  });
});
