import React, { useState } from 'react';

const FAQItem = ({ faq }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="faq-item">
      <button 
        className="faq-question"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{faq.question}</span>
        <span>{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="faq-answer">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;