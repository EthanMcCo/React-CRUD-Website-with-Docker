import React, { useState, useEffect, useCallback } from 'react';
import AddMenuItemModal from './AddMenuItemModal';
import EditMenuItemModal from './EditMenuItemModal';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [alertMessage, setAlertMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    display_name: '',
    display_order: 0,
    image_position: 'none'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      showAlert('error', 'Failed to fetch menu items');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showAlert('error', 'Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const response = await fetch(`/api/menu/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete item');
        
        fetchMenuItems();
        showAlert('success', 'Menu item deleted successfully');
      } catch (error) {
        showAlert('error', 'Failed to delete menu item');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete its image.')) {
      try {
        const response = await fetch(`/api/menu/categories/${categoryId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete category');
        }
        
        await fetchCategories();
        await fetchMenuItems();
        
        showAlert('success', 'Category deleted successfully');
      } catch (error) {
        showAlert('error', error.message);
      }
    }
  };

  const handleDeleteImage = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(`/api/menu/categories/${categoryId}/image`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete image');
        
        await fetchCategories();
        showAlert('success', 'Image deleted successfully');
      } catch (error) {
        showAlert('error', `Failed to delete image: ${error.message}`);
      }
    }
  };

  const handleCategorySubmit = async () => {
    try {
      // First, create/update the category
      const url = editingCategory 
        ? `/api/menu/categories/${editingCategory.category_id}`
        : '/api/menu/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categoryFormData,
          active: editingCategory ? editingCategory.active : true
        }),
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      const result = await response.json();
      const categoryId = editingCategory ? editingCategory.category_id : result.id;

      // If there's a new image to upload
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);

        const imageResponse = await fetch(`/api/menu/categories/${categoryId}/image`, {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to upload image');
        }
      }
      
      closeCategoryModal();
      await fetchCategories();
      await fetchMenuItems();
      
      showAlert('success', `Category ${editingCategory ? 'updated' : 'added'} successfully`);
    } catch (error) {
      showAlert('error', `Failed to ${editingCategory ? 'update' : 'add'} category: ${error.message}`);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      display_name: category.display_name,
      display_order: category.display_order,
      image_position: category.image_position || 'none'
    });
    setImagePreview(category.image_path);
    setSelectedImage(null);
    setShowCategoryModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const filterMenuItems = (items) => {
    if (selectedType === 'all') return items;
    return items.filter(item => item.type === selectedType);
  };

  const handleAddItem = async (newItem) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
  
      if (!response.ok) throw new Error('Failed to add item');
      
      setShowAddModal(false);
      fetchMenuItems();
      showAlert('success', 'Menu item added successfully');
    } catch (error) {
      showAlert('error', 'Failed to add menu item');
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };
  
  const handleEditItem = async (updatedItem) => {
    try {
      const response = await fetch(`/api/menu/${updatedItem.item_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });
  
      if (!response.ok) throw new Error('Failed to update item');
      
      setShowEditModal(false);
      setSelectedItem(null);
      fetchMenuItems();
      showAlert('success', 'Menu item updated successfully');
    } catch (error) {
      showAlert('error', 'Failed to update menu item');
    }
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', display_name: '', display_order: 0, image_position: 'none' });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    section: {
      marginBottom: '2rem'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #004d00'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      color: '#004d00',
      margin: 0
    },
    headerControls: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    addButton: {
      backgroundColor: '#004d00',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem'
    },
    categoryCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '1rem',
      backgroundColor: '#f8f9fa'
    },
    categoryImage: {
      width: '100%',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '4px',
      marginBottom: '0.5rem'
    },
    categoryActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap'
    },
    button: {
      padding: '0.25rem 0.5rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem'
    },
    editButton: {
      backgroundColor: '#004d00',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    deleteImageButton: {
      backgroundColor: '#ffc107',
      color: '#000'
    },
    menuGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    menuCard: {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    alert: {
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '1rem'
    },
    alertSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    alertError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#555',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem'
    },
    imageUpload: {
      border: '2px dashed #ddd',
      borderRadius: '4px',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s'
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '150px',
      borderRadius: '4px',
      marginTop: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      {alertMessage && (
        <div style={{
          ...styles.alert,
          ...(alertMessage.type === 'success' ? styles.alertSuccess : styles.alertError)
        }}>
          {alertMessage.message}
        </div>
      )}

      {/* Category Management Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Menu Categories</h3>
          <button 
            style={styles.addButton}
            onClick={() => setShowCategoryModal(true)}
          >
            Add Category
          </button>
        </div>
        
        <div style={styles.categoryGrid}>
          {categories.map(category => (
            <div key={category.category_id} style={styles.categoryCard}>
              {category.image_path && (
                <img 
                  src={category.image_path} 
                  alt={category.display_name}
                  style={styles.categoryImage}
                />
              )}
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {category.display_name}
              </h4>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                Order: {category.display_order} | Position: {category.image_position}
              </p>
              <div style={styles.categoryActions}>
                <button 
                  style={{ ...styles.button, ...styles.editButton }}
                  onClick={() => handleEditCategory(category)}
                >
                  Edit
                </button>
                {category.image_path && (
                  <button 
                    style={{ ...styles.button, ...styles.deleteImageButton }}
                    onClick={() => handleDeleteImage(category.category_id)}
                  >
                    Delete Image
                  </button>
                )}
                <button 
                  style={{ ...styles.button, ...styles.deleteButton }}
                  onClick={() => handleDeleteCategory(category.category_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Menu Items</h3>
          <div style={styles.headerControls}>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minWidth: '200px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.display_name}
                </option>
              ))}
            </select>
            <button 
              style={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              Add Menu Item
            </button>
          </div>
        </div>

        <div style={styles.menuGrid}>
          {filterMenuItems(menuItems).map(item => (
            <div key={item.item_id} style={styles.menuCard}>
              <div>
                <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>{item.name}</h3>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {item.description}
                </p>
                <p style={{ color: '#004d00', fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  ${Number(item.price).toFixed(2)}
                </p>
                <p style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.type_display || item.type}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  style={styles.editButton}
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDeleteItem(item.item_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Display Name:</label>
              <input
                type="text"
                style={styles.input}
                value={categoryFormData.display_name}
                onChange={(e) => setCategoryFormData(prev => ({
                  ...prev,
                  display_name: e.target.value
                }))}
                placeholder="e.g., Pasta Dishes"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Internal Name:</label>
              <input
                type="text"
                style={styles.input}
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="e.g., PastaDishes (no spaces)"
              />
              <small style={{ color: '#666' }}>Used internally - no spaces or special characters</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Display Order:</label>
              <input
                type="number"
                style={styles.input}
                value={categoryFormData.display_order}
                onChange={(e) => setCategoryFormData(prev => ({
                  ...prev,
                  display_order: parseInt(e.target.value) || 0
                }))}
                min="0"
              />
              <small style={{ color: '#666' }}>Lower numbers appear first</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Image Position:</label>
              <select
                style={styles.input}
                value={categoryFormData.image_position}
                onChange={(e) => setCategoryFormData(prev => ({
                  ...prev,
                  image_position: e.target.value
                }))}
              >
                <option value="none">No Image</option>
                <option value="left">Image on Left</option>
                <option value="right">Image on Right</option>
              </select>
            </div>

            {categoryFormData.image_position !== 'none' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Category Image:</label>
                <div 
                  style={styles.imageUpload}
                  onClick={() => document.getElementById('imageInput').click()}
                >
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={styles.imagePreview}
                      />
                      <p>Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <p>Click to upload image</p>
                      <small>Supported: JPG, PNG, GIF (max 5MB)</small>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button 
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={closeCategoryModal}
              >
                Cancel
              </button>
              <button 
                style={{
                  backgroundColor: '#004d00',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleCategorySubmit}
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing modals */}
      {showAddModal && (
        <AddMenuItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
          categories={categories}
        />
      )}

      {showEditModal && (
        <EditMenuItemModal
          item={selectedItem}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditItem}
          categories={categories}
        />
      )}
    </div>
  );
};

export default MenuManagement;