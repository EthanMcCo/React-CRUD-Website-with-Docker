import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import FAQItem from './FAQItem';
import ContactSection from '../contact/ContactSection';
import './FAQ.css';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();

  // Define category order and display names - use useMemo to prevent recreation
  const categories = useMemo(() => [
    { key: 'all', display: 'All FAQs' },
    { key: 'Leagues', display: 'Leagues' },
    { key: 'Events', display: 'Events' },
    { key: 'Pricing + Hours', display: 'Pricing + Hours' },
    { key: 'Other', display: 'Other' }
  ], []);

  const fetchFAQs = useCallback(async () => {
    try {
      const response = await fetch('/api/faqs');
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching FAQs:', err);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Handle URL parameters for category selection
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(cat => cat.key === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, categories]); // Now includes categories dependency

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((groups, faq) => {
    const category = faq.topic || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {});

  // Filter FAQs based on selected category
  const getFilteredFaqs = () => {
    if (selectedCategory === 'all') {
      return faqs;
    }
    return groupedFaqs[selectedCategory] || [];
  };

  // Get count for each category
  const getCategoryCount = (categoryKey) => {
    if (categoryKey === 'all') return faqs.length;
    return groupedFaqs[categoryKey]?.length || 0;
  };

  // Handle category selection and update URL
  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    if (categoryKey === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryKey });
    }
  };

  if (error) {
    return (
      <div className="faq-page">
        <div className="faq-container">
          <h1 className="faq-title">Error loading FAQs</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        
        {/* Category Filter */}
        <div className="faq-categories">
          {categories.map(category => (
            <button
              key={category.key}
              className={`category-button ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category.key)}
            >
              {category.display} ({getCategoryCount(category.key)})
            </button>
          ))}
        </div>

        {/* Display FAQs */}
        {selectedCategory === 'all' ? (
          // Show all FAQs grouped by category
          Object.entries(groupedFaqs).map(([categoryName, categoryFaqs]) => (
            <div key={categoryName} className="faq-category-section">
              <h2 className="category-title">{categoryName}</h2>
              <div className="faq-list">
                {categoryFaqs.map((faq) => (
                  <FAQItem key={faq.faq_id} faq={faq} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show only selected category
          <div className="faq-list">
            {getFilteredFaqs().map((faq) => (
              <FAQItem key={faq.faq_id} faq={faq} />
            ))}
          </div>
        )}

        <ContactSection />
      </div>
    </div>
  );
};

export default FAQPage;