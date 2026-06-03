import React from 'react';
import './ShopItemCard.css';

const ShopItemCard = ({ item, onClick, featured = false }) => {
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusBadge = () => {
    if (item.stock_quantity === 0) {
      return <span className="status-badge out-of-stock">Out of Stock</span>;
    }
    if (item.status === 'inactive') {
      return <span className="status-badge inactive">Unavailable</span>;
    }
    return null;
  };

  return (
    <div 
      className={`shop-item-card ${featured ? 'featured' : ''}`}
      onClick={() => onClick(item)}
    >
      <div className="item-image-container">
        {item.image_path ? (
          <img 
            src={item.image_path} 
            alt={item.name}
            className="item-image"
            loading="lazy"
          />
        ) : (
          <div className="no-image-placeholder">
            <span>📷</span>
            <p>No Image</p>
          </div>
        )}
        
        {item.featured === 1 && (
          <div className="featured-badge">⭐ Featured</div>
        )}
        
        {getStatusBadge()}
      </div>

      <div className="item-content">
        <h3 className="item-name">{item.name}</h3>
        
        {item.short_description && (
          <p className="item-description">{item.short_description}</p>
        )}
        
        <div className="item-footer">
          <span className="item-price">{formatPrice(item.price)}</span>
          <span className="item-category">{item.category_name}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopItemCard;