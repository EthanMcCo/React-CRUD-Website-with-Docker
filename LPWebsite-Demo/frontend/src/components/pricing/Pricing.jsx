import React, { useState, useEffect } from 'react';
import './Pricing.css';

const Pricing = () => {
  const [pricing, setPricing] = useState({
    dealPricing: [],
    tablePricing: [],
    settings: {},
    tableCounts: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing');
      const data = await response.json();
      
      if (data.success) {
        setPricing(prevState => ({
          ...prevState,
          dealPricing: data.deals || [],
          tablePricing: data.tables || [],
          settings: data.settings || {},
          tableCounts: data.tableCounts || {},
          loading: false
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch pricing data');
      }
    } catch (error) {
      setPricing(prevState => ({
        ...prevState,
        error: 'Error loading pricing information',
        loading: false
      }));
      console.error('Error fetching pricing:', error);
    }
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? `$${numPrice.toFixed(2)}` : 'Price not available';
  };

  const getAvailabilityText = () => {
    return pricing.settings.pricing_availability_text || 'Pool tables are available all day every day from 11 am – 2 am';
  };

  const getDealSectionTitle = () => {
    return pricing.settings.pricing_deal_description || 'All Day Pool Deal (per person)';
  };

  const getRegularSectionTitle = () => {
    return pricing.settings.pricing_regular_description || 'Regular Pool Pricing (per table)';
  };

  const getGSTNotice = () => {
    return pricing.settings.pricing_gst_notice || 'Please note all prices shown above do NOT include GST.';
  };

  // Get table counts for display
  const getTableCounts = () => {
    // Convert tableCounts object to array for display
    return Object.entries(pricing.tableCounts).map(([tableName, count]) => ({
      count: count,
      type: tableName
    })).filter(table => parseInt(table.count) > 0);
  };

  if (pricing.loading) {
    return <div className="pricing-loading">Loading pricing information...</div>;
  }

  if (pricing.error) {
    return <div className="pricing-error">{pricing.error}</div>;
  }

  const tableCounts = getTableCounts();

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Pool Pricing & Specials</h1>
        <p>{getAvailabilityText()}</p>
      </div>

      <div className="pricing-grid-container">
        {/* Grid Item 1: Available Tables */}
        <section className="pricing-section">
          <h2>Available Tables</h2>
          <div className="tables-list">
            {tableCounts.map((table, index) => (
              <div key={index} className="table-info">
                <p className="table-count">{table.count} Tables</p>
                <p className="table-type">{table.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grid Item 2: All Day Pool Deal */}
        <section className="pricing-section">
          <h2>{getDealSectionTitle()}</h2>
          <div className="pricing-list">
            {pricing.dealPricing.length > 0 ? (
              pricing.dealPricing.map((deal, index) => (
                <div key={index} className="price-info">
                  <p className="table-type">{deal.tableType}</p>
                  <p className="price-amount">{formatPrice(deal.price)}</p>
                  <p className="price-unit">per {deal.price_unit || 'person'}</p>
                </div>
              ))
            ) : (
              <div className="price-info">
                <p className="no-pricing">No deal pricing available at this time</p>
              </div>
            )}
          </div>
        </section>

        {/* Grid Item 3: Regular Pool Pricing */}
        <section className="pricing-section">
          <h2>{getRegularSectionTitle()}</h2>
          <div className="pricing-list">
            {pricing.tablePricing.length > 0 ? (
              pricing.tablePricing.map((price, index) => (
                <div key={index} className="price-info">
                  <p className="table-type">{price.tableType}</p>
                  <p className="price-amount">{formatPrice(price.price)}</p>
                  <p className="price-unit">per {price.price_unit || 'hour'}</p>
                </div>
              ))
            ) : (
              <div className="price-info">
                <p className="no-pricing">No regular pricing available at this time</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <p className="gst-notice">{getGSTNotice()}</p>
    </div>
  );
};

export default Pricing;