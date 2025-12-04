import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Shipping and payment form data
  const [formData, setFormData] = useState({
    shipping_address: '',
    phone: '',
    payment_method: 'cod' // Default to Cash on Delivery
  });

  /**
   * WHY: Get authentication token for API calls
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    };
  };

  /**
   * WHY: Fetch cart to display order summary
   * FIXED: Added navigate to dependency array
   */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/cart/current/', {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          alert('Your cart is empty');
          navigate('/cart');
          return;
        }

        setCart(data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]); // ✅ FIXED: Added navigate dependency

  /**
   * WHY: Handle form input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * WHY: Validate form before submission
   */
  const validateForm = () => {
    if (!formData.shipping_address.trim()) {
      alert('Please enter shipping address');
      return false;
    }

    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return false;
    }

    if (formData.phone.length < 10) {
      alert('Please enter valid phone number');
      return false;
    }

    return true;
  };

  /**
   * WHY: Place order with COD or Online payment
   * WHAT HAPPENS:
   * 1. Validate form
   * 2. If COD - directly create order
   * 3. If Online - open Razorpay
   * 4. Send shipping details to backend
   * 5. Backend creates order and stores shipping info
   */
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (formData.payment_method === 'cod') {
        // CASH ON DELIVERY - No payment gateway needed
        const response = await fetch('http://127.0.0.1:8000/api/orders/create_from_cart/', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            payment_method: 'cod',
            shipping_address: formData.shipping_address,
            phone: formData.phone
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        const data = await response.json();
        console.log('Order created:', data);

        alert('✓ Order placed successfully! You will pay on delivery.\nOrder ID: #' + data.order.id);
        navigate('/orders');

      } else {
        // ONLINE PAYMENT - Use Razorpay
        handleOnlinePayment();
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      alert('Failed to place order: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * WHY: Handle Razorpay payment
   */
  const handleOnlinePayment = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with your key
        amount: Math.round(parseFloat(cart.total_price) * 100),
        currency: 'INR',
        name: 'VIARA Wholesale',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            const orderResponse = await fetch('http://127.0.0.1:8000/api/orders/create_from_cart/', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                payment_method: 'online',
                payment_id: response.razorpay_payment_id,
                shipping_address: formData.shipping_address,
                phone: formData.phone
              })
            });

            if (!orderResponse.ok) {
              throw new Error('Failed to create order');
            }

            const orderData = await orderResponse.json();
            alert('✓ Payment successful! Order placed.\nOrder ID: #' + orderData.order.id);
            navigate('/orders');

          } catch (error) {
            alert('Payment received but failed to create order. Please contact support.');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user'))?.username || '',
          email: JSON.parse(localStorage.getItem('user'))?.email || '',
          contact: formData.phone
        },
        theme: {
          color: '#3498db'
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };

    script.onerror = () => {
      setSubmitting(false);
      alert('Failed to load payment gateway. Please try again.');
    };
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          {/* LEFT SIDE: Shipping & Payment Form */}
          <div className="checkout-form-section">
            <h2>Shipping Information</h2>
            
            <form className="checkout-form">
              <div className="form-group">
                <label htmlFor="shipping_address">Delivery Address *</label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="House no, Street, Area, City, State, PIN"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter 10 digit mobile number"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                    />
                    <span className="payment-icon">💵</span>
                    <span>Cash on Delivery</span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={formData.payment_method === 'online'}
                      onChange={handleChange}
                    />
                    <span className="payment-icon">💳</span>
                    <span>Online Payment (UPI/Card)</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cart.items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <img 
                    src={item.product.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                    alt={item.product.name}
                  />
                  <div className="checkout-item-details">
                    <h4>{item.product.name}</h4>
                    <p>Qty: {item.quantity} × ₹{item.product.price}</p>
                    <p className="checkout-item-price">₹{item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{cart.total_price}</span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span>Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{cart.total_price}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="place-order-btn"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 
                formData.payment_method === 'cod' 
                  ? '📦 Place Order (COD)' 
                  : '💳 Pay Now'}
            </button>

            <button 
              onClick={() => navigate('/cart')}
              className="back-to-cart-btn"
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;