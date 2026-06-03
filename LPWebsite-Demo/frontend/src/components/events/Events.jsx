import React, { useState, useEffect } from "react";
import "./Events.css";
import "./AllEventsModal.css";
import "../shared/SharedModals.css";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import EventDetailModal from "./EventDetailModal";
import { linkifyText } from '../shared/linkifyText';

const Events = () => {
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  
  const [eventDetailModal, setEventDetailModal] = useState({
    isOpen: false,
    event: null,
    showBackButton: false
  });

  const [announcementDetailModal, setAnnouncementDetailModal] = useState({
    isOpen: false,
    announcement: null
  });

  // All Events Modal state
  const [allEventsModal, setAllEventsModal] = useState({
    isOpen: false,
    searchTerm: '',
    selectedEventType: 'all',
    startDate: '',
    endDate: '',
    filteredEvents: [],
    filtersVisible: true
  });

  useEffect(() => {
    fetchAllEventsAndUpcoming();
  }, []);

  // FIXED: Timezone-safe date parsing function
  const createLocalDate = (dateString) => {
    try {
      if (!dateString) return null;
      
      // Clean the date string - remove time if present
      const cleanDateStr = dateString.split('T')[0];
      
      // Parse as local date to avoid timezone shifts
      const [year, month, day] = cleanDateStr.split('-').map(Number);
      
      // Create date in local timezone (months are 0-indexed in JS)
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  // FIXED: Better date formatting function that uses local dates
  const formatDateForDisplay = (dateString) => {
    try {
      const date = createLocalDate(dateString);
      
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date for formatting:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date Error';
    }
  };

  // UPDATED: Fetch both all events (for calendar) and upcoming events (for sidebar)
  const fetchAllEventsAndUpcoming = async () => {
    try {
      setLoading(true);
      
      // UPDATED: Fetch ALL events (past, present, future) for the calendar
      // Using a very wide date range to include historical events
      const pastDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year ago
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now
      
      const allEventsResponse = await fetch(`/api/events?startDate=${pastDate}&endDate=${futureDate}`);
      const allEventsData = await allEventsResponse.json();

      const announcementsResponse = await fetch('/api/announcements/public/upcoming');
      const announcementsData = await announcementsResponse.json();
      
      console.log('Announcements API response:', announcementsData);
      
      // UPDATED: Fetch only upcoming events for the sidebar
      const upcomingResponse = await fetch('/api/events/upcoming');
      const upcomingData = await upcomingResponse.json();
      
      if (allEventsData.success && upcomingData.success && announcementsData.success) {
        // Process ALL events for calendar
        const formattedAllEvents = allEventsData.events.map(event => {
          let eventDate = event.event_date;
          if (eventDate && typeof eventDate === 'string') {
            eventDate = eventDate.split('T')[0];
          }
          
          return {
            title: event.title || 'Untitled Event',
            date: eventDate,
            event_date: eventDate,
            description: event.description || '',
            start_time: event.start_time || '',
            end_time: event.end_time || '',
            tables_used: event.tables_used || '',
            is_recurring: Boolean(event.is_recurring),
            event_id: event.event_id || `generated-${Math.random()}`,
            // FIXED: Include image_path in event data
            image_path: event.image_path || null,
            // FIXED: Include event_type in event data
            event_type: event.event_type || 'other'
          };
        });

        // Process upcoming events for sidebar
        const formattedUpcomingEvents = upcomingData.events.map(event => {
          let eventDate = event.event_date;
          if (eventDate && typeof eventDate === 'string') {
            eventDate = eventDate.split('T')[0];
          }
          
          return {
            title: event.title || 'Untitled Event',
            date: eventDate,
            event_date: eventDate,
            description: event.description || '',
            start_time: event.start_time || '',
            end_time: event.end_time || '',
            tables_used: event.tables_used || '',
            is_recurring: Boolean(event.is_recurring),
            event_id: event.event_id || `generated-${Math.random()}`,
            // FIXED: Include image_path in event data
            image_path: event.image_path || null,
            // FIXED: Include event_type in event data
            event_type: event.event_type || 'other'
          };
        });
        
        // Filter out events with invalid dates
        const validAllEvents = formattedAllEvents.filter(event => {
          if (!event.date) return false;
          const testDate = createLocalDate(event.date);
          return testDate && !isNaN(testDate.getTime());
        });

        const validUpcomingEvents = formattedUpcomingEvents.filter(event => {
          if (!event.date) return false;
          const testDate = createLocalDate(event.date);
          return testDate && !isNaN(testDate.getTime());
        });
        
        console.log('All events loaded:', validAllEvents.length);
        console.log('Upcoming events loaded:', validUpcomingEvents.length);
        
        setEvents(validAllEvents);
        setUpcomingEvents(validUpcomingEvents);
        setAnnouncements(announcementsData.announcements);
        
        console.log('Set announcements:', announcementsData.announcements);
      } else {
        throw new Error(allEventsData.error || upcomingData.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      // Fallback data with images
      const fallbackAllEvents = [
        { 
          title: "Pool Party", 
          date: "2024-11-17", 
          event_date: "2024-11-17",
          event_id: 'mock1',
          description: 'Fun pool party event',
          start_time: '19:00',
          end_time: '22:00',
          image_path: null
        },
        { 
          title: "Tournament", 
          date: "2024-11-21", 
          event_date: "2024-11-21",
          event_id: 'mock2',
          description: 'Weekly tournament',
          start_time: '18:00',
          end_time: '21:00',
          image_path: null
        }
      ];
      
      // Only use fallback announcements if the API call actually failed
      console.warn('Using fallback announcements due to API failure');
      setAnnouncements([]);

      const today = new Date().toISOString().split('T')[0];
      const fallbackUpcomingEvents = fallbackAllEvents.filter(event => event.date >= today);
      
      setEvents(fallbackAllEvents);
      setUpcomingEvents(fallbackUpcomingEvents);
    } finally {
      setLoading(false);
    }
  };

  // Open modal with appropriate content (keeping your original logic for announcements)
  const openModal = (contentType) => {
    if (contentType === "events") {
      openAllEventsModal();
    } else {
      // Store the actual announcement objects instead of just strings
      setModalContent(announcements);
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => setIsModalOpen(false);


  // FIXED: Get events for selected date using timezone-safe comparison
  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      try {
        const eventDate = createLocalDate(event.date);
        return eventDate && eventDate.toDateString() === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  // Handle calendar date click - only update selected date (no modal)
  const handleDateClick = (clickedDate) => {
    setDate(clickedDate);
  };


  // Handle event click from sidebar
  const handleSidebarEventClick = (event) => {
    setEventDetailModal({
      isOpen: true,
      event: event,
      showBackButton: false
    });
  };

  // Handle announcement click
  const handleAnnouncementClick = (announcement) => {
    setAnnouncementDetailModal({
      isOpen: true,
      announcement: announcement
    });
  };

  // Open All Events Modal with filtering
  const openAllEventsModal = () => {
    // Get events for the next year for the modal
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    const upcomingEvents = events.filter(event => {
      const eventDate = createLocalDate(event.date);
      return eventDate && eventDate >= today && eventDate <= nextYear;
    });

    // Check if mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    setAllEventsModal({
      isOpen: true,
      searchTerm: '',
      selectedEventType: 'all',
      startDate: today.toISOString().split('T')[0],
      endDate: nextYear.toISOString().split('T')[0],
      filteredEvents: upcomingEvents,
      filtersVisible: !isMobile // Hide filters by default on mobile
    });
  };

  // Close All Events Modal
  const closeAllEventsModal = () => {
    setAllEventsModal({
      isOpen: false,
      searchTerm: '',
      selectedEventType: 'all',
      startDate: '',
      endDate: '',
      filteredEvents: [],
      filtersVisible: true
    });
  };

  // Toggle filter visibility on mobile
  const toggleFiltersVisibility = () => {
    setAllEventsModal(prev => ({
      ...prev,
      filtersVisible: !prev.filtersVisible
    }));
  };

  // Filter events based on search and filters
  const applyEventFilters = (searchTerm, eventType, startDate, endDate) => {
    let filtered = events;

    // Filter by date range
    if (startDate && endDate) {
      const start = createLocalDate(startDate);
      const end = createLocalDate(endDate);
      filtered = filtered.filter(event => {
        const eventDate = createLocalDate(event.date);
        return eventDate && eventDate >= start && eventDate <= end;
      });
    }

    // Filter by event type
    if (eventType !== 'all') {
      filtered = filtered.filter(event => 
        getEventType(event) === eventType
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search) ||
        (event.description && event.description.toLowerCase().includes(search)) ||
        (event.tables_used && event.tables_used.toLowerCase().includes(search))
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = createLocalDate(a.date);
      const dateB = createLocalDate(b.date);
      return dateA - dateB;
    });

    setAllEventsModal(prev => ({
      ...prev,
      filteredEvents: filtered
    }));
  };

  // Handle filter changes
  const handleSearchChange = (searchTerm) => {
    setAllEventsModal(prev => ({ ...prev, searchTerm }));
    applyEventFilters(searchTerm, allEventsModal.selectedEventType, allEventsModal.startDate, allEventsModal.endDate);
  };

  const handleEventTypeChange = (eventType) => {
    setAllEventsModal(prev => ({ ...prev, selectedEventType: eventType }));
    applyEventFilters(allEventsModal.searchTerm, eventType, allEventsModal.startDate, allEventsModal.endDate);
  };

  const handleDateRangeChange = (startDate, endDate) => {
    setAllEventsModal(prev => ({ ...prev, startDate, endDate }));
    applyEventFilters(allEventsModal.searchTerm, allEventsModal.selectedEventType, startDate, endDate);
  };


  // Close event detail modal
  const closeEventDetailModal = () => {
    setEventDetailModal({
      isOpen: false,
      event: null,
      showBackButton: false
    });
  };

  // Close announcement detail modal
  const closeAnnouncementDetailModal = () => {
    setAnnouncementDetailModal({
      isOpen: false,
      announcement: null
    });
  };

  // Handle back from detail to list
  const handleBackToList = () => {
    setEventDetailModal({
      isOpen: false,
      event: null,
      showBackButton: false
    });
  };

  // Custom tile content for calendar - now shows multiple dots with event type colors
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateEvents = getEventsForDate(date);
      if (dateEvents.length > 0) {
        return (
          <div className="event-dots-container">
            {dateEvents.slice(0, 3).map((event, index) => (
              <div key={index} className={`event-dot event-type-${getEventType(event)}`}></div>
            ))}
            {dateEvents.length > 3 && (
              <div className="event-dot-more">+{dateEvents.length - 3}</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Get event type from database field only
  const getEventType = (event) => {
    // Use the actual event_type field from database
    return event.event_type || 'other';
  };

  // Display selected date events
  const selectedDateEvents = getEventsForDate(date);

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-container">
          <header className="events-header">
            <h1>Stay in the loop</h1>
            <p>Loading events...</p>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-container">
        <header className="events-header">
          <h1>Stay in the loop</h1>
          <p>
            From weekly tournaments to special events, there's always something
            happening at Leather Pocket. Check out our calendar to see what's coming
            up next.
          </p>
        </header>

        <div className="events-content">
          <div className="calendar-section">
            {/* Event type legend */}
            <div className="event-legend">
              <div className="legend-item">
                <div className="legend-dot league"></div>
                <span>League Events</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot tournament"></div>
                <span>Tournaments</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot other"></div>
                <span>Other Events</span>
              </div>
            </div>
            
            <Calendar 
              onChange={handleDateClick}
              value={date} 
              tileContent={tileContent}
              className="react-calendar" 
            />
            <div className="selected-date">
              <h3>Selected Date: {date.toDateString()}</h3>
              {selectedDateEvents.length > 0 ? (
                <div className="date-events">
                  <h4>Events on this date:</h4>
                  {/* FIXED: Compact horizontal list */}
                  <div className="events-compact-list">
                    {selectedDateEvents.map((event, index) => (
                      <div key={event.event_id || index} className="event-compact-item">
                        <button 
                          className={`event-link-button event-type-${getEventType(event)}`}
                          onClick={() => handleSidebarEventClick(event)}
                        >
                          <div className="event-compact-content">
                            <div className="event-title-row">
                              <strong className="event-compact-title">{event.title}</strong>
                              {event.is_recurring && (
                                <span className="event-compact-badge">🔄</span>
                              )}
                            </div>
                            {event.start_time && event.end_time && (
                              <span className="event-compact-time">
                                {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No events scheduled for this date.</p>
              )}
            </div>
          </div>

          <aside className="upcoming-events">
            <h3>Upcoming Events</h3>
            {/* FIXED: Compact horizontal list */}
            <div className="events-compact-list">
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <div key={event.event_id || index} className="event-compact-item">
                  <button 
                    className={`event-link-button event-type-${getEventType(event)}`}
                    onClick={() => handleSidebarEventClick(event)}
                  >
                    <div className="event-compact-content">
                      <div className="event-title-row">
                        <strong className="event-compact-title">{event.title}</strong>
                        {event.is_recurring && (
                          <span className="event-compact-badge">🔄</span>
                        )}
                      </div>
                      <span className="event-compact-date">{formatDateForDisplay(event.date)}</span>
                      {event.start_time && event.end_time && (
                        <span className="event-compact-time">
                          {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <button
              className="view-all-button"
              onClick={() => openModal("events")}
            >
              View all events &gt;
            </button>
            
            <div className="announcements-section">
              <h3>Announcements</h3>
              {/* FIXED: Compact horizontal list */}
              <div className="events-compact-list">
                {announcements.slice(0, 3).map((announcement, index) => (
                  <div key={index} className="event-compact-item">
                    <button 
                      className="event-link-button announcement-button"
                      onClick={() => handleAnnouncementClick(announcement)}
                    >
                      <div className="event-compact-content">
                        <div className="event-title-row">
                          <strong className="event-compact-title">
                            {typeof announcement === 'string' 
                              ? announcement 
                              : announcement.title || 'Announcement'
                            }
                          </strong>
                        </div>
                        {announcement.expiry_date && (
                          <span className="event-compact-date">
                            Valid until {new Date(announcement.expiry_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="view-all-button"
                onClick={() => openModal("announcements")}
              >
                View all announcements &gt;
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Event Detail Modal (for sidebar event clicks) */}
      <EventDetailModal
        event={eventDetailModal.event}
        isOpen={eventDetailModal.isOpen}
        onClose={closeEventDetailModal}
        onBack={handleBackToList}
        showBackButton={eventDetailModal.showBackButton}
      />

      {/* Original Modal for Announcements */}
      {isModalOpen && (
        <div className="events-modal-overlay" onClick={closeModal}>
          <div
            className="events-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>All Announcements</h3>
            <div className="events-compact-list">
              {modalContent.map((announcement, index) => (
                <div key={index} className="event-compact-item">
                  <button 
                    className="event-link-button announcement-button"
                    onClick={() => {
                      closeModal();
                      handleAnnouncementClick(announcement);
                    }}
                  >
                    <div className="event-compact-content">
                      <div className="event-title-row">
                        <strong className="event-compact-title">
                          {typeof announcement === 'string' 
                            ? announcement 
                            : announcement.title || 'Announcement'
                          }
                        </strong>
                      </div>
                      {announcement.expiry_date && (
                        <span className="event-compact-date">
                          Valid until {new Date(announcement.expiry_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {announcementDetailModal.isOpen && announcementDetailModal.announcement && (
        <div className="events-modal-overlay" onClick={closeAnnouncementDetailModal}>
          <div
            className="event-detail-modal-redesign"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="events-modal-header">
              <div className="modal-header-content">
                <h3 className="event-detail-title">
                  {typeof announcementDetailModal.announcement === 'string' 
                    ? 'Announcement' 
                    : announcementDetailModal.announcement.title || 'Announcement'
                  }
                </h3>
              </div>
              <button 
                className="modal-close-button"
                onClick={closeAnnouncementDetailModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="event-detail-content-redesign">
              {/* Description Section */}
              <div className="event-description-section">
                <h4>Description</h4>
                <div className="description-content">
                  {linkifyText(
                    typeof announcementDetailModal.announcement === 'string' 
                      ? announcementDetailModal.announcement 
                      : announcementDetailModal.announcement.description || announcementDetailModal.announcement.title || 'No description available'
                  )}
                </div>
              </div>

              {/* Expiry Date Section */}
              {announcementDetailModal.announcement.expiry_date && (
                <div className="event-date-section">
                  <h4>Valid Until</h4>
                  <div className="date-time-content">
                    <div className="date-info">
                      {new Date(announcementDetailModal.announcement.expiry_date).toLocaleDateString('en-US', { 
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

      {/* All Events Modal */}
      {allEventsModal.isOpen && (
        <div className="events-modal-overlay" onClick={closeAllEventsModal}>
          <div
            className="all-events-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="all-events-modal-header">
              <h3>All Events</h3>
              <div className="header-buttons">
                <button 
                  className="filter-toggle-button"
                  onClick={toggleFiltersVisibility}
                  aria-label={allEventsModal.filtersVisible ? "Hide filters" : "Show filters"}
                >
                  {allEventsModal.filtersVisible ? (
                    <>
                      <span className="filter-toggle-icon">▲</span>
                      <span className="filter-toggle-text">Hide Filters</span>
                    </>
                  ) : (
                    <>
                      <span className="filter-toggle-icon">▼</span>
                      <span className="filter-toggle-text">Show Filters</span>
                    </>
                  )}
                </button>
                <button 
                  className="modal-close-button"
                  onClick={closeAllEventsModal}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className={`all-events-filters ${allEventsModal.filtersVisible ? 'filters-visible' : 'filters-hidden'}`}>
              {/* Top Row: Event Type and Date Range */}
              <div className="filters-top-row">
                {/* Event Type Filter */}
                <div className="filter-group">
                  <label htmlFor="event-type-filter">Event Type:</label>
                  <select
                    id="event-type-filter"
                    value={allEventsModal.selectedEventType}
                    onChange={(e) => handleEventTypeChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Events</option>
                    <option value="league">League Events</option>
                    <option value="tournament">Tournaments</option>
                    <option value="other">Other Events</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="filter-group date-range-group">
                  <label>Date Range:</label>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={allEventsModal.startDate}
                      onChange={(e) => handleDateRangeChange(e.target.value, allEventsModal.endDate)}
                      className="date-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={allEventsModal.endDate}
                      onChange={(e) => handleDateRangeChange(allEventsModal.startDate, e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Search Bar */}
              <div className="filters-bottom-row">
                <div className="filter-group search-group">
                  <label htmlFor="event-search">Search Events:</label>
                  <input
                    id="event-search"
                    type="text"
                    placeholder="Search by title, description, or tables..."
                    value={allEventsModal.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="filter-results">
                Showing {allEventsModal.filteredEvents.length} event{allEventsModal.filteredEvents.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="all-events-list">
              {allEventsModal.filteredEvents.length > 0 ? (
                allEventsModal.filteredEvents.map((event, index) => (
                  <div key={event.event_id || index} className="all-events-item">
                    <button 
                      className={`all-events-button event-type-${getEventType(event)}`}
                      onClick={() => {
                        closeAllEventsModal();
                        handleSidebarEventClick(event);
                      }}
                    >
                      <div className="all-events-item-header">
                        <h4 className="all-events-title">{event.title}</h4>
                        <div className="all-events-badges">
                          {event.is_recurring && (
                            <span className="event-badge recurring-badge">🔄 Recurring</span>
                          )}
                          <span className={`event-badge type-badge type-${getEventType(event)}`}>
                            {getEventType(event) === 'league' ? 'League' : 
                             getEventType(event) === 'tournament' ? 'Tournament' : 'Other'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="all-events-details">
                        <div className="event-date-time">
                          <span className="event-date">📅 {formatDateForDisplay(event.date)}</span>
                          {event.start_time && event.end_time && (
                            <span className="event-time">
                              🕐 {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                        
                        {event.tables_used && (
                          <div className="event-tables">🎱 {event.tables_used}</div>
                        )}
                        
                        {event.description && (
                          <div className="event-description-preview">
                            {linkifyText(
                              event.description.length > 100 
                                ? `${event.description.substring(0, 100)}...` 
                                : event.description
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-events-found">
                  <p>No events found matching your criteria.</p>
                  <p>Try adjusting your search terms or date range.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;