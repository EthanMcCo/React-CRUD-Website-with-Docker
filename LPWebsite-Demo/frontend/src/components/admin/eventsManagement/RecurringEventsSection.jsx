import React, { useState, useEffect, useCallback } from 'react';
import { linkifyText } from '../../shared/linkifyText';


const RecurringEventsSection = ({ onAlert }) => {
  const [patterns, setPatterns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    tables_used: '',
    pattern_start_date: '',
    pattern_end_date: '',
    is_active: true,
    event_type: 'other'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showExceptionsModal, setShowExceptionsModal] = useState(false);
  const [selectedPatternForExceptions, setSelectedPatternForExceptions] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [newExceptionDate, setNewExceptionDate] = useState('');
  const [newExceptionReason, setNewExceptionReason] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchPatterns = useCallback(async () => {
    try {
      const response = await fetch('/api/events/recurring');
      const data = await response.json();
      
      if (data.success) {
        setPatterns(data.patterns);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching recurring patterns:', error);
      onAlert('error', 'Failed to fetch recurring patterns');
    }
  }, [onAlert]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const handleCreate = async (e) => {
  e.preventDefault();
  try {
    // Convert empty string to null for pattern_end_date
    const submitData = {
      ...formData,
      pattern_end_date: formData.pattern_end_date || null
    };

    const response = await fetch('/api/events/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)  // Use submitData instead of formData
    });

    const data = await response.json();
    if (data.success) {
      // If image is selected, upload it
      if (selectedImage) {
        await handleImageUpload(data.pattern_id);
      }
      
      closeModal();
      fetchPatterns();
      onAlert('success', 'Recurring pattern created successfully');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    onAlert('error', `Failed to create recurring pattern: ${error.message}`);
  }
};

  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    // Convert empty string to null for pattern_end_date
    const submitData = {
      ...formData,
      pattern_end_date: formData.pattern_end_date || null
    };

    const response = await fetch(`/api/events/recurring/${editingPattern.pattern_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)  // Use submitData instead of formData
    });

    const data = await response.json();
    if (data.success) {
      // If new image is selected, upload it
      if (selectedImage) {
        await handleImageUpload(editingPattern.pattern_id);
      }
      
      closeModal();
      fetchPatterns();
      onAlert('success', 'Recurring pattern updated successfully');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    onAlert('error', `Failed to update recurring pattern: ${error.message}`);
  }
};

  const handleImageUpload = async (patternId) => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);

      const response = await fetch(`/api/events/recurring/${patternId}/image`, {
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

  const handleDeleteImage = async (patternId) => {
    if (window.confirm('Are you sure you want to delete this recurring event image?')) {
      try {
        const response = await fetch(`/api/events/recurring/${patternId}/image`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchPatterns();
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

  const fetchExceptions = async (patternId) => {
    try {
      const response = await fetch(`/api/events/recurring/${patternId}/exceptions`);
      const data = await response.json();
      
      if (data.success) {
        setExceptions(data.exceptions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching exceptions:', error);
      onAlert('error', 'Failed to fetch exception dates');
    }
  };

  const handleAddException = async () => {
    if (!newExceptionDate) {
      onAlert('error', 'Please select a date');
      return;
    }

    try {
      const response = await fetch(`/api/events/recurring/${selectedPatternForExceptions.pattern_id}/exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exception_date: newExceptionDate,
          reason: newExceptionReason || 'Event skipped by admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchExceptions(selectedPatternForExceptions.pattern_id);
        setNewExceptionDate('');
        setNewExceptionReason('');
        onAlert('success', 'Exception date added successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to add exception: ${error.message}`);
    }
  };

  const handleRemoveException = async (exceptionId) => {
    if (window.confirm('Are you sure you want to remove this exception? The event will resume on this date.')) {
      try {
        const response = await fetch(`/api/events/recurring/${selectedPatternForExceptions.pattern_id}/exceptions/${exceptionId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          fetchExceptions(selectedPatternForExceptions.pattern_id);
          onAlert('success', 'Exception removed successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        onAlert('error', `Failed to remove exception: ${error.message}`);
      }
    }
  };

  const openExceptionsModal = (pattern) => {
    setSelectedPatternForExceptions(pattern);
    setShowExceptionsModal(true);
    fetchExceptions(pattern.pattern_id);
  };

  const closeExceptionsModal = () => {
    setShowExceptionsModal(false);
    setSelectedPatternForExceptions(null);
    setExceptions([]);
    setNewExceptionDate('');
    setNewExceptionReason('');
  };

  const handleDelete = async (patternId) => {
    if (window.confirm('Are you sure you want to delete this recurring pattern? This will remove all instances of this event.')) {
      try {
        const response = await fetch(`/api/events/recurring/${patternId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          fetchPatterns();
          onAlert('success', 'Recurring pattern deleted successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        onAlert('error', `Failed to delete recurring pattern: ${error.message}`);
      }
    }
  };

  const openModal = (pattern = null) => {
    if (pattern) {
      setEditingPattern(pattern);
      setFormData({
        title: pattern.title,
        description: pattern.description || '',
        day_of_week: pattern.day_of_week,
        start_time: pattern.start_time,
        end_time: pattern.end_time,
        tables_used: pattern.tables_used || '',
        pattern_start_date: pattern.pattern_start_date,
        pattern_end_date: pattern.pattern_end_date || '',
        is_active: pattern.is_active,
        event_type: pattern.event_type || 'other'
      });
      setImagePreview(pattern.image_path || null);
    } else {
      setEditingPattern(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        tables_used: '',
        pattern_start_date: today,
        pattern_end_date: '',
        is_active: true,
        event_type: 'other'
      });
      setImagePreview(null);
    }
    setSelectedImage(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPattern(null);
    setSelectedImage(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderPatternItem = (pattern) => (
    <div key={pattern.pattern_id} className="manage-event-item">
      <div className="event-title-section">
        <div className="event-title">{pattern.title}</div>
        <div className="pattern-badges">
          <span className="recurring-badge">🔄 {pattern.day_of_week}</span>
          {pattern.image_path && (
            <span className="image-indicator">🖼️ Has Image</span>
          )}
          {!pattern.is_active && (
            <span className="inactive-badge">Inactive</span>
          )}
        </div>
      </div>

      <div className="event-details">
        <div className="event-detail time-detail">
          <span className="event-detail-label">Time</span>
          <span className="event-detail-value">{formatTime(pattern.start_time)} - {formatTime(pattern.end_time)}</span>
        </div>
        <div className="event-detail date-detail">
          <span className="event-detail-label">Active Period</span>
          <span className="event-detail-value">
            {formatDate(pattern.pattern_start_date)} → {formatDate(pattern.pattern_end_date)}
          </span>
        </div>
        <div className="event-detail tables-detail">
          <span className="event-detail-label">Tables</span>
          <span className="event-detail-value">{pattern.tables_used || 'Not specified'}</span>
        </div>
        {pattern.description && (
          <div className="event-detail description-detail">
            <span className="event-detail-label">Description</span>
            <span className="event-detail-value" title={pattern.description}>{linkifyText(pattern.description)}</span>
          </div>
        )}
        <div className="event-actions">
          <button 
            className="action-button edit-button"
            onClick={() => openModal(pattern)}
          >
            Edit
          </button>
          <button 
            className="action-button exceptions-button"
            onClick={() => openExceptionsModal(pattern)}
          >
            📅 Skip Dates
          </button>
          {pattern.image_path && (
            <button 
              className="action-button delete-image-button"
              onClick={() => handleDeleteImage(pattern.pattern_id)}
            >
              Delete Image
            </button>
          )}
          <button 
            className="action-button delete-button"
            onClick={() => handleDelete(pattern.pattern_id)}
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
        <h3 className="section-title">Recurring Events</h3>
        <button className="add-button" onClick={() => openModal()}>
          Add Recurring Event
        </button>
      </div>

      {patterns.length === 0 ? (
        <div className="no-events">No recurring event patterns</div>
      ) : (
        <div className="events-list">
          {patterns.map(pattern => renderPatternItem(pattern))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content event-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingPattern ? 'Edit Recurring Pattern' : 'Create New Recurring Pattern'}
              </h2>
            </div>
            <form onSubmit={editingPattern ? handleUpdate : handleCreate}>
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
                  placeholder="Optional description of the recurring event"
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Day of Week:</label>
                  <select
                    className="form-input"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
                    required
                  >
                    <option value="">Select Day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tables Used:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tables_used}
                    onChange={(e) => setFormData(prev => ({ ...prev, tables_used: e.target.value }))}
                    placeholder="e.g., Tables 1-4"
                  />
                </div>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.pattern_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, pattern_start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date (Optional):</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.pattern_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, pattern_end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <label htmlFor="is_active">Active (generates events)</label>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Event Flyer/Image:</label>
                <div className="image-upload-section">
                  <div 
                    className="image-upload-area"
                    onClick={() => document.getElementById('recurringImageInput').click()}
                  >
                    <input
                      id="recurringImageInput"
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
                        setImagePreview(editingPattern?.image_path || null);
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
                  {uploadingImage ? 'Uploading...' : (editingPattern ? 'Update Pattern' : 'Create Pattern')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exceptions Modal */}
      {showExceptionsModal && selectedPatternForExceptions && (
        <div className="modal-overlay">
          <div className="modal-content exceptions-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                Skip Dates for "{selectedPatternForExceptions.title}"
              </h2>
            </div>
            
            <div className="exceptions-content">
              <div className="add-exception-section">
                <h3>Add Exception Date</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date to Skip:</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newExceptionDate}
                      onChange={(e) => setNewExceptionDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason (Optional):</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newExceptionReason}
                      onChange={(e) => setNewExceptionReason(e.target.value)}
                      placeholder="e.g., Holiday, Special event, etc."
                    />
                  </div>
                </div>
                <button 
                  className="add-exception-button"
                  onClick={handleAddException}
                  disabled={!newExceptionDate}
                >
                  Add Exception
                </button>
              </div>

              <div className="exceptions-list-section">
                <h3>Current Exception Dates</h3>
                {exceptions.length === 0 ? (
                  <div className="no-exceptions">
                    No exception dates set. This event will occur every {selectedPatternForExceptions.day_of_week}.
                  </div>
                ) : (
                  <div className="exceptions-list">
                    {exceptions.map(exception => (
                      <div key={exception.exception_id} className="exception-item">
                        <div className="exception-date">
                          {new Date(exception.exception_date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {exception.reason && (
                          <div className="exception-reason">
                            {exception.reason}
                          </div>
                        )}
                        <button
                          className="remove-exception-button"
                          onClick={() => handleRemoveException(exception.exception_id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={closeExceptionsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringEventsSection;