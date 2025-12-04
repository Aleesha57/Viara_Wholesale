import { Link } from 'react-router-dom';
import '../../styles/ProductCard.css';

function ProductCard({ product }) {
  /**
   * Handle image URL
   * Backend might return:
   * 1. Full URL: http://127.0.0.1:8000/media/products/image.jpg
   * 2. Relative URL: /media/products/image.jpg
   * 3. null/undefined
   */
  const getImageUrl = () => {
    if (!product.image) {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
    
    // If image starts with http, it's already full URL
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    // Otherwise, prepend backend URL
    return `http://127.0.0.1:8000${product.image}`;
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={getImageUrl()} 
          alt={product.name}
          onError={(e) => {
            // If image fails to load, show placeholder
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price}</p>
        
        <Link to={`/products/${product.id}`} className="details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;