import React, { useState } from 'react';

const ShopItemsSection = ({ categories, items, onAlert, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    category_id: '',
    status: 'active',
    stock_quantity: 0,
    featured: false
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem ? `/api/shop/items/${editingItem.item_id}` : '/api/shop/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        const itemId = editingItem ? editingItem.item_id : data.item_id;
        
        // If image is selected, upload it
        if (selectedImage) {
          await handleImageUpload(itemId);
        }
        
        closeModal();
        onRefresh();
        onAlert('success', `Shop item ${editingItem ? 'updated' : 'created'} successfully`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to ${editingItem ? 'update' : 'create'} item: ${error.message}`);
    }
  };

  const handleImageUpload = async (itemId) => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);

      const response = await fetch(`/api/shop/items/${itemId}/image`, {
        method: 'POST',
        body: imageFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data.imagePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      onAlert('error', 'Failed to upload item image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item image?')) {
      try {
        const response = await fetch(`/api/shop/items/${itemId}/image`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onRefresh();
          onAlert('success', 'Item image deleted successfully');
        } else {
          throw new Error('Failed to delete image');
        }
      } catch (error) {
        onAlert('error', `Failed to delete image: ${error.message}`);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        onAlert('error', 'Image file size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        onAlert('error', 'Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this shop item?')) {
      try {
        const response = await fetch(`/api/shop/items/${itemId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          onRefresh();
          onAlert('success', 'Shop item deleted successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        onAlert('error', `Failed to delete item: ${error.message}`);
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        short_description: item.short_description || '',
        price: item.price.toString(),
        category_id: item.category_id || '',
        status: item.status || 'active',
        stock_quantity: item.stock_quantity || 0,
        featured: item.featured || false
      });
      setImagePreview(item.image_path || null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        short_description: '',
        price: '',
        category_id: '',
        status: 'active',
        stock_quantity: 0,
        featured: false
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedImage(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusBadge = (item) => {
    if (item.stock_quantity === 0) {
      return <span className="shop-status-badge out-of-stock">Out of Stock</span>;
    }
    return <span className={`shop-status-badge ${item.status}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>;
  };

  const filterItems = () => {
    return items.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category_id?.toString() === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  };

  const renderItemCard = (item) => (
    <div key={item.item_id} className="shop-item-card">
      {item.image_path && (
        <div className="card-image-container">
          <img 
            src={item.image_path} 
            alt={item.name}
            className="card-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="shop-card-header">
        <h3 className="card-title">{item.name}</h3>
        <div className="shop-card-badges">
          {getStatusBadge(item)}
          {item.featured === 1 && (
            <span className="shop-status-badge featured">Featured</span>
          )}
        </div>
      </div>

      <div className="card-content">
        {item.short_description && (
          <p className="card-description">{item.short_description}</p>
        )}
        
        <div className="card-details">
          <div className="card-detail">
            <span className="detail-label">Price</span>
            <span className="detail-value price-value">{formatPrice(item.price)}</span>
          </div>
          <div className="card-detail">
            <span className="detail-label">Stock</span>
            <span className="detail-value">{item.stock_quantity}</span>
          </div>
          <div className="card-detail">
            <span className="detail-label">Category</span>
            <span className="detail-value">{item.category_name || 'Uncategorized'}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="action-button edit-button"
          onClick={() => openModal(item)}
        >
          Edit
        </button>
        {item.image_path && (
          <button 
            className="action-button delete-image-button"
            onClick={() => handleDeleteImage(item.item_id)}
          >
            Delete Image
          </button>
        )}
        <button 
          className="action-button delete-button"
          onClick={() => handleDelete(item.item_id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="shop-section">
      <div className="section-header">
        <h3 className="section-title">Shop Items</h3>
        <div className="header-controls">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.display_name}
              </option>
            ))}
          </select>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <button className="add-button" onClick={() => openModal()}>
            Add Item
          </button>
        </div>
      </div>

      {filterItems().length === 0 ? (
        <div className="no-items">No shop items found</div>
      ) : (
        <div className="shop-items-grid">
          {filterItems().map(item => renderItemCard(item))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content shop-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingItem ? 'Edit Shop Item' : 'Create New Shop Item'}
              </h2>
            </div>
            <div className="shop-form">
              <div className="form-group">
                <label className="form-label">Item Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description:</label>
                <textarea
                  className="form-textarea"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description for item cards (optional)"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description:</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the item"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity:</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category:</label>
                  <select
                    className="form-select"
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status:</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <label htmlFor="featured">Featured Item</label>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Item Image:</label>
                <div className="image-upload-section">
                  <div 
                    className="image-upload-area"
                    onClick={() => document.getElementById('itemImageInput').click()}
                  >
                    <input
                      id="itemImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Item preview" 
                          className="image-preview"
                        />
                        <div className="image-preview-overlay">
                          <p>Click to change image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <p>Click to upload item image</p>
                        <small>Supports JPG, PNG, GIF (max 10MB)</small>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(editingItem?.image_path || null);
                      }}
                    >
                      Remove Selected Image
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  disabled={uploadingImage}
                  onClick={handleSubmit}
                >
                  {uploadingImage ? 'Uploading...' : (editingItem ? 'Update Item' : 'Create Item')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopItemsSection;