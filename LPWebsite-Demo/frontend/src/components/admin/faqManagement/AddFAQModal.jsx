import React, { useState } from 'react';
import './AddFAQModal.css';

const AddFAQModal = ({ onClose, onSubmit, editFaq = null }) => {
  const [formData, setFormData] = useState({
    question: editFaq?.question || '',
    answer: editFaq?.answer || '',
    topic: editFaq?.topic || ''
  });

  const categories = [
    'Leagues',
    'Events', 
    'Pricing + Hours',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editFaq) {
      onSubmit(formData, editFaq.faq_id);
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editFaq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
        <div onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic">Category:</label>
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <input
              type="text"
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="answer">Answer:</label>
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="faq-cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="faq-submit-button" onClick={handleSubmit}>
              {editFaq ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFAQModal;