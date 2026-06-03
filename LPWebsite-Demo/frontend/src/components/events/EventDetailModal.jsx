import React, { useEffect } from 'react';

import './EventDetailModal.css';
import '../shared/SharedModals.css';
import { linkifyText } from '../shared/linkifyText';

const EventDetailModal = ({ event, isOpen, onClose, onBack, showBackButton = false }) => {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  // Timezone-safe date parsing function
  const createLocalDate = (dateString) => {
    try {
      if (!dateString) return null;
      
      const cleanDateStr = dateString.split('T')[0];
      const [year, month, day] = cleanDateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  // Timezone-safe date formatting
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No Date';
      
      const date = createLocalDate(dateString);
      
      if (!date || isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date Error';
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return '';
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Time formatting error:', error);
      return timeString;
    }
  };

  // Handle image path properly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;
    
    // For relative paths starting with /uploads, use as-is (React dev server proxy will handle)
    if (imagePath.startsWith('/uploads')) {
      return imagePath;
    }
    
    // If it doesn't start with /, add it
    if (!imagePath.startsWith('/')) {
      return `/uploads/events/${imagePath}`;
    }
    
    return imagePath;
  };

  const imageUrl = getImageUrl(event.image_path);

  return (
    <div className="events-modal-overlay" onClick={onClose}>
      <div 
        className="event-detail-modal-redesign"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="events-modal-header">
          <div className="modal-header-content">
            {showBackButton && (
              <button 
                className="modal-back-button"
                onClick={onBack}
                aria-label="Back to events list"
              >
                ‹ Back
              </button>
            )}
            <h3 className="event-detail-title">{event.title}</h3>
          </div>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="event-detail-content-redesign">
          {/* Top Section: Date and Tables side by side */}
          <div className="event-top-section">
            <div className="event-date-section">
              <h4>Date & Time</h4>
              <div className="date-time-content">
                <div className="date-info">
                  {formatDate(event.event_date || event.date)}
                </div>
                {event.start_time && event.end_time && (
                  <div className="time-info">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </div>
                )}
                {event.is_recurring && (
                  <div className="recurring-info">
                    <span className="recurring-badge">🔄 Recurring Event</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="event-tables-section">
              <h4>Tables</h4>
              <div className="tables-content">
                {event.tables_used || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="event-description-section">
              <h4>Description</h4>
              <div className="description-content">
                {linkifyText(event.description)}
              </div>
            </div>
          )}

          {/* Image Section - Large at bottom */}
          {imageUrl && (
            <div className="event-image-section-large">
              <h4>Event Flyer</h4>
              <div className="image-container-large">
                <img 
                  src={imageUrl}
                  alt={`${event.title} flyer`}
                  className="event-image-large"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;