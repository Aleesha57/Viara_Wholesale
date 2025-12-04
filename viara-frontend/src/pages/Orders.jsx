import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import '../styles/Orders.css';

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check if user is logged in
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  /**
   * Get auth headers
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    };
  };

  /**
   * Fetch orders
   */
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/orders/', {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Orders:', data);
        setOrders(data.results || data);

      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /**
   * Get status badge class
   */
  const getStatusClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>My Orders</h1>
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping to place your first order!</p>
            <button 
              onClick={() => navigate('/products')}
              className="shop-now-btn"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order #{ order.id}</strong>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-items">
                {order.items && order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <span>{item.product_name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total:</strong>
                  <strong>₹{order.total_amount}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;