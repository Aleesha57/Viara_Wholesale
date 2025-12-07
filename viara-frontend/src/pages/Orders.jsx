import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import '../styles/Orders.css';

function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      alert('Please login to view your orders');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8000/api/orders/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, orderStatus) => {
    // Check if order can be cancelled
    if (orderStatus === 'cancelled') {
      alert('This order is already cancelled');
      return;
    }

    if (orderStatus === 'delivered') {
      alert('Cannot cancel delivered orders');
      return;
    }

    if (orderStatus === 'shipped') {
      alert('Cannot cancel shipped orders. Please contact support.');
      return;
    }

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (!confirmCancel) return;

    setCancellingOrderId(orderId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      alert('Order cancelled successfully!');
      fetchOrders(); // Refresh orders list

    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#2196F3',
      shipped: '#9c27b0',
      delivered: '#4CAF50',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  const canCancelOrder = (status) => {
    return ['pending', 'processing'].includes(status);
  };

  if (loading) return <Loader />;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate('/products')} className="shop-btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id-section">
                    <h3>Order #{order.id}</h3>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="order-status-section">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(order.status),
                        color: 'white'
                      }}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {order.payment_method_display || order.payment_method || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value total-amount">₹{order.total_amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Shipping Address:</span>
                    <span className="detail-value">{order.shipping_address}</span>
                  </div>
                  {order.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{order.phone}</span>
                    </div>
                  )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>Order Items:</h4>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.product_name || 'Product'}</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="order-actions">
                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id, order.status)}
                      className="cancel-order-btn"
                      disabled={cancellingOrderId === order.id}
                    >
                      {cancellingOrderId === order.id ? 'Cancelling...' : '❌ Cancel Order'}
                    </button>
                  )}
                  {order.status === 'cancelled' && (
                    <span className="cancelled-text">Order Cancelled</span>
                  )}
                  {order.status === 'delivered' && (
                    <span className="delivered-text">✓ Delivered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;