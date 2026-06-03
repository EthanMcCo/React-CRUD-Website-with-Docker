import React from 'react';
import { Link } from 'react-router-dom';

const ContactSection = () => {
    return (
      <div className="contact-section">
        <h2 className="contact-title">Can't find what you're looking for?</h2>
        <p className="contact-text">
          We're here to help. Don't hesitate to contact us directly for any questions you might have.
          Check out the Contact us page for ways to reach out.
        </p>
        <Link to="/about/contact">
          <button className="contact-button">
            Contact us
          </button>
        </Link>
      </div>
    );
};

export default ContactSection;