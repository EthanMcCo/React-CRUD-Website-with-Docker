import React, { useState, useEffect, useCallback } from 'react';
import { linkifyText } from '../../shared/linkifyText';

const OneTimeEventsSection = ({ onAlert }) => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    tables_used: '',
    event_type: 'other'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const pastDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`/api/events?startDate=${pastDate}&endDate=${futureDate}`);
      const data = await response.json();
      
      if (data.success) {
        const oneTimeEvents = data.events.filter(event => !event.is_recurring);
        setEvents(oneTimeEvents);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      onAlert('error', 'Failed to fetch events');
    }
  }, [onAlert]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        // If image is selected, upload it
        if (selectedImage) {
          await handleImageUpload(data.event_id);
        }
        
        closeModal();
        fetchEvents();
        onAlert('success', 'Event created successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to create event: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events/${editingEvent.event_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        // If new image is selected, upload it
        if (selectedImage) {
          await handleImageUpload(editingEvent.event_id);
        }
        
        closeModal();
        fetchEvents();
        onAlert('success', 'Event updated successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to update event: ${error.message}`);
    }
  };

  const handleImageUpload = async (eventId) => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);

      const response = await fetch(`/api/events/${eventId}/image`, {
        method: 'POST',
        body: imageFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data.imagePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      onAlert('error', 'Failed to upload event image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event image?')) {
      try {
        const response = await fetch(`/api/events/${eventId}/image`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchEvents();
          onAlert('success', 'Event image deleted successfully');
        } else {
          throw new Error('Failed to delete image');
        }
      } catch (error) {
        onAlert('error', `Failed to delete image: ${error.message}`);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        onAlert('error', 'Image file size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        onAlert('error', 'Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          fetchEvents();
          onAlert('success', 'Event deleted successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        onAlert('error', `Failed to delete event: ${error.message}`);
      }
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        tables_used: event.tables_used || '',
        event_type: event.event_type || 'other'
      });
      setImagePreview(event.image_path || null);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        tables_used: '',
        event_type: 'other'
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setSelectedImage(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderEventItem = (event) => (
    <div key={event.event_id} className="manage-event-item">
      <div className="event-title-section">
        <div className="event-title">{event.title}</div>
        {event.image_path && (
          <span className="image-indicator">🖼️ Has Image</span>
        )}
      </div>

      <div className="event-details">
        <div className="event-detail date-detail">
          <span className="event-detail-label">Date</span>
          <span className="event-detail-value">{formatDate(event.event_date)}</span>
        </div>
        <div className="event-detail time-detail">
          <span className="event-detail-label">Time</span>
          <span className="event-detail-value">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
        </div>
        <div className="event-detail tables-detail">
          <span className="event-detail-label">Tables</span>
          <span className="event-detail-value">{event.tables_used || 'Not specified'}</span>
        </div>
        {event.description && (
          <div className="event-detail description-detail">
            <span className="event-detail-label">Description</span>
            <span className="event-detail-value" title={event.description}>{linkifyText(event.description)}</span>
          </div>
        )}
        <div className="event-actions">
          <button 
            className="action-button edit-button"
            onClick={() => openModal(event)}
          >
            Edit
          </button>
          {event.image_path && (
            <button 
              className="action-button delete-image-button"
              onClick={() => handleDeleteImage(event.event_id)}
            >
              Delete Image
            </button>
          )}
          <button 
            className="action-button delete-button"
            onClick={() => handleDelete(event.event_id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="management-section">
      <div className="section-header">
        <h3 className="section-title">One-time Events</h3>
        <button className="add-button" onClick={() => openModal()}>
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">No one-time events scheduled</div>
      ) : (
        <div className="events-list">
          {events.map(event => renderEventItem(event))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content event-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
            </div>
            <form onSubmit={editingEvent ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Event Title:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of the event"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Type:</label>
                <select
                  className="form-input"
                  value={formData.event_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                  required
                >
                  <option value="league">League Event</option>
                  <option value="tournament">Tournament</option>
                  <option value="other">Other Event</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Date:</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.event_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time:</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time:</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tables Used:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tables_used}
                  onChange={(e) => setFormData(prev => ({ ...prev, tables_used: e.target.value }))}
                  placeholder="e.g., Tables 1-4, All 9ft tables"
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Event Flyer/Image:</label>
                <div className="image-upload-section">
                  <div 
                    className="image-upload-area"
                    onClick={() => document.getElementById('eventImageInput').click()}
                  >
                    <input
                      id="eventImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Event preview" 
                          className="image-preview"
                        />
                        <div className="image-preview-overlay">
                          <p>Click to change image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <div className="upload-icon">📄</div>
                        <p>Click to upload event flyer</p>
                        <small>Supports JPG, PNG, GIF (max 10MB)</small>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(editingEvent?.image_path || null);
                      }}
                    >
                      Remove Selected Image
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneTimeEventsSection;