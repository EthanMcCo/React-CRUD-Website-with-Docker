import React, { useState, useEffect, useCallback } from 'react';
import ShopCategoriesSection from './ShopCategoriesSection';
import ShopItemsSection from './ShopItemsSection';
import './ShopManagement.css';

const ShopManagement = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/shop/categories/admin');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching shop categories:', error);
      showAlert('error', 'Failed to fetch categories');
    }
  };

  const fetchItems = async () => {
    try {
      // Remove the status=all parameter since the backend doesn't handle it properly
      // Instead, we'll fetch all items and let the backend default behavior handle it
      const response = await fetch('/api/shop/items?admin=true');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      } else {
        console.error('API returned error:', data.error);
        showAlert('error', data.error || 'Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
      showAlert('error', 'Failed to fetch items');
    }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCategories(), fetchItems()]);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return <div className="shop-management loading">Loading shop data...</div>;
  }

  return (
    <div className="shop-management">
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}
      
      <ShopCategoriesSection 
        categories={categories}
        onAlert={showAlert} 
        onRefresh={fetchCategories}
      />
      
      <ShopItemsSection 
        categories={categories}
        items={items}
        onAlert={showAlert} 
        onRefresh={fetchItems}
      />
      
    </div>
  );
};

export default ShopManagement;