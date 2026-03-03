import React, { useState, useEffect } from 'react';
import { getCart, addToCart } from '../api';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };
    fetchCart();
  }, [refresh]);

  const handleQuantityChange = async (item, qty) => {
    // simply re-add with new quantity for demo (real backend would update)
    try {
      await addToCart({ product_id: item.product_id, quantity: qty });
      setRefresh(r => !r);
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * (i.price || 0), 0);

  return (
    <div className="cart-page">
      <h2>🛒 Bolsa de Compras</h2>
      <div className="cart-container">
        <div className="cart-items">
          {items.map(i => (
            <div key={i.id} className="cart-item">
              <img
                src={i.image_url || 'https://via.placeholder.com/100'}
                alt="producto"
              />
              <div className="item-details">
                <p>{i.name || 'Producto'}</p>
                <p>Talla: {i.size || 'M'}</p>
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={e => handleQuantityChange(i, Number(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <button>Finalizar Compra</button>
        </div>
      </div>
    </div>
  );
}
