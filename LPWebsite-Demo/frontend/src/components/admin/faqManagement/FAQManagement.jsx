import React, { useState, useEffect, useCallback } from 'react';
import AddFAQModal from './AddFAQModal';
import './FAQManagement.css';

const FAQManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  const fetchFAQs = useCallback(async () => {
    try {
      const response = await fetch('/api/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      showAlert('error', 'Failed to fetch FAQs');
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleDeleteFAQ = async (id) => {
    try {
      await fetch(`/api/faqs/${id}`, {
        method: 'DELETE'
      });
      fetchFAQs();
      showAlert('success', 'FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showAlert('error', 'Failed to delete FAQ');
    }
  };

  const handleEditFAQ = (faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleSubmitFAQ = async (faqData, faqId = null) => {
    try {
      let response;
      let successMessage;
      
      if (faqId) {
        // Editing existing FAQ
        response = await fetch(`/api/faqs/${faqId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(faqData),
        });
        successMessage = 'FAQ updated successfully';
      } else {
        // Adding new FAQ
        response = await fetch('/api/faqs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(faqData),
        });
        successMessage = 'FAQ added successfully';
      }
      
      if (response.ok) {
        setIsModalOpen(false);
        setEditingFaq(null);
        fetchFAQs();
        showAlert('success', successMessage);
      }
    } catch (error) {
      console.error('Error submitting FAQ:', error);
      showAlert('error', 'Failed to submit FAQ');
    }
  };

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>FAQ Management</h2>
        <button 
          className="add-button"
          onClick={() => {
            setEditingFaq(null);
            setIsModalOpen(true);
          }}
        >
          Add New FAQ
        </button>
      </div>
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}
      
      <div className="admin-faq-list">
        {faqs.map(faq => (
          <div key={faq.faq_id} className="admin-faq-item">
            <div className="admin-faq-content">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
            <div className="faq-buttons">
              <button 
                className="faq-edit-button"
                onClick={() => handleEditFAQ(faq)}
              >
                Edit
              </button>
              <button 
                className="faq-delete-button"
                onClick={() => handleDeleteFAQ(faq.faq_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddFAQModal 
          onClose={() => {
            setIsModalOpen(false);
            setEditingFaq(null);
          }}
          onSubmit={handleSubmitFAQ}
          editFaq={editingFaq}
        />
      )}
    </div>
  );
};

export default FAQManagement;