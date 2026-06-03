import React, { useState } from 'react';
import './EventsManagement.css';
import AnnouncementSection from './AnnouncementSection';
import OneTimeEventsSection from './OneTimeEventsSection';
import RecurringEventsSection from './RecurringEventsSection';

const EventsManagement = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements', 'one-time', 'recurring'

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>Events Management</h2>
      </div>
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button 
          className={`tab-button ${activeTab === 'one-time' ? 'active' : ''}`}
          onClick={() => setActiveTab('one-time')}
        >
          One-Time Events
        </button>
        <button 
          className={`tab-button ${activeTab === 'recurring' ? 'active' : ''}`}
          onClick={() => setActiveTab('recurring')}
        >
          Recurring Events
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'announcements' && (
          <AnnouncementSection onAlert={showAlert} />
        )}

        {activeTab === 'one-time' && (
          <OneTimeEventsSection onAlert={showAlert} />
        )}

        {activeTab === 'recurring' && (
          <RecurringEventsSection onAlert={showAlert} />
        )}
      </div>
    </div>
  );
};


export default EventsManagement;