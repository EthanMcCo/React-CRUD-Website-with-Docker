import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import "./Menu.css";

const Menu = () => {
  const [menuData, setMenuData] = useState({
    categories: [],
    items: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    // Skip JavaScript positioning on mobile - CSS handles it
    if (window.innerWidth <= 768) return;
    
    const handleScroll = () => {
      const logoElement = document.querySelector('.menu-background-logo');
      if (!logoElement) return;

      const filterSection = document.querySelector('.menu-filters');
      if (!filterSection) return;

      const filterRect = filterSection.getBoundingClientRect();
      const filterBottom = filterRect.bottom;
      const viewportHeight = window.innerHeight;
      
      // Calculate the point where the logo should become centered
      const logoHeight = window.innerWidth <= 480 ? 400 : window.innerWidth <= 768 ? 600 : 800;
      const centerPoint = (viewportHeight - logoHeight) / 2;
      
      // If filter bottom is above the center point, fix the logo to center
      if (filterBottom <= centerPoint) {
        logoElement.style.position = 'fixed';
        logoElement.style.top = `${centerPoint}px`;
        logoElement.style.left = '50%';
      } else {
        // Otherwise, position it right below the filter
        const containerRect = document.querySelector('.menu-content-with-background').getBoundingClientRect();
        logoElement.style.position = 'absolute';
        logoElement.style.top = `${filterBottom - containerRect.top}px`;
        logoElement.style.left = '50%';
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch both categories and menu items
      const [categoriesResponse, itemsResponse] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu')
      ]);

      if (!categoriesResponse.ok || !itemsResponse.ok) {
        throw new Error('Failed to fetch menu data');
      }

      const categories = await categoriesResponse.json();
      const items = await itemsResponse.json();

      setMenuData({ categories, items });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching menu data:', err);
      setLoading(false);
    }
  };

  // Filter items based on search term and category
  const filterItems = (items) => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  };

  // Group items by category with filtering applied
  const groupItemsByCategory = () => {
    const grouped = {};
    
    // Initialize each category
    menuData.categories.forEach(category => {
      grouped[category.name] = {
        displayName: category.display_name,
        items: [],
        order: category.display_order,
        image_path: category.image_path,
        image_position: category.image_position
      };
    });

    // Group items into categories
    menuData.items.forEach(item => {
      if (grouped[item.type]) {
        grouped[item.type].items.push(item);
      }
    });

    // Apply filtering and sort by description length
    Object.keys(grouped).forEach(categoryName => {
      grouped[categoryName].items = filterItems(grouped[categoryName].items)
        .sort((a, b) => {
          // Get description lengths, treating null/undefined as 0
          const aLength = a.description ? a.description.length : 0;
          const bLength = b.description ? b.description.length : 0;
          // Sort by description length descending (longest first)
          return bLength - aLength;
        });
    });

    // Sort categories by display order
    const sortedCategories = Object.entries(grouped)
      .sort(([,a], [,b]) => a.order - b.order);

    // Filter categories based on selected category and whether they have items
    if (selectedCategory === "all") {
      return sortedCategories.filter(([,categoryData]) => 
        categoryData.items.length > 0
      );
    } else {
      return sortedCategories.filter(([categoryName, categoryData]) => 
        categoryName === selectedCategory && categoryData.items.length > 0
      );
    }
  };

  // Handle filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };


  // Get layout info from database
  const getCategoryLayout = (categoryData) => {
    return {
      image: categoryData.image_path,
      hasImage: categoryData.image_path && categoryData.image_position !== 'none',
      reversed: categoryData.image_position === 'left'
    };
  };

  const renderMenuItems = (categoryData) => {
    return categoryData.items.map((item) => (
      <MenuItem 
        key={item.item_id} 
        item={item} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-container">
          <h1 className="menu-title">Loading Menu...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="menu-container">
          <h1 className="menu-title">Error loading menu</h1>
          <p className="menu-error">{error}</p>
        </div>
      </div>
    );
  }

  const groupedCategories = groupItemsByCategory();

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">Menu</h1>
          <p className="menu-subtitle">
            Explore our delicious choices across all our menu categories.
          </p>
          <p className="menu-hours">
            <strong>Kitchen open daily from 11 AM - 11 PM</strong>
          </p>
        </div>

        {/* Content area with background image */}
        <div className="menu-content-with-background">
          <div className="menu-background-logo"></div>
          {/* Filter Controls */}
          <div className="menu-filters">
            <div className="filter-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              
              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="category-select"
                >
                  <option value="all">All Categories</option>
                  {menuData.categories
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(category => (
                      <option key={category.name} value={category.name}>
                        {category.display_name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={clearFilters}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Summary */}
            {(searchTerm || selectedCategory !== "all") && (
              <div className="filter-results-summary">
                {groupedCategories.length === 0 ? (
                  <p>No items found matching your filters.</p>
                ) : (
                  <p>
                    {groupedCategories.reduce((total, [, categoryData]) => 
                      total + categoryData.items.length, 0
                    )} item(s) found
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory !== "all" && ` in ${
                      menuData.categories.find(cat => cat.name === selectedCategory)?.display_name || selectedCategory
                    }`}
                  </p>
                )}
              </div>
            )}
          </div>

          {groupedCategories.map(([categoryName, categoryData]) => {
              const layout = getCategoryLayout(categoryData);

              return (
                <section key={categoryName} className={`menu-section ${layout.hasImage ? 'with-image' : ''}`}>
                  <h2 className="menu-category-title">
                    {categoryData.displayName.toUpperCase()}
                  </h2>
                  
                  {layout.hasImage ? (
                    <div className={`menu-content-wrapper ${layout.reversed ? 'reversed' : ''}`}>
                      {/* Image as direct child of grid container */}
                      <div className="menu-image-container">
                        <img 
                          src={layout.image} 
                          alt={`${categoryData.displayName} dishes`} 
                          className="menu-image" 
                        />
                      </div>
                      
                      {/* Menu items grouped by size */}
                      {renderMenuItems(categoryData)}
                    </div>
                  ) : (
                    <div className="menu-items-grid">
                      {renderMenuItems(categoryData)}
                    </div>
                  )}
                </section>
              );
            })}

          {groupedCategories.length === 0 && (
            <div className="menu-error">
              No menu items available at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;