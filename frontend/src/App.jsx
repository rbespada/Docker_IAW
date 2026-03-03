import React, { useState, useEffect } from 'react';
import { getProducts, addToCart } from './api';
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading">Cargando productos...</div>;

  return (
    <div className="app">
      <h1>🛍️ Tienda Online - Microservicios</h1>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-card">
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
