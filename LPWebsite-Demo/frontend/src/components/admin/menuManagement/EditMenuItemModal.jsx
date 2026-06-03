import React, { useState, useEffect } from 'react';

const EditMenuItemModal = ({ item, onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: '',
    cardSize: 'small'
  });

  // Character limits (DB still uses small/large, but UI shows compact/standard)
  const CHARACTER_LIMITS = {
    small: 80,   // ~2 lines (compact)
    large: 200   // ~4-5 lines (standard)
  };

  const getDisplayName = (dbValue) => {
    return dbValue === 'small' ? 'compact' : 'standard';
  };

  const getDbValue = (displayValue) => {
    return displayValue === 'compact' ? 'small' : 'large';
  };

  // Initialize form with item data when modal opens
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price ? item.price.toString() : '',
        type: item.type || '',
        cardSize: item.card_size || 'small' // Use existing card_size or default to small
      });
    }
  }, [item]);

  const getCurrentLimit = () => CHARACTER_LIMITS[formData.cardSize];
  const getRemainingChars = () => getCurrentLimit() - (formData.description || '').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if ((formData.description || '').length > getCurrentLimit()) {
      alert(`Description too long. Maximum ${getCurrentLimit()} characters for ${getDisplayName(formData.cardSize)} cards.`);
      return;
    }
    
    // Convert price to number and validate
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    onSubmit({
      ...formData,
      price: price.toFixed(2),
      item_id: item.item_id // Include the item ID for the update
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Menu Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Card Size Selection */}
          <div className="form-group">
            <label htmlFor="cardSize">Card Size:</label>
            <select
              id="cardSize"
              name="cardSize"
              value={formData.cardSize}
              onChange={handleChange}
              required
            >
              <option value="small">Compact Card (2 lines, {CHARACTER_LIMITS.small} chars max)</option>
              <option value="large">Standard Card (4-5 lines, {CHARACTER_LIMITS.large} chars max)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description (optional): 
              <span className={`char-counter ${getRemainingChars() < 20 ? 'warning' : ''}`}>
                ({getRemainingChars()} characters remaining)
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={getCurrentLimit()}
              placeholder={`Max ${getCurrentLimit()} characters for ${getDisplayName(formData.cardSize)} card`}
              rows={formData.cardSize === 'large' ? 6 : 3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Category:</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </div>
        </form>

        <style jsx>{`
          .char-counter {
            font-size: 0.8rem;
            color: #666;
            margin-left: 0.5rem;
          }
          .char-counter.warning {
            color: #ff6b35;
            font-weight: bold;
          }
          .form-group textarea {
            resize: vertical;
            min-height: 60px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default EditMenuItemModal;