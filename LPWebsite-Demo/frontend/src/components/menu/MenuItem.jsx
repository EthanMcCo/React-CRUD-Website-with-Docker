import React from 'react';

const MenuItem = ({ item }) => {
  // Format price to show integer if it's a whole number, otherwise show with 2 decimal places
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return Number.isInteger(numPrice) ? numPrice : numPrice.toFixed(2);
  };

  // Split description by '/' character to handle formatting
  const descriptionParts = item.description ? item.description.split('/') : [];
  
  // Determine if this is a compact item (no description or very short description)
  const isCompact = !item.description || item.description.trim().length === 0;

  return (
    <div className={`menu-item ${isCompact ? 'menu-item--compact' : 'menu-item--standard'}`}>
      <div className="menu-price">
        <p>${formatPrice(item.price)}</p>
      </div>
      <div className="text-container">
        <div className="menu-name">
          <p>{item.name}</p>
        </div>
        {!isCompact && (
          <div className="menu-description">
            {descriptionParts.map((part, index, array) => (
              <p
                key={index}
                className={index === array.length - 1 ? 'last-part' : ''}
              >
                {part.trim()}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;