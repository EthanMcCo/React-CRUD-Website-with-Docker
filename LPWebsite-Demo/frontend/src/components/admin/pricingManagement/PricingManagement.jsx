import React, { useState, useEffect, useCallback } from 'react';
import './PricingManagement.css';

const PricingManagement = () => {
  const [tableTypes, setTableTypes] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('table-types');
  const [editingTableType, setEditingTableType] = useState(null);
  const [newTableType, setNewTableType] = useState({ table_name: '', table_description: '', sort_order: 0, table_count: 0 });
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingPriceChanges, setPendingPriceChanges] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [tableTypesResponse, ratesResponse] = await Promise.all([
        fetch('/api/pricing/table-types'),
        fetch('/api/pricing/rates')
      ]);
      
      const tableTypesData = await tableTypesResponse.json();
      const ratesData = await ratesResponse.json();
      
      if (tableTypesData.success) {
        setTableTypes(tableTypesData.tableTypes);
      } else {
        throw new Error(tableTypesData.error || 'Failed to fetch table types');
      }
      
      if (ratesData.success) {
        setRates(ratesData.rates);
      } else {
        throw new Error(ratesData.error || 'Failed to fetch pricing rates');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('error', `Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleTableTypeSubmit = async (tableTypeData, isEdit = false) => {
    try {
      const url = isEdit ? `/api/pricing/table-types/${tableTypeData.id}` : '/api/pricing/table-types';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableTypeData)
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', data.message);
        fetchData();
        setEditingTableType(null);
        setNewTableType({ table_name: '', table_description: '', sort_order: 0, table_count: 0 });
        setHasChanges(false);
      } else {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} table type`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} table type:`, error);
      showAlert('error', error.message);
    }
  };

  const handleTableTypeDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table type? This will also remove all associated pricing.')) {
      return;
    }

    try {
      const response = await fetch(`/api/pricing/table-types/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', data.message);
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete table type');
      }
    } catch (error) {
      console.error('Error deleting table type:', error);
      showAlert('error', error.message);
    }
  };

  const handlePriceChange = (rateId, price) => {
    setPendingPriceChanges(prev => ({
      ...prev,
      [rateId]: price
    }));
    setHasChanges(true);
  };

  const handleSavePrices = async () => {
    try {
      const updatePromises = Object.entries(pendingPriceChanges).map(([rateId, price]) => {
        const rate = rates.find(r => r.id === parseInt(rateId));
        if (rate) {
          return fetch(`/api/pricing/rates/${rateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              price: parseFloat(price) || 0,
              price_unit: rate.price_unit,
              is_active: rate.is_active
            })
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      
      showAlert('success', 'All pricing updates saved successfully');
      setPendingPriceChanges({});
      setHasChanges(false);
      fetchData();
    } catch (error) {
      console.error('Error saving prices:', error);
      showAlert('error', 'Failed to save some pricing updates');
    }
  };

  const handleCreateRate = async (tableTypeId, pricingType) => {
    try {
      const response = await fetch('/api/pricing/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_type_id: tableTypeId,
          pricing_type: pricingType,
          price: 0,
          price_unit: pricingType === 'deal' ? 'person' : 'hour'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Pricing rate created successfully');
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to create pricing rate');
      }
    } catch (error) {
      console.error('Error creating rate:', error);
      showAlert('error', error.message);
    }
  };

  const getRatesByTableType = (tableTypeId) => {
    return rates.filter(rate => rate.table_type_id === tableTypeId);
  };

  const getRateByType = (tableTypeId, pricingType) => {
    return rates.find(rate => rate.table_type_id === tableTypeId && rate.pricing_type === pricingType && rate.is_active);
  };

  const getCurrentPrice = (rate) => {
    return pendingPriceChanges[rate.id] !== undefined ? pendingPriceChanges[rate.id] : rate.price;
  };

  if (loading) {
    return <div className="content-section loading">Loading pricing management...</div>;
  }

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>Pricing Management</h2>
        {hasChanges && Object.keys(pendingPriceChanges).length > 0 && (
          <button className="pricing-mgmt__save-btn" onClick={handleSavePrices}>
            Save Pricing Changes
          </button>
        )}
      </div>
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'table-types' ? 'active' : ''}`}
          onClick={() => setActiveTab('table-types')}
        >
          Table Types
        </button>
        <button 
          className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'table-types' && (
          <div className="pricing-mgmt__section">
            <h3>Manage Table Types</h3>
            
            {/* Add New Table Type Form */}
            <div className="pricing-mgmt__add-form">
              <h4>Add New Table Type</h4>
              <div className="pricing-mgmt__form">
                <div className="pricing-mgmt__form-group">
                  <label className="pricing-mgmt__label">Table Name:</label>
                  <input
                    type="text"
                    className="pricing-mgmt__input"
                    value={newTableType.table_name}
                    onChange={(e) => {
                      setNewTableType(prev => ({ ...prev, table_name: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="e.g., 9ft Diamond Tables"
                  />
                </div>
                <div className="pricing-mgmt__form-group">
                  <label className="pricing-mgmt__label">Description:</label>
                  <input
                    type="text"
                    className="pricing-mgmt__input"
                    value={newTableType.table_description}
                    onChange={(e) => {
                      setNewTableType(prev => ({ ...prev, table_description: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="Optional description"
                  />
                </div>
                <div className="pricing-mgmt__form-group">
                  <label className="pricing-mgmt__label">Sort Order:</label>
                  <input
                    type="number"
                    className="pricing-mgmt__input"
                    value={newTableType.sort_order}
                    onChange={(e) => {
                      setNewTableType(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }));
                      setHasChanges(true);
                    }}
                    min="0"
                  />
                </div>
                <div className="pricing-mgmt__form-group">
                  <label className="pricing-mgmt__label">Table Count:</label>
                  <input
                    type="number"
                    className="pricing-mgmt__input"
                    value={newTableType.table_count}
                    onChange={(e) => {
                      setNewTableType(prev => ({ ...prev, table_count: parseInt(e.target.value) || 0 }));
                      setHasChanges(true);
                    }}
                    min="0"
                    placeholder="Number of tables available"
                  />
                </div>
                <button 
                  className="pricing-mgmt__btn pricing-mgmt__btn--primary"
                  onClick={() => handleTableTypeSubmit(newTableType)}
                  disabled={!newTableType.table_name.trim()}
                >
                  Add Table Type
                </button>
              </div>
            </div>

            {/* Existing Table Types */}
            <div className="pricing-mgmt__table-types-list">
              <h4>Existing Table Types</h4>
              {tableTypes.map(tableType => (
                <div key={tableType.id} className="pricing-mgmt__table-type-card">
                  {editingTableType?.id === tableType.id ? (
                    <div className="pricing-mgmt__form">
                      <div className="pricing-mgmt__form-group">
                        <label className="pricing-mgmt__label">Table Name:</label>
                        <input
                          type="text"
                          className="pricing-mgmt__input"
                          value={editingTableType.table_name}
                          onChange={(e) => setEditingTableType(prev => ({ ...prev, table_name: e.target.value }))}
                        />
                      </div>
                      <div className="pricing-mgmt__form-group">
                        <label className="pricing-mgmt__label">Description:</label>
                        <input
                          type="text"
                          className="pricing-mgmt__input"
                          value={editingTableType.table_description}
                          onChange={(e) => setEditingTableType(prev => ({ ...prev, table_description: e.target.value }))}
                        />
                      </div>
                      <div className="pricing-mgmt__form-group">
                        <label className="pricing-mgmt__label">Sort Order:</label>
                        <input
                          type="number"
                          className="pricing-mgmt__input"
                          value={editingTableType.sort_order}
                          onChange={(e) => setEditingTableType(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      <div className="pricing-mgmt__form-group">
                        <label className="pricing-mgmt__label">Table Count:</label>
                        <input
                          type="number"
                          className="pricing-mgmt__input"
                          value={editingTableType.table_count || 0}
                          onChange={(e) => setEditingTableType(prev => ({ ...prev, table_count: parseInt(e.target.value) || 0 }))}
                          min="0"
                          placeholder="Number of tables available"
                        />
                      </div>
                      <div className="pricing-mgmt__form-group">
                        <label className="pricing-mgmt__checkbox-label">
                          <input
                            type="checkbox"
                            checked={editingTableType.is_active}
                            onChange={(e) => setEditingTableType(prev => ({ ...prev, is_active: e.target.checked }))}
                          />
                          Active
                        </label>
                      </div>
                      <div className="pricing-mgmt__actions">
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--success"
                          onClick={() => handleTableTypeSubmit(editingTableType, true)}
                        >
                          Save
                        </button>
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--secondary"
                          onClick={() => setEditingTableType(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="pricing-mgmt__table-type-info">
                        <h5>{tableType.table_name}</h5>
                        {tableType.table_description && <p>{tableType.table_description}</p>}
                        <small>Sort Order: {tableType.sort_order} | Table Count: {tableType.table_count || 0} | Active: {tableType.is_active ? 'Yes' : 'No'}</small>
                        <small> | Pricing Rates: {tableType.pricing_count}</small>
                      </div>
                      <div className="pricing-mgmt__actions">
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--secondary"
                          onClick={() => setEditingTableType(tableType)}
                        >
                          Edit
                        </button>
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--danger"
                          onClick={() => handleTableTypeDelete(tableType.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="pricing-mgmt__section">
            <h3>Manage Pricing Rates</h3>
            
            {tableTypes.filter(tt => tt.is_active).map(tableType => {
              const dealRate = getRateByType(tableType.id, 'deal');
              const regularRate = getRateByType(tableType.id, 'regular');
              
              return (
                <div key={tableType.id} className="pricing-mgmt__pricing-card">
                  <h4>{tableType.table_name}</h4>
                  
                  <div className="pricing-mgmt__pricing-types">
                    {/* Deal Pricing */}
                    <div className="pricing-mgmt__pricing-type">
                      <h5>Deal Pricing (per person)</h5>
                      {dealRate ? (
                        <div className="pricing-mgmt__price-input-group">
                          <span className="pricing-mgmt__currency">$</span>
                          <input
                            type="number"
                            className="pricing-mgmt__price-input"
                            value={getCurrentPrice(dealRate)}
                            onChange={(e) => handlePriceChange(dealRate.id, e.target.value)}
                            step="0.01"
                            min="0"
                          />
                          <span className="pricing-mgmt__price-unit">per {dealRate.price_unit}</span>
                        </div>
                      ) : (
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--primary"
                          onClick={() => handleCreateRate(tableType.id, 'deal')}
                        >
                          Add Deal Pricing
                        </button>
                      )}
                    </div>

                    {/* Regular Pricing */}
                    <div className="pricing-mgmt__pricing-type">
                      <h5>Regular Pricing (per hour)</h5>
                      {regularRate ? (
                        <div className="pricing-mgmt__price-input-group">
                          <span className="pricing-mgmt__currency">$</span>
                          <input
                            type="number"
                            className="pricing-mgmt__price-input"
                            value={getCurrentPrice(regularRate)}
                            onChange={(e) => handlePriceChange(regularRate.id, e.target.value)}
                            step="0.01"
                            min="0"
                          />
                          <span className="pricing-mgmt__price-unit">per {regularRate.price_unit}</span>
                        </div>
                      ) : (
                        <button 
                          className="pricing-mgmt__btn pricing-mgmt__btn--primary"
                          onClick={() => handleCreateRate(tableType.id, 'regular')}
                        >
                          Add Regular Pricing
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingManagement;