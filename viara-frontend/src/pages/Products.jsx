import { useState, useEffect } from 'react';
import Banner from '../components/ui/Banner';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/Products.css';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(false);

  /**
   * WHY: Fetch categories when component mounts
   * This runs ONCE when page loads
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Starting to fetch categories...');
        
        // Direct fetch to test
        const response = await fetch('http://127.0.0.1:8000/api/categories/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw categories data:', data);

        // Handle both array and paginated responses
        let categoriesList = [];
        if (Array.isArray(data)) {
          categoriesList = data;
        } else if (data.results && Array.isArray(data.results)) {
          categoriesList = data.results;
        }

        console.log('Processed categories:', categoriesList);

        // Extract category names
        const categoryNames = categoriesList.map(cat => cat.name.toLowerCase());
        console.log('Category names:', categoryNames);

        setCategories(['all', ...categoryNames]);
        setCategoriesError(false);

      } catch (error) {
        console.error('Detailed error fetching categories:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        setCategoriesError(true);
        // Still show 'all' even if categories fail
        setCategories(['all']);
      }
    };

    fetchCategories();
  }, []);

  /**
   * WHY: Fetch products when filters change
   * Runs whenever searchTerm or selectedCategory changes
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching products with:', { searchTerm, selectedCategory });

        let data;

        if (searchTerm) {
          data = await productsAPI.search(searchTerm);
        } else if (selectedCategory !== 'all') {
          data = await productsAPI.filterByCategory(selectedCategory);
        } else {
          data = await productsAPI.getAll();
        }

        console.log('Products response:', data);

        // Handle both formats
        const productsList = data.results || data;
        
        console.log('Setting products:', productsList);
        setProducts(Array.isArray(productsList) ? productsList : []);

      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please make sure the backend is running.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory]);

  return (
    <div className="products-page">
      <Banner 
        title="Our Products" 
        subtitle="Browse our wide range of wholesale products"
      />

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              console.log('Search term:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categoriesError && (
            <div className="categories-error-notice">
              ⚠️ Categories couldn't load from backend. Showing all products.
            </div>
          )}
          
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                console.log('Selected category:', category);
                setSelectedCategory(category);
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <br />
          <small>
            Make sure Django backend is running at http://127.0.0.1:8000
          </small>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <Loader />
      ) : (
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Try different search terms or check if backend is running
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;