import React, { useState, useEffect, useCallback } from 'react';
import './ContactManagement.css';

const ContactManagement = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/business-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        // Convert settings array to object for form data
        const formObject = {};
        data.settings.forEach(setting => {
          formObject[setting.setting_key] = setting.setting_value;
        });
        setFormData(formObject);
      } else {
        throw new Error(data.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showAlert('error', `Failed to fetch settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleInputChange = (settingKey, value) => {
    setFormData(prev => ({
      ...prev,
      [settingKey]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const settingsToUpdate = settings.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: formData[setting.setting_key] || setting.setting_value
      }));

      const response = await fetch('/api/business-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate })
      });

      const data = await response.json();
      
      if (data.success) {
        setHasChanges(false);
        showAlert('success', 'Settings updated successfully');
        fetchSettings(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showAlert('error', `Failed to update settings: ${error.message}`);
    }
  };

  const renderFormField = (setting) => {
    const value = formData[setting.setting_key] || '';
    
    switch (setting.setting_type) {
      case 'textarea':
        return (
          <textarea
            className="contact-mgmt__input contact-mgmt__textarea"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            rows={setting.setting_key === 'google_maps_embed' ? 3 : 4}
            placeholder={`Enter ${setting.display_name.toLowerCase()}`}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            className="contact-mgmt__input"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`Enter ${setting.display_name.toLowerCase()}`}
          />
        );
      case 'phone':
        return (
          <input
            type="tel"
            className="contact-mgmt__input"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder="123-456-7890"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="contact-mgmt__input"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            min="0"
            placeholder="0"
          />
        );
      default:
        return (
          <input
            type="text"
            className="contact-mgmt__input"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={`Enter ${setting.display_name.toLowerCase()}`}
          />
        );
    }
  };

  const filterSettingsByCategory = (category) => {
    return settings.filter(setting => setting.category === category);
  };

  if (loading) {
    return <div className="content-section loading">Loading contact settings...</div>;
  }

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>Contact Management</h2>
        {hasChanges && (
          <button className="contact-mgmt__save-btn" onClick={handleSave}>
            Save Changes
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
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          Tables & Branding
        </button>
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General Settings
        </button>
        <button 
          className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'contact' && (
          <div className="contact-mgmt__section">
            <h3>Contact Information</h3>
            <div className="contact-mgmt__form">
              {filterSettingsByCategory('contact').map(setting => (
                <div key={setting.setting_key} className="contact-mgmt__form-group">
                  <label className="contact-mgmt__label">
                    {setting.display_name}:
                  </label>
                  {renderFormField(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="contact-mgmt__section">
            <h3>Table Inventory & Branding</h3>
            <div className="contact-mgmt__form">
              {filterSettingsByCategory('tables').map(setting => (
                <div key={setting.setting_key} className="contact-mgmt__form-group">
                  <label className="contact-mgmt__label">
                    {setting.display_name}:
                  </label>
                  {renderFormField(setting)}
                </div>
              ))}
              
              {/* Business Name in this section for branding */}
              {settings.filter(s => s.setting_key === 'business_name').map(setting => (
                <div key={setting.setting_key} className="contact-mgmt__form-group">
                  <label className="contact-mgmt__label">
                    {setting.display_name}:
                  </label>
                  {renderFormField(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="contact-mgmt__section">
            <h3>General Settings</h3>
            <div className="contact-mgmt__form">
              {filterSettingsByCategory('general').filter(s => s.setting_key !== 'business_name').map(setting => (
                <div key={setting.setting_key} className="contact-mgmt__form-group">
                  <label className="contact-mgmt__label">
                    {setting.display_name}:
                  </label>
                  {renderFormField(setting)}
                  {setting.setting_key === 'google_maps_embed' && (
                    <small className="contact-mgmt__help-text">
                      Get this URL from Google Maps embed feature
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="contact-mgmt__section">
            <h3>Social Media</h3>
            <div className="contact-mgmt__form">
              {filterSettingsByCategory('social').map(setting => (
                <div key={setting.setting_key} className="contact-mgmt__form-group">
                  <label className="contact-mgmt__label">
                    {setting.display_name}:
                  </label>
                  {renderFormField(setting)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="contact-mgmt__save-footer">
          <p className="contact-mgmt__unsaved-warning">
            You have unsaved changes
          </p>
          <button className="contact-mgmt__save-btn" onClick={handleSave}>
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;