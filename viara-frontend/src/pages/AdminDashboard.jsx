import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user } = useContext(AuthContext);

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingOrders: 0
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [newCategory, setNewCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Product form states
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    in_stock: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Check admin access
  useEffect(() => {
    if (!isLoggedIn) {
      alert('Please login to access admin dashboard');
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      alert('Admin access required');
      navigate('/');
      return;
    }
  }, [isLoggedIn, isAdmin, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchDashboardData();
    }
  }, [isLoggedIn, isAdmin]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Token ${token}`
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch('http://127.0.0.1:8000/api/products/', {
        headers: getAuthHeaders()
      });
      const productsData = await productsRes.json();
      const productsList = Array.isArray(productsData) ? productsData : productsData.results || [];
      setProducts(productsList);

      // Fetch orders
      const ordersRes = await fetch('http://127.0.0.1:8000/api/orders/', {
        headers: getAuthHeaders()
      });
      const ordersData = await ordersRes.json();
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.results || [];
      setOrders(ordersList);

      // Fetch categories
      const categoriesRes = await fetch('http://127.0.0.1:8000/api/categories/');
      const categoriesData = await categoriesRes.json();
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData.results || [];
      setCategories(categoriesList);

      // Calculate stats
      setStats({
        totalProducts: productsList.length,
        totalOrders: ordersList.length,
        totalCategories: categoriesList.length,
        pendingOrders: ordersList.filter(o => o.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PRODUCT CRUD ====================
  
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductForm({ ...productForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      in_stock: true,
      image: null
    });
    setImagePreview(null);
    setEditingProduct(null);
    setShowAddProductForm(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('in_stock', productForm.in_stock);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch('http://127.0.0.1:8000/api/products/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add product');

      alert('Product added successfully!');
      resetProductForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      in_stock: product.in_stock,
      image: null
    });
    setImagePreview(product.image);
    setShowAddProductForm(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('in_stock', productForm.in_stock);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/products/${editingProduct}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update product');

      alert('Product updated successfully!');
      resetProductForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete product');

      alert('Product deleted successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleStock = async (productId, currentStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ in_stock: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to toggle stock');

      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling stock:', error);
      alert('Failed to update stock status');
    }
  };

  // ==================== ORDER HANDLERS ====================
  
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order');

      alert('Order status updated!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  // ==================== CATEGORY HANDLERS ====================
  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories/', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategory })
      });

      if (!response.ok) throw new Error('Failed to add category');

      alert('Category added successfully!');
      setNewCategory('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete this category? Products using it will need reassignment.')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete category');

      alert('Category deleted successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // ==================== FILTER FUNCTIONS ====================
  
  const getFilteredOrders = () => {
    if (filterStatus === 'all') return orders;
    return orders.filter(order => order.status === filterStatus);
  };

  const getFilteredProducts = () => {
    if (!searchTerm) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button onClick={fetchDashboardData} className="refresh-btn">
            🔄 Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.totalCategories}</h3>
              <p>Categories</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products ({products.length})
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button 
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categories.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Orders Yet</h3>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id}>
                          <td><strong>#{order.id}</strong></td>
                          <td>{order.user || 'Unknown'}</td>
                          <td><strong>₹{order.total_amount}</strong></td>
                          <td>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== PRODUCTS TAB ==================== */}
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>Manage Products</h2>
                <div className="header-actions">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button 
                    className="add-btn"
                    onClick={() => {
                      resetProductForm();
                      setShowAddProductForm(true);
                    }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {/* Add Product Form */}
              {showAddProductForm && (
                <div className="product-form-card">
                  <div className="form-card-header">
                    <h3>Add New Product</h3>
                    <button onClick={resetProductForm} className="close-btn">✕</button>
                  </div>
                  <form onSubmit={handleAddProduct} className="inline-product-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          name="category"
                          value={productForm.category}
                          onChange={handleProductFormChange}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price (₹) *</label>
                        <input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        required
                        rows="3"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="image-preview-small" />
                        )}
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="in_stock"
                            checked={productForm.in_stock}
                            onChange={handleProductFormChange}
                          />
                          <span>In Stock</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Add Product</button>
                      <button type="button" onClick={resetProductForm} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products List */}
              {products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No Products Yet</h3>
                </div>
              ) : (
                <div className="products-grid">
                  {getFilteredProducts().map((product) => (
                    <div key={product.id} className="product-card-admin">
                      {editingProduct === product.id ? (
                        // Edit Form
                        <form onSubmit={handleUpdateProduct} className="inline-edit-form">
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              type="text"
                              name="name"
                              value={productForm.name}
                              onChange={handleProductFormChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              name="description"
                              value={productForm.description}
                              onChange={handleProductFormChange}
                              required
                              rows="2"
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Price</label>
                              <input
                                type="number"
                                name="price"
                                value={productForm.price}
                                onChange={handleProductFormChange}
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="form-group">
                              <label>Category</label>
                              <select
                                name="category"
                                value={productForm.category}
                                onChange={handleProductFormChange}
                                required
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>New Image (optional)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </div>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="in_stock"
                              checked={productForm.in_stock}
                              onChange={handleProductFormChange}
                            />
                            <span>In Stock</span>
                          </label>
                          <div className="form-actions">
                            <button type="submit" className="save-btn">💾 Save</button>
                            <button type="button" onClick={resetProductForm} className="cancel-btn">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        // View Mode
                        <>
                          <img 
                            src={product.image || 'https://via.placeholder.com/200'} 
                            alt={product.name}
                            className="product-image-admin"
                          />
                          <div className="product-info-admin">
                            <h3>{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <div className="product-meta">
                              <span className="category-badge">{product.category_name}</span>
                              <span className="price-badge">₹{product.price}</span>
                            </div>
                            <div className="product-actions">
                              <button
                                className={`stock-toggle ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}
                                onClick={() => handleToggleStock(product.id, product.in_stock)}
                              >
                                {product.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                              </button>
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditProduct(product)}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== ORDERS TAB ==================== */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="section-header">
                <h2>All Orders</h2>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛍️</div>
                  <h3>No Orders Yet</h3>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredOrders().map((order) => (
                        <tr key={order.id}>
                          <td><strong>#{order.id}</strong></td>
                          <td>{order.user || 'Unknown'}</td>
                          <td>{order.phone || 'N/A'}</td>
                          <td className="address-cell">{order.shipping_address || 'N/A'}</td>
                          <td><strong>₹{order.total_amount}</strong></td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`status-select status-${order.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              className="view-btn"
                              onClick={() => {
                                const items = order.items?.map(i => 
                                  `${i.product_name} x${i.quantity} = ₹${i.price}`
                                ).join('\n') || 'No items';
                                alert(`Order #${order.id} Items:\n\n${items}`);
                              }}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== CATEGORIES TAB ==================== */}
          {activeTab === 'categories' && (
            <div className="categories-section">
              <h2>Manage Categories</h2>
              <form onSubmit={handleAddCategory} className="add-category-form">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name (e.g., Sports)"
                  className="category-input"
                />
                <button type="submit" className="add-btn">+ Add Category</button>
              </form>

              {categories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Categories Yet</h3>
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div key={category.id} className="category-card">
                      <div className="category-info">
                        <h3>{category.name}</h3>
                        <p>ID: {category.id}</p>
                        <p className="category-date">
                          Created: {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;