import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css'

const Contact = () => {
    const [contactInfo, setContactInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const response = await fetch('/api/business-settings/public/contact-info');
                const data = await response.json();
                
                if (data.success) {
                    setContactInfo(data.contactInfo);
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContactInfo();
    }, []);

    // Fallback values in case API fails
    const getTableCounts = () => {
        const diamond7ft = contactInfo.table_count_7ft_diamond || '8';
        const valley7ft = contactInfo.table_count_7ft_valley || '6';
        const diamond9ft = contactInfo.table_count_9ft_diamond || '8';
        
        return {
            diamond7ft,
            valley7ft,
            diamond9ft
        };
    };

    const tables = getTableCounts();

    if (loading) {
        return <div className="contact-page loading">Loading contact information...</div>;
    }

    return (     
        <div className='contact-page'>
            <section className='contact-container'>
                <section id='left-section' className='half-section'>
                    <div>
                        <h1>Welcome to Calgary's favourite pool hall</h1>
                        <p>
                            We're not just a place to play pool - we're a community. Whether you're here to hone your skills,
                            compete in tournaments, or just have a fun night out, our doors are always open. With quality tables,
                            a welcoming atmosphere, and regular events, we offer the ultimate pool experience in Calgary.
                            <br /> <br />
                            We are fully licensed and allow minors during all operational hours. Please see our{' '}
                            <Link to="/menu" className="menu-link">Menu</Link> page for all food and beverage options.
                            <br /> <br />
                            We have a resident cue tech that sells/repairs cues and will meet your cue maintenance needs.
                        </p>
                    </div>
                    <div className="hours-tables">
                        <div>
                            <h3>HOURS</h3>
                            <ul>
                                {(contactInfo.hours_description || '7 days a week (11AM to 2AM)\n365 days a year\nIncluding every holiday')
                                    .split('\n')
                                    .map((line, index) => (
                                        <li key={index}>{line}</li>
                                    ))
                                }
                            </ul>
                        </div>
                        <div>
                            <h3>TABLES</h3>
                            <ul>
                                <li>{tables.diamond7ft} 7-foot Diamond tables</li>
                                <li>{tables.valley7ft} 7-foot Valley tables</li>
                                <li>{tables.diamond9ft} 9-foot Diamond tables</li>
                            </ul>
                        </div>
                    </div>
                    <div className="address-container">
                        <h3>ADDRESS</h3>
                        <p>
                            {contactInfo.address_line1 || '3715 Edmonton Trail NE'}
                            {contactInfo.address_line2 && <><br />{contactInfo.address_line2}</>}
                            {!contactInfo.address_line2 && <><br />Calgary, AB, T2E 3P3</>}
                        </p>

                        <iframe 
                            src={contactInfo.google_maps_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2506.2353179953684!2d-114.05533332340514!3d51.08566457172042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5371650b59d10d93%3A0xf13e461150efea6a!2s3715%20Edmonton%20Trl%2C%20Calgary%2C%20AB%20T2E%203P4!5e0!3m2!1sen!2sca!4v1733561185119!5m2!1sen!2sca"} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade" 
                            className='map'
                            title={`${contactInfo.business_name || 'Leather Pocket'} Location - ${contactInfo.address_line1 || '3715 Edmonton Trail NE, Calgary'}`}
                        ></iframe> ß                       
                        {/* <a href="https://www.google.com/maps?q=3715+Edmonton+Trl,+Calgary,+AB+T2E+3P4" className="address_button" >Find us on Google Maps</a> */}
                    </div>
                </section>
                <section className="half-section">
                    <img src="/LPOutside.png" alt="Leather Pocket" className='hall-image'/>

                    <h1>Have questions?</h1>
                    <p>Feel free to reach out by phone at <a href={`tel:${contactInfo.phone_number || '123-456-7890'}`}>{contactInfo.phone_number || '123-456-7890'}</a>, or shoot us an email at <br/> <br/><a href={`mailto:${contactInfo.email_address || 'contact@leatherpocket.com'}`}>{contactInfo.email_address || 'contact@leatherpocket.com'}</a></p>

                    <h1>Follow us on social media</h1>
                    <p>Become part of the community. Check us out on Instagram and Facebook <br/> <br/> 
                        {contactInfo.social_facebook && <a href="https://www.facebook.com/">{contactInfo.social_facebook}</a>}
                        {!contactInfo.social_facebook && <a href="https://www.facebook.com/">@LeatherPocket</a>}
                        {contactInfo.social_instagram && (
                            <>
                                {' and '}
                                <a href="https://www.instagram.com/">{contactInfo.social_instagram}</a>
                            </>
                        )}
                    </p>
                </section>
            </section>

        </div>
    );
}

export default Contact;
