import { useState, useEffect } from 'react';
import Banner from '../components/ui/Banner';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/Products.css';

function Products() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Search input value
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Products array from backend
  const [products, setProducts] = useState([]);
  
  // Categories array from backend
  const [categories, setCategories] = useState(['all']);
  
  // Loading state - show loader while fetching
  const [loading, setLoading] = useState(true);
  
  // Error state - store error messages
  const [error, setError] = useState(null);

  // ============================================
  // FETCH CATEGORIES ON COMPONENT MOUNT
  // ============================================
  
  /**
   * useEffect with empty dependency array []
   * Runs ONCE when component first loads
   * Perfect for initial data fetching
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        
        // Call API
        const data = await categoriesAPI.getAll();
        
        console.log('Categories fetched:', data);
        
        // Extract category names and convert to lowercase
        const categoryNames = data.map(cat => cat.name.toLowerCase());
        
        // Add 'all' at the beginning
        setCategories(['all', ...categoryNames]);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []); // Empty array = run once on mount

  // ============================================
  // FETCH PRODUCTS WHEN FILTERS CHANGE
  // ============================================
  
  /**
   * useEffect with dependencies [searchTerm, selectedCategory]
   * Runs when searchTerm OR selectedCategory changes
   * Fetches new products based on filters
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching products with filters:', {
          searchTerm,
          selectedCategory
        });
        
        let data;
        
        // Different API calls based on filters
        if (searchTerm) {
          // If there's a search term, search
          data = await productsAPI.search(searchTerm);
        } else if (selectedCategory !== 'all') {
          // If category is selected, filter by category
          data = await productsAPI.filterByCategory(selectedCategory);
        } else {
          // Otherwise, get all products
          data = await productsAPI.getAll();
        }
        
        console.log('Products fetched:', data);
        
        // Handle both paginated and non-paginated responses
        // Paginated: { results: [...], count: 10 }
        // Non-paginated: [...]
        const productsList = data.results || data;
        
        setProducts(productsList);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please make sure the backend is running.');
      } finally {
        // Always set loading to false, even if error
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory]); // Run when these change

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="products-page">
      <Banner 
        title="Our Products" 
        subtitle="Browse our wide range of wholesale products"
      />

      {/* FILTERS SECTION */}
      <div className="filters-section">
        {/* SEARCH BOX */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              console.log('Search term changed:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            className="search-input"
          />
        </div>

        {/* CATEGORY FILTERS */}
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                console.log('Category selected:', category);
                setSelectedCategory(category);
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message" style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          margin: '1rem 0',
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      {/* PRODUCTS GRID OR LOADER */}
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
                Try different search terms or category
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;