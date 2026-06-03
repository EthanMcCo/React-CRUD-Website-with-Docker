import React, { useState, useEffect } from 'react';
import ShopItemCard from './ShopItemCard';
import ShopItemModal from './ShopItemModal';
import './Shop.css';

const Shop = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and items in parallel
      const [categoriesResponse, itemsResponse] = await Promise.all([
        fetch('/api/shop/categories'),
        fetch('/api/shop/items')
      ]);

      if (!categoriesResponse.ok || !itemsResponse.ok) {
        throw new Error('Failed to fetch shop data');
      }

      const categoriesData = await categoriesResponse.json();
      const itemsData = await itemsResponse.json();

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      if (itemsData.success) {
        setItems(itemsData.items);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const filterAndSortItems = () => {
    let filteredItems = [...items];

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => 
        item.category_id?.toString() === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.short_description?.toLowerCase().includes(search)
      );
    }

    // Filter by featured only
    if (showFeaturedOnly) {
      filteredItems = filteredItems.filter(item => item.featured);
    }

    // Sort items
    switch (sortBy) {
      case 'name-asc':
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filteredItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-low':
        filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'featured':
      default:
        // Featured items first, then by name
        filteredItems.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filteredItems;
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('featured');
    setShowFeaturedOnly(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchTerm) count++;
    if (showFeaturedOnly) count++;
    if (sortBy !== 'featured') count++;
    return count;
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-loading">
            <h2>Loading shop...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-error">
            <h2>Error loading shop</h2>
            <p>{error}</p>
            <button onClick={fetchData} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = filterAndSortItems();
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Header */}
        <header className="shop-header">
          <h1>Pro Shop</h1>
          <p>
            High-quality pool equipment and accessories. All items available for in-store purchase only.
          </p>
        </header>

        {/* Filters and Search */}
        <div className="shop-controls">
          <div className="shop-filters">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort by:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="featured">Featured First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="filter-group">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="front-shop-search-input"
              />
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                />
                <span>Featured Only</span>
              </label>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="active-filters">
              <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
              <button onClick={clearFilters} className="clear-filters-button">
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Featured Section */}
        {!showFeaturedOnly && selectedCategory === 'all' && !searchTerm && (
          <section className="featured-section">
            <h2>Featured Products</h2>
            <div className="featured-grid">
              {items
                .filter(item => item.featured)
                .slice(0, 4)
                .map(item => (
                  <ShopItemCard
                    key={`featured-${item.item_id}`}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    featured={true}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Main Products Grid */}
        <section className="shop-main">
          <div className="shop-results-header">
            <h2>
              {selectedCategory !== 'all' 
                ? categories.find(c => c.category_id.toString() === selectedCategory)?.display_name || 'Products'
                : 'All Products'
              }
            </h2>
            <span className="results-count">
              {filteredItems.length} product{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="clear-filters-button">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredItems.map(item => (
                <ShopItemCard
                  key={item.item_id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Item Detail Modal */}
        {selectedItem && (
          <ShopItemModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Shop;