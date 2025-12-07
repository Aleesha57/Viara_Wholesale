import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import '../styles/Cart.css';

function Cart() {
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    };
  };

  const fetchCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/cart/current/', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      console.log('Cart data:', data);
      setCart(data);

    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) {
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/cart/remove_item/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ item_id: itemId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCart();
      alert('Item removed from cart');

    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) {
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/cart/clear/', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      await fetchCart();
      alert('Cart cleared');

    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ REMOVED: All payment handling functions - moved to Checkout page

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>Shopping Cart</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products" className="continue-shopping-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button 
            onClick={handleClearCart} 
            className="clear-cart-btn"
            disabled={updating}
          >
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={item.product.image || 'https://via.placeholder.com/150x150?text=No+Image'} 
                    alt={item.product.name}
                  />
                </div>

                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-category">{item.product.category_name}</p>
                  <p className="cart-item-price">₹{item.product.price}</p>
                </div>

                <div className="cart-item-quantity">
                  <span className="quantity-label">Quantity:</span>
                  <span className="quantity-value">{item.quantity}</span>
                </div>

                <div className="cart-item-subtotal">
                  <span className="subtotal-label">Subtotal:</span>
                  <span className="subtotal-value">₹{item.subtotal}</span>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-item-btn"
                  disabled={updating}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Items ({cart.items.length}):</span>
              <span>₹{cart.total_price}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>

            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{cart.total_price}</span>
            </div>

            {/* ✅ NEW: Single button to navigate to checkout */}
            <button 
              onClick={() => navigate('/checkout')}
              className="checkout-btn"
              disabled={updating}
            >
              Proceed to Checkout →
            </button>

            <Link to="/products" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;