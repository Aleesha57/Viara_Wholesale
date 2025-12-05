import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  // State for different sections
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, categories
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  /**
   * WHY: Check if user is admin
   * HOW: In real app, backend should verify this
   * For now, we check if user is logged in
   */
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.is_staff) {
    alert('Admin access required');
    navigate('/');
  }
}, []);

  /**
   * WHY: Fetch all data for dashboard
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    };
  };

  /**
   * WHY: Fetch all dashboard data
   * WHAT: Gets products, orders, categories, and calculates stats
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch('http://127.0.0.1:8000/api/products/', {
        headers: getAuthHeaders()
      });
      const productsData = await productsRes.json();
      const productsList = productsData.results || productsData;
      setProducts(productsList);

      // Fetch orders (all orders - admin can see all)
      const ordersRes = await fetch('http://127.0.0.1:8000/api/orders/', {
        headers: getAuthHeaders()
      });
      const ordersData = await ordersRes.json();
      const ordersList = ordersData.results || ordersData;
      setOrders(ordersList);

      // Fetch categories
      const categoriesRes = await fetch('http://127.0.0.1:8000/api/categories/');
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);

      // Calculate stats
      setStats({
        totalProducts: productsList.length,
        totalOrders: ordersList.length,
        totalCategories: categoriesData.length,
        pendingOrders: ordersList.filter(o => o.status === 'pending').length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * WHY: Update product stock status
   * WHAT: Sends PATCH request to backend to toggle in_stock
   */
  const handleToggleStock = async (productId, currentStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          in_stock: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Refresh products list
      await fetchDashboardData();
      alert('Product stock status updated!');

    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  /**
   * WHY: Update order status
   * WHAT: Admin can change order from pending → processing → shipped → delivered
   */
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      await fetchDashboardData();
      alert('Order status updated!');

    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  /**
   * WHY: Add new category
   */
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newCategory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      setNewCategory('');
      await fetchDashboardData();
      alert('Category added successfully!');

    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  /**
   * WHY: Delete category
   */
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete this category? Products in this category will need to be reassigned.')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      await fetchDashboardData();
      alert('Category deleted!');

    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Make sure no products use this category.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

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

        {/* Tabs Navigation */}
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
            Products
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Recent Orders</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user}</td>
                        <td>${order.total_amount}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.payment_method_display || order.payment_method}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>Manage Products</h2>
                <button 
                  className="add-btn"
                  onClick={() => navigate('/admin/add-product')}
                >
                  + Add Product
                </button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img 
                            src={product.image || 'https://via.placeholder.com/50x50'} 
                            alt={product.name}
                            className="product-thumb"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category_name}</td>
                        <td>${product.price}</td>
                        <td>
                          <button
                            className={`stock-toggle ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}
                            onClick={() => handleToggleStock(product.id, product.in_stock)}
                          >
                            {product.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                          </button>
                        </td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>All Orders</h2>
              
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user}</td>
                        <td>{order.phone || 'N/A'}</td>
                        <td className="address-cell">
                          {order.shipping_address || 'N/A'}
                        </td>
                        <td>${order.total_amount}</td>
                        <td>{order.payment_method_display || order.payment_method}</td>
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
                              alert('Order Items:\n' + 
                                order.items.map(item => 
                                  `${item.product_name} x ${item.quantity} = $${item.price}`
                                ).join('\n')
                              );
                            }}
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="categories-section">
              <h2>Manage Categories</h2>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="add-category-form">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="category-input"
                />
                <button type="submit" className="add-btn">
                  + Add Category
                </button>
              </form>

              {/* Categories List */}
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-card">
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      <p>ID: {category.id}</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;