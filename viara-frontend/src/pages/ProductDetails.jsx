import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { productsAPI } from '../services/api';
import '../styles/ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [itemAddedToCart, setItemAddedToCart] = useState(false); // NEW: Track if item was added

  /**
   * WHY: Check if user is logged in before allowing cart actions
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  /**
   * WHY: We need auth token to make authenticated API calls
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    };
  };

  /**
   * WHY: Fetch product data when page loads
   */
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  /**
   * WHY: Add product to cart via backend API
   * WHAT HAPPENS:
   * 1. Check if user is logged in
   * 2. Send POST request to backend with product_id and quantity
   * 3. Backend creates/updates CartItem
   * 4. Show success message
   * 5. Enable "Go to Cart" button
   */
  const handleAddToCart = async () => {
    // Step 1: Check authentication
    if (!isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);

    try {
      // Step 2: Make API call to add item to cart
      const response = await fetch('http://127.0.0.1:8000/api/cart/add_item/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      console.log('Item added to cart:', data);

      // Step 3: Show success message
      alert(`✓ Added ${quantity} x ${product.name} to cart!`);
      
      // Step 4: Reset quantity and enable "Go to Cart" button
      setQuantity(1);
      setItemAddedToCart(true); // NEW: Enable "Go to Cart" button

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  /**
   * WHY: Navigate to cart page
   */
  const handleGoToCart = () => {
    navigate('/cart');
  };

  const getImageUrl = () => {
    if (!product.image) {
      return 'https://via.placeholder.com/600x600?text=No+Image';
    }
    
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    return `http://127.0.0.1:8000${product.image}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="not-found">
        <h2>Error Loading Product</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/products')} className="back-btn">
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="back-btn">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <button onClick={() => navigate('/products')} className="back-btn">
        ← Back to Products
      </button>

      <div className="product-details-container">
        <div className="product-image-section">
          <img 
            src={getImageUrl()} 
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
            }}
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-category">
            Category: <span>{product.category_name || 'N/A'}</span>
          </div>

          <div className="product-price-tag">
           ₹{product.price}
          </div>

          <div className="product-stock">
            {product.in_stock ? (
              <span className="in-stock">✓ In Stock</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="quantity-section">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span className="quantity-display">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          {/* NEW: Cart action buttons section */}
          <div className="cart-actions">
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={!product.in_stock || addingToCart}
            >
              {addingToCart ? 'Adding...' : product.in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
            </button>

            {/* NEW: "Go to Cart" button - only shows after adding item */}
            {itemAddedToCart && (
              <button 
                className="go-to-cart-btn" 
                onClick={handleGoToCart}
              >
                Go to Cart →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;