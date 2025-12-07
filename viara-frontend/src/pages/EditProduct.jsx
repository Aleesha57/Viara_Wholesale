import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import '../styles/ProductForm.css';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID from URL

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    in_stock: true
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /**
   * WHY: Fetch product data and categories on load
   */
  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  /**
   * WHY: Fetch product to edit
   */
  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`);
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        in_stock: data.in_stock
      });
      
      setCurrentImage(data.image);
      
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * WHY: Update product (PATCH request)
   * WHAT: Only sends changed data
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('in_stock', formData.in_stock);
      
      // Only add image if new one selected
      if (newImageFile) {
        formDataToSend.append('image', newImageFile);
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      alert('Product updated successfully!');
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * WHY: Delete product
   * WHAT: Sends DELETE request
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully!');
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <div className="form-header">
          <h1>Edit Product</h1>
          <div className="header-buttons">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="back-btn"
            >
              ← Back
            </button>
            <button 
              onClick={handleDelete} 
              className="delete-btn"
            >
              🗑️ Delete Product
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Current Image</label>
            {currentImage && (
              <div className="current-image">
                <img src={currentImage} alt="Current" />
              </div>
            )}
            
            <label htmlFor="image">Upload New Image (optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="New Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
              />
              <span>In Stock</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;