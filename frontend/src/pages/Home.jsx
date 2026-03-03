import React, { useState, useEffect } from 'react';
import { getProducts, addToCart } from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ product_id: productId, quantity: 1 });
      alert('Producto añadido al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const filtered = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading">Cargando productos...</div>;

  return (
    <div className="home-page">
      <header className="catalog-header">
        <div className="categories">
          {['All', 'Hombre', 'Mujer', 'Ofertas'].map(cat => (
            <button
              key={cat}
              className={category === cat ? 'active' : ''}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      <div className="products">
        {filtered.map(product => (
          <div key={product.id} className="product-card">
            <img
              src={product.image_url || 'https://via.placeholder.com/300'}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price}</p>
            <p className="stock">Stock: {product.stock}</p>
            <button onClick={() => handleAddToCart(product.id)}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
