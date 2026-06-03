import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = ({ 
  recipientName, 
  recipientId, 
  recipientType, // 'team' or 'player'
  messagePlaceholder,
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    message: ''
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(`/api/contact/${recipientType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [`${recipientType}Id`]: recipientId,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ senderName: '', senderEmail: '', message: '' });
      }, 2000);
    } catch (error) {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Contact {recipientName}</h2>
        <p className="modal-description">
          Send a message to this {recipientType}. They will receive your message and can respond to your email if they're interested.
        </p>
        
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="senderName">Your Name:</label>
            <input
              id="senderName"
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senderEmail">Your Email:</label>
            <input
              id="senderEmail"
              type="email"
              value={formData.senderEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={messagePlaceholder}
              rows="4"
              required
            />
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setFormData({ senderName: '', senderEmail: '', message: '' });
                setStatus('idle');
                onClose();
              }}
              disabled={status === 'loading'}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Sending...' : 
               status === 'success' ? 'Sent!' : 
               status === 'error' ? 'Try Again' : 
               'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;