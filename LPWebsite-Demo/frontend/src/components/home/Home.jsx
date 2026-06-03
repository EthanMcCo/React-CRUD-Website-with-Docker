import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import EventDetailModal from '../events/EventDetailModal';
import { linkifyText } from '../shared/linkifyText';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import '../events/EventDetailModal.css';
import '../shared/SharedModals.css';
import "./Home.css";

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const Home = () => {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const railRef = useRef(null);

  const [eventDetailModal, setEventDetailModal] = useState({ isOpen: false, event: null });
  const [announcementModal, setAnnouncementModal] = useState({ isOpen: false, announcement: null });

  // Fetch gallery images from API
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('/api/home-gallery');
        if (response.ok) {
          const galleryData = await response.json();
          if (galleryData.length > 0) {
            setImages(galleryData.map(img => img.image_path));
          } else {
            // Fallback to default images if no images in gallery
            setImages([
              '/pic1.png',
              '/pic2.png',
              '/pic3.jpeg',
              '/pic4.jpg',
            ]);
          }
        } else {
          // Fallback to default images on error
          setImages([
            '/pic1.png',
            '/pic2.png',
            '/pic3.jpeg',
            '/pic4.jpg',
          ]);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        // Fallback to default images
        setImages([
          '/pic1.png',
          '/pic2.png',
          '/pic3.jpeg',
          '/pic4.jpg',
        ]);
      }
    };

    fetchGalleryImages();
  }, []);

  useEffect(() => {
    fetch('/api/announcements/public/upcoming')
      .then(r => r.json())
      .then(data => { if (data.success) setAnnouncements(data.announcements); })
      .catch(() => {});

    fetch('/api/events/upcoming')
      .then(r => r.json())
      .then(data => { if (data.success) setUpcomingEvents(data.events.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const scrollToRail = () => {
    if (railRef.current) {
      railRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      railRef.current.classList.add('home-side-rail--flash');
      setTimeout(() => railRef.current && railRef.current.classList.remove('home-side-rail--flash'), 1400);
    }
  };

  const handleImageClick = (imageIndex) => {
    setModalImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle slide click to open modal
  const handleSlideClick = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const handleAnnouncementClick = (announcement) => {
    setAnnouncementModal({ isOpen: true, announcement });
  };

  const handleEventClick = (event) => {
    setEventDetailModal({ isOpen: true, event });
  };

  // Swiper configuration
  const swiperParams = {
    modules: [Navigation, Pagination, Autoplay, EffectCoverflow],
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 45,        // Positive rotation makes previews face inward
      stretch: 80,       // Increased stretch creates gap between images
      depth: 100,        // Moderate depth for clean 3D effect
      modifier: 1,       // Standard modifier for balanced perspective
      slideShadows: true,
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    // Navigation removed - not needed with swipe/drag functionality
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    loop: true,
    speed: 600,
    onSwiper: setSwiperRef,
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay">
          <h1>Step into a world of classic entertainment and friendly competition</h1>
          <Link to="/events" className="primary-button">View events</Link>
        </div>
        {announcements.length > 0 && (
          <button className="home-hero-chip" onClick={scrollToRail} type="button">
            <span className="home-hero-chip__dot" />
            <span className="home-hero-chip__count">
              {announcements.length} new announcement{announcements.length !== 1 ? 's' : ''}
            </span>
            <span className="home-hero-chip__sep">·</span>
            <strong>{announcements[0].title}</strong>
            <span className="home-hero-chip__arrow">→</span>
          </button>
        )}
      </section>

      <div className="home-container home-container--with-rail">
        <div className="home-main-col">
          <section className="features-section">
            <div className="feature-card">
              <h2>Join our thrilling tournaments and league games</h2>
              <p>
                At Leather Pocket, we believe that every shot tells a story.
                Whether you're a seasoned pro or a passionate newcomer, our
                tournaments and league games offer the perfect stage for your
                skills to shine.
              </p>
              <Link to="/leagues/registration" className="secondary-button">Learn more</Link>
            </div>

            <div className="feature-card">
              <h2>More than just a pool hall</h2>
              <p>
                Whether you're bringing the family for lunch, meeting friends for
                a fun night out, or hosting colleagues for some team building,
                come share in our passion for the sport. Enjoy our lively
                atmosphere, top of the line tables, high quality pool balls, and a jukebox to set the perfect mood for your game.
              </p>
              <Link to="/about/contact" className="secondary-button">About Us</Link>
            </div>
          </section>

          <section className="gallery-section">
            <h2>Photo Gallery</h2>
            {images.length > 0 ? (
              <div className="swiper-gallery">
                <Swiper {...swiperParams}>
                  {images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="gallery-slide"
                        onClick={() => handleSlideClick(index)}
                      >
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="gallery-slide__image"
                          draggable={false}
                        />
                        <div className="gallery-slide__overlay">
                          <span>🔍</span>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Pagination */}
                <div className="swiper-pagination"></div>
              </div>
            ) : (
              <div className="gallery-loading">Loading gallery...</div>
            )}
          </section>

          {/* Image Modal */}
          {isModalOpen && (
            <div className="image-modal" onClick={closeModal}>
              <div className="image-modal__content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal__close" onClick={closeModal}>×</button>
                <img
                  src={images[modalImageIndex]}
                  alt={`Gallery image ${modalImageIndex + 1}`}
                  className="image-modal__image"
                />
              </div>
            </div>
          )}

          <section className="cta-section">
            <h2>Ready to experience the best billiards in Calgary?</h2>
            <div className="cta-buttons">
              <Link to="/pricing" className="primary-button">View pricing</Link>
              <Link to="/about/contact" className="secondary-button">Contact us</Link>
            </div>
          </section>
        </div>

        <aside className="home-side-rail" ref={railRef}>
          {/* Announcements — always visible */}
          <div className="home-rail__section">
            <div className="home-rail__head">
              <h3>Announcements</h3>
              {announcements.length > 0 && (
                <span className="home-rail__count">{announcements.length}</span>
              )}
            </div>
            {announcements.length > 0 ? (
              <>
                <ul className="home-rail__list">
                  {announcements.slice(0, 3).map((a, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="home-rail__item home-rail__item--btn"
                        onClick={() => handleAnnouncementClick(a)}
                      >
                        <strong>{a.title}</strong>
                        <span className="home-rail__desc">{a.description}</span>
                        {a.expiry_date && (
                          <span className="home-rail__exp">Until {a.expiry_date}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <Link to="/events" className="home-rail__viewall">View all announcements →</Link>
              </>
            ) : (
              <p className="home-rail__empty">No active announcements.</p>
            )}
          </div>

          {/* Up Next */}
          <div className="home-rail__section">
            <div className="home-rail__head">
              <h3>Upcoming Events</h3>
            </div>
            {upcomingEvents.length > 0 ? (
              <>
                <ul className="home-rail__list">
                  {upcomingEvents.map((e, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className={`home-rail__item home-rail__item--btn home-rail__item--event home-rail__item--${e.event_type || 'other'}`}
                        onClick={() => handleEventClick(e)}
                      >
                        <strong>{e.title}</strong>
                        <span className="home-rail__desc">
                          {e.event_date}{e.start_time ? ` · ${formatTime(e.start_time)}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Link to="/events" className="home-rail__viewall">View calendar →</Link>
              </>
            ) : (
              <p className="home-rail__empty">No upcoming events.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Event detail modal */}
      <EventDetailModal
        event={eventDetailModal.event}
        isOpen={eventDetailModal.isOpen}
        onClose={() => setEventDetailModal({ isOpen: false, event: null })}
        showBackButton={false}
      />

      {/* Announcement detail modal */}
      {announcementModal.isOpen && announcementModal.announcement && (
        <div className="events-modal-overlay" onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}>
          <div
            className="event-detail-modal-redesign"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="events-modal-header">
              <div className="modal-header-content">
                <h3 className="event-detail-title">{announcementModal.announcement.title}</h3>
              </div>
              <button
                className="modal-close-button"
                onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="event-detail-content-redesign">
              <div className="event-description-section">
                <h4>Description</h4>
                <div className="description-content">
                  {linkifyText(announcementModal.announcement.description || announcementModal.announcement.title || 'No description available')}
                </div>
              </div>

              {announcementModal.announcement.expiry_date && (
                <div className="event-date-section">
                  <h4>Valid Until</h4>
                  <div className="date-time-content">
                    <div className="date-info">
                      {new Date(announcementModal.announcement.expiry_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
