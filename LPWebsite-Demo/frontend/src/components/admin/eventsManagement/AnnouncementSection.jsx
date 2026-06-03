import React, { useState, useEffect, useCallback } from 'react';
import { linkifyText } from '../../shared/linkifyText';

const AnnouncementSection = ({ onAlert }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expiry_date: '',
    is_active: true
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch(`/api/announcements?adminView=true`);
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      onAlert('error', 'Failed to fetch announcements');
    }
  }, [onAlert]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        closeModal();
        fetchAnnouncements();
        onAlert('success', 'Announcement created successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to create announcement: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/announcements/${editingAnnouncement.announcement_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        closeModal();
        fetchAnnouncements();
        onAlert('success', 'Announcement updated successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      onAlert('error', `Failed to update announcement: ${error.message}`);
    }
  };

  const handleDelete = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const response = await fetch(`/api/announcements/${announcementId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          fetchAnnouncements();
          onAlert('success', 'Announcement deleted successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        onAlert('error', `Failed to delete announcement: ${error.message}`);
      }
    }
  };

  const openModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        description: announcement.description || '',
        expiry_date: announcement.expiry_date,
        is_active: announcement.is_active
      });
    } else {
      setEditingAnnouncement(null);
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30);
      setFormData({
        title: '',
        description: '',
        expiry_date: defaultExpiry.toISOString().split('T')[0],
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isAnnouncementExpired = (expiryDate) => {
    const today = new Date().toISOString().split('T')[0];
    return expiryDate < today;
  };

  const renderAnnouncementItem = (announcement) => (
    <div key={announcement.announcement_id} className="manage-event-item">
      <div className="event-title-section">
        <div className="event-title">{announcement.title}</div>
        <div className="event-badges">
          {isAnnouncementExpired(announcement.expiry_date) && (
            <span className="recurring-badge" style={{ backgroundColor: '#dc3545' }}>
              Expired
            </span>
          )}
          {!announcement.is_active && (
            <span className="recurring-badge" style={{ backgroundColor: '#6c757d' }}>
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="event-details">
        <div className="event-detail date-detail">
          <span className="event-detail-label">Expires</span>
          <span className="event-detail-value">{formatDate(announcement.expiry_date)}</span>
        </div>
        {announcement.description && (
          <div className="event-detail description-detail">
            <span className="event-detail-label">Description</span>
            <span className="event-detail-value" title={announcement.description}>{linkifyText(announcement.description)}</span>
          </div>
        )}
        <div className="event-actions">
          <button 
            className="action-button edit-button"
            onClick={() => openModal(announcement)}
          >
            Edit
          </button>
          <button 
            className="action-button delete-button"
            onClick={() => handleDelete(announcement.announcement_id)}
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
        <h3 className="section-title">Announcements</h3>
        <button className="add-button" onClick={() => openModal()}>
          Add Announcement
        </button>
      </div>
      
      {announcements.length === 0 ? (
        <div className="no-events">No announcements</div>
      ) : (
        <div className="events-list">
          {announcements.map(announcement => renderAnnouncementItem(announcement))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="event-modal-header">
              <h2 className="modal-title">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
            </div>
            <form onSubmit={editingAnnouncement ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Announcement Title:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter the announcement details"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date:</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Announcement will be hidden after this date
                </small>
              </div>

              <div className="form-group">
                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    id="is_active_announcement"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <label htmlFor="is_active_announcement">Active (visible to users)</label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementSection;