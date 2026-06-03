import React from 'react';
import { linkifyText } from '../shared/linkifyText';

const EventsItem = ({ event, onClick, showDate = true, isCompact = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEventTypeIndicator = () => {
    if (!event.is_recurring) {
      return null;
    }
    
    return (
      <span className="event-type-indicator recurring">
        Recurring
      </span>
    );
  };

  if (isCompact) {
    // Compact view for upcoming events list
    return (
      <li className="event-item compact" onClick={onClick}>
        <div className="event-content">
          <div className="event-title-row">
            <strong className="event-title">{event.title}</strong>
            {getEventTypeIndicator()}
          </div>
          {showDate && (
            <span className="event-date">{formatDate(event.event_date)}</span>
          )}
          <span className="event-time">
            {formatTime(event.start_time)} - {formatTime(event.end_time)}
          </span>
        </div>
      </li>
    );
  }

  // Full view for detailed display
  return (
    <div className="event-item-full" onClick={onClick}>
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        {getEventTypeIndicator()}
      </div>
      
      <div className="event-details">
        {showDate && (
          <div className="event-detail">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(event.event_date)}</span>
          </div>
        )}
        
        <div className="event-detail">
          <span className="detail-label">Time:</span>
          <span className="detail-value">
            {formatTime(event.start_time)} - {formatTime(event.end_time)}
          </span>
        </div>
        
        {event.tables_used && (
          <div className="event-detail">
            <span className="detail-label">Tables:</span>
            <span className="detail-value">{event.tables_used}</span>
          </div>
        )}
        
        {event.description && (
          <div className="event-detail description">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{linkifyText(event.description)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsItem;