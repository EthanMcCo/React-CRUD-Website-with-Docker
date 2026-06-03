import React, { useState, useEffect } from 'react';
import './HomeManagement.css';

const HomeManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [draggedImage, setDraggedImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-gallery');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadProgress('Uploading...');
      setError('');
      
      const response = await fetch('/api/home-gallery/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Add new image to the list
      const newImage = {
        id: result.id,
        filename: result.filename,
        original_name: result.originalName,
        image_path: result.imagePath,
        display_order: result.displayOrder,
        active: true,
        upload_date: new Date().toISOString()
      };
      
      setImages(prev => [...prev, newImage]);
      setUploadProgress(null);
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setUploadProgress(null);
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/home-gallery/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image');
    }
  };

  const toggleImageActive = async (imageId) => {
    try {
      const response = await fetch(`/api/home-gallery/${imageId}/toggle`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to toggle image status');

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, active: !img.active } : img
      ));
    } catch (error) {
      console.error('Toggle error:', error);
      setError('Failed to update image status');
    }
  };

  const handleDragStart = (e, image) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetImage) => {
    e.preventDefault();
    
    if (!draggedImage || draggedImage.id === targetImage.id) {
      setDraggedImage(null);
      return;
    }

    const draggedIndex = images.findIndex(img => img.id === draggedImage.id);
    const targetIndex = images.findIndex(img => img.id === targetImage.id);
    
    // Create new array with reordered items
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    
    // Update display orders
    const imageOrders = newImages.map((img, index) => ({
      id: img.id,
      displayOrder: index + 1
    }));

    try {
      const response = await fetch('/api/home-gallery/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageOrders }),
      });

      if (!response.ok) throw new Error('Failed to reorder images');

      // Update local state with new order
      const updatedImages = newImages.map((img, index) => ({
        ...img,
        display_order: index + 1
      }));
      
      setImages(updatedImages);
    } catch (error) {
      console.error('Reorder error:', error);
      setError('Failed to reorder images');
      // Revert to original order on error
      fetchImages();
    }

    setDraggedImage(null);
  };

  const getImageUrl = (imagePath) => {
    return imagePath;
  };

  return (
    <div className="home-mgmt">
      <div className="home-mgmt__header">
        <h2>Home Page Gallery Management</h2>
        <p>Manage images for the home page gallery. Images will cycle automatically every 5 seconds.</p>
      </div>

      {error && (
        <div className="home-mgmt__error">
          {error}
          <button onClick={() => setError('')} className="home-mgmt__error-close">×</button>
        </div>
      )}

      <div className="home-mgmt__upload-section">
        <div className="home-mgmt__upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="home-mgmt__file-input"
            id="image-upload"
            disabled={loading || uploadProgress}
          />
          <label htmlFor="image-upload" className="home-mgmt__upload-label">
            {uploadProgress ? (
              <span className="home-mgmt__uploading">{uploadProgress}</span>
            ) : (
              <>
                <span className="home-mgmt__upload-icon">📁</span>
                <span>Choose Image to Upload</span>
                <span className="home-mgmt__upload-hint">Max size: 10MB</span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="home-mgmt__images-section">
        <h3>Gallery Images ({images.filter(img => img.active).length} active)</h3>
        
        {loading ? (
          <div className="home-mgmt__loading">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="home-mgmt__empty">
            <p>No images uploaded yet. Upload your first image to get started!</p>
          </div>
        ) : (
          <div className="home-mgmt__images-grid">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`home-mgmt__image-card ${!image.active ? 'home-mgmt__image-card--inactive' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image)}
              >
                <div className="home-mgmt__image-number">#{image.display_order}</div>
                
                <div className="home-mgmt__image-container">
                  <img
                    src={getImageUrl(image.image_path)}
                    alt={image.original_name}
                    className="home-mgmt__image"
                    loading="lazy"
                  />
                  {!image.active && (
                    <div className="home-mgmt__image-overlay">
                      <span>HIDDEN</span>
                    </div>
                  )}
                </div>

                <div className="home-mgmt__image-info">
                  <h4 className="home-mgmt__image-title">{image.original_name}</h4>
                  <p className="home-mgmt__image-date">
                    Uploaded: {new Date(image.upload_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="home-mgmt__image-actions">
                  <button
                    onClick={() => toggleImageActive(image.id)}
                    className={`home-mgmt__action-btn ${image.active ? 'home-mgmt__action-btn--hide' : 'home-mgmt__action-btn--show'}`}
                  >
                    {image.active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="home-mgmt__action-btn home-mgmt__action-btn--delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="home-mgmt__instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Drag and drop images to reorder them in the gallery</li>
          <li>Use Hide/Show to control which images appear on the website</li>
          <li>Images will automatically cycle every 5 seconds on the home page</li>
          <li>The gallery displays 4 images at once with navigation controls</li>
          <li>Maximum file size: 10MB per image</li>
          <li>Supported formats: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeManagement;