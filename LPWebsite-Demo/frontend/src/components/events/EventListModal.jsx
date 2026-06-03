import React, { useEffect } from 'react';
import './EventListModal.css';
import '../shared/SharedModals.css';
import { linkifyText } from '../shared/linkifyText';

const EventListModal = ({ date, events, isOpen, onClose, onEventClick }) => {
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

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // FIXED: Timezone-safe date parsing function (same as Events.jsx)
  const createLocalDate = (dateString) => {
    try {
      if (!dateString) return null;
      
      // Clean the date string - remove time if present
      const cleanDateStr = dateString.split('T')[0];
      
      // Parse as local date to avoid timezone shifts
      const [year, month, day] = cleanDateStr.split('-').map(Number);
      
      // Create date in local timezone (months are 0-indexed in JS)
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // FIXED: Timezone-safe date formatting that handles various input types
  const formatEventDate = (dateString) => {
    try {
      if (!dateString) return 'No Date';
      
      const date = createLocalDate(dateString);
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
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
      return timeString; // Return original if formatting fails
    }
  };

  const getModalTitle = () => {
    if (date) {
      return `Events on ${formatDate(date)}`;
    } else {
      return 'All Events';
    }
  };

  return (
    <div className="events-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content event-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="events-modal-header">
          <h3>{getModalTitle()}</h3>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="event-list-content">
          {events.length === 0 ? (
            <p className="no-events-message">
              {date ? 'No events scheduled for this date.' : 'No events scheduled.'}
            </p>
          ) : (
            <ul className="events-modal-list">
              {events.map((event, index) => (
                <li 
                  key={event.event_id || index} 
                  className="event-list-item"
                  onClick={() => onEventClick(event)}
                >
                  <div className="event-item-content">
                    <div className="event-item-header">
                      <h4 className="event-item-title">{event.title || 'Untitled Event'}</h4>
                      {event.is_recurring ? (
                        <span className="event-badge recurring-badge">🔄 Recurring</span>
                      ) : null}
                    </div>
                    
                    <div className="event-item-details">
                      {/* FIXED: Show date if this is "all events" view with timezone-safe formatting */}
                      {!date && (event.date || event.event_date) ? (
                        <span className="event-date">
                          {formatEventDate(event.date || event.event_date)}
                        </span>
                      ) : null}
                      {event.start_time && event.end_time ? (
                        <span className="event-time">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                      ) : null}
                      {event.tables_used ? (
                        <span className="event-tables">
                          Tables: {event.tables_used}
                        </span>
                      ) : null}
                    </div>
                    
                    {event.description ? (
                      <p className="event-item-description">
                        {linkifyText(
                          event.description.length > 100 
                            ? `${event.description.substring(0, 100)}...` 
                            : event.description
                        )}
                      </p>
                    ) : null}
                  </div>
                  
                  <div className="event-item-arrow">›</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventListModal;