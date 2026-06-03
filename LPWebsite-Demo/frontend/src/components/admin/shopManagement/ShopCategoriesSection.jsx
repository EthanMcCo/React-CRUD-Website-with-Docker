import React, { useState } from 'react';

const ShopCategoriesSection = ({ categories, onAlert, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    display_order: 0
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/shop/categories/${editingCategory.category_id}`
        : '/api/shop/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          active: editingCategory ? editingCategory.active : true
        }),
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      const result = await response.json();
      const categoryId = editingCategory ? editingCategory.category_id : result.category_id;

      // If there's a new image to upload
      if (selectedImage) {
        await handleImageUpload(categoryId);
      }
      
      closeModal();
      onRefresh();
      onAlert('success', `Category ${editingCategory ? 'updated' : 'created'} successfully`);
    } catch (error) {
      onAlert('error', `Failed to ${editingCategory ? 'update' : 'create'} category: ${error.message}`);
    }
  };

  const handleImageUpload = async (categoryId) => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);

      const response = await fetch(`/api/shop/categories/${categoryId}/image`, {
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
      onAlert('error', 'Failed to upload category image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      display_name: category.display_name,
      description: category.description || '',
      display_order: category.display_order
    });
    setImagePreview(category.image_path || null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete its image.')) {
      try {
        const response = await fetch(`/api/shop/categories/${categoryId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete category');
        }
        
        onRefresh();
        onAlert('success', 'Category deleted successfully');
      } catch (error) {
        onAlert('error', error.message);
      }
    }
  };

  const handleDeleteImage = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(`/api/shop/categories/${categoryId}/image`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete image');
        
        onRefresh();
        onAlert('success', 'Image deleted successfully');
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

  const openModal = (category = null) => {
    if (category) {
      handleEdit(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        display_name: '',
        description: '',
        display_order: 0
      });
      setImagePreview(null);
      setSelectedImage(null);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', display_name: '', description: '', display_order: 0 });
    setSelectedImage(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  const renderCategoryCard = (category) => (
    <div key={category.category_id} className="shop-category-card">
      {category.image_path && (
        <div className="card-image-container">
          <img 
            src={category.image_path} 
            alt={category.display_name}
            className="card-image"
          />
        </div>
      )}
      
      <div className="shop-card-header">
        <h4 className="card-title">{category.display_name}</h4>
        <div className="shop-card-badges">
          <span className={`shop-status-badge ${category.active ? 'active' : 'inactive'}`}>
            {category.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="card-content">
        {category.description && (
          <p className="card-description">{category.description}</p>
        )}
        
        <div className="card-details">
          <div className="card-detail">
            <span className="detail-label">Internal Name</span>
            <span className="detail-value">{category.name}</span>
          </div>
          <div className="card-detail">
            <span className="detail-label">Display Order</span>
            <span className="detail-value">{category.display_order}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="action-button edit-button"
          onClick={() => openModal(category)}
        >
          Edit
        </button>
        {category.image_path && (
          <button 
            className="action-button delete-image-button"
            onClick={() => handleDeleteImage(category.category_id)}
          >
            Delete Image
          </button>
        )}
        <button 
          className="action-button delete-button"
          onClick={() => handleDelete(category.category_id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="shop-section">
      <div className="section-header">
        <h3 className="section-title">Shop Categories</h3>
        <button className="add-button" onClick={() => openModal()}>
          Add Category
        </button>
      </div>
      
      {categories.length === 0 ? (
        <div className="no-categories">No shop categories found</div>
      ) : (
        <div className="shop-categories-grid">
          {categories.map(category => renderCategoryCard(category))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content shop-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>
            <div className="shop-form">
              <div className="form-group">
                <label className="form-label">Display Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    display_name: e.target.value
                  }))}
                  placeholder="e.g., Pool Cues"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Internal Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="e.g., pool-cues (no spaces)"
                  required
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Used internally - no spaces or special characters
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Order:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    display_order: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Lower numbers appear first
                </small>
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Category Image:</label>
                <div className="image-upload-section">
                  <div 
                    className="image-upload-area"
                    onClick={() => document.getElementById('categoryImageInput').click()}
                  >
                    <input
                      id="categoryImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Category preview" 
                          className="image-preview"
                        />
                        <div className="image-preview-overlay">
                          <p>Click to change image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <div className="upload-icon">🏷️</div>
                        <p>Click to upload category image</p>
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
                        setImagePreview(editingCategory?.image_path || null);
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
                  {uploadingImage ? 'Uploading...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopCategoriesSection;