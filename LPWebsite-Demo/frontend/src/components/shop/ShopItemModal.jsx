import React, { useEffect } from 'react';
import './ShopItemModal.css';

const ShopItemModal = ({ item, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getAvailabilityStatus = () => {
    if (item.stock_quantity === 0) {
      return { text: 'Out of Stock', className: 'out-of-stock' };
    }
    if (item.status === 'inactive') {
      return { text: 'Currently Unavailable', className: 'unavailable' };
    }
    return { text: 'Available In-Store', className: 'available' };
  };

  const handleContactClick = () => {
    // Create email subject and body
    const subject = encodeURIComponent(`Inquiry about ${item.name}`);
    const body = encodeURIComponent(
      `Hi there,\n\nI'm interested in learning more about the ${item.name} that I saw on your website.\n\nCould you please provide more information about availability and pricing?\n\nThank you!`
    );
    
    // Open email client
    window.location.href = `mailto:contact@leatherpocket.com?subject=${subject}&body=${body}`;
  };

  const availability = getAvailabilityStatus();

  return (
    <div className="shop-modal-overlay" onClick={onClose}>
      <div 
        className="shop-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shop-modal-header">
          <h2>{item.name}</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="shop-modal-body">
          <div className="modal-image-section">
            {item.image_path ? (
              <img 
                src={item.image_path} 
                alt={item.name}
                className="modal-item-image"
                loading="lazy"
                onError={(e) => {
                  console.error('Failed to load image:', item.image_path);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="modal-no-image">
                <span>📷</span>
                <p>No Image Available</p>
              </div>
            )}
          </div>

          <div className="modal-info-section">
            <div className="price-availability">
              <span className="modal-price">{formatPrice(item.price)}</span>
              <span className={`availability-status ${availability.className}`}>
                {availability.text}
              </span>
            </div>

            {item.category_name && (
              <div className="modal-category">
                Category: <span>{item.category_name}</span>
              </div>
            )}

            {(item.description || item.short_description) && (
              <div className="modal-description">
                <h3>Description</h3>
                <p>{item.description || item.short_description}</p>
              </div>
            )}

            {item.stock_quantity !== undefined && (
              <div className="modal-stock-info">
                <strong>Stock:</strong> {item.stock_quantity > 0 ? `${item.stock_quantity} available` : 'Out of stock'}
              </div>
            )}

            <div className="modal-purchase-notice">
              <h3>Purchase Information</h3>
              <p>
                This item is available for purchase in-store only. 
                Please visit us at <strong>3715 Edmonton Trail NE, Calgary</strong> or call{' '}
                <strong>(403) 555-0123</strong> for availability and to arrange purchase.
              </p>
            </div>

            <div className="modal-actions">
              <button 
                className="contact-button"
                onClick={handleContactClick}
              >
                📧 Contact About This Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopItemModal;