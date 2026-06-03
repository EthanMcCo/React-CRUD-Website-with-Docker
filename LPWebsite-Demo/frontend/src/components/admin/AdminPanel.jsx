import React, { useState } from 'react';
import './AdminPanel.css';
import AdminAuth from './AdminAuth';
import FAQManagement from './faqManagement/FAQManagement';
import LeagueManagement from './leagueManagement/LeagueManagement';
import PricingManagement from './pricingManagement/PricingManagement';
import MenuManagement from './menuManagement/MenuManagement';
import EventsManagement from './eventsManagement/EventsManagement';
import ShopManagement from './shopManagement/ShopManagement';
import ContactManagement from './contactManagement/ContactManagement';
import HomeManagement from './homeManagement/HomeManagement';

const AdminPanel = () => {
  const [selectedComponent, setSelectedComponent] = useState('FAQ Management');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch(selectedComponent) {
      case 'FAQ Management':
        return <FAQManagement />;
      
      case 'League Management':
        return <LeagueManagement />;
      
      case 'Shop Management':
        return <ShopManagement />;  

      case 'Pricing Management': 
        return <PricingManagement />;
      
      case 'Menu Management':
        return <MenuManagement />;

      case 'Events Management': 
        return <EventsManagement />;
        
      case 'Contact Information':
        return <ContactManagement />;
        
      case 'Home Management':
        return <HomeManagement />;
        
      default:
        return <div className="content-section">Select a management option</div>;
    }
  };

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <h1>Admin Control Panel</h1>
        <nav>
          <button 
            className={selectedComponent === 'FAQ Management' ? 'active' : ''}
            onClick={() => setSelectedComponent('FAQ Management')}
          >
            FAQ Management
          </button>
          <button 
            className={selectedComponent === 'League Management' ? 'active' : ''}
            onClick={() => setSelectedComponent('League Management')}
          >
            League Management
          </button>
          <button 
            className={selectedComponent === 'Shop Management' ? 'active' : ''}
            onClick={() => setSelectedComponent('Shop Management')}
          >
            Shop Management
          </button>
          <button
            className={selectedComponent === 'Menu Management' ? 'active' : ''} 
            onClick={() => setSelectedComponent('Menu Management')}
          >
            Menu Management
          </button>
          <button
            className={selectedComponent === 'Events Management' ? 'active' : ''} 
            onClick={() => setSelectedComponent('Events Management')}
          >
            Events Management
          </button>
          <button 
            className={selectedComponent === 'Contact Information' ? 'active' : ''}
            onClick={() => setSelectedComponent('Contact Information')}
          >
            Contact Information
          </button>
          <button 
            className={selectedComponent === 'Pricing Management' ? 'active' : ''}
            onClick={() => setSelectedComponent('Pricing Management')}
          >
            Pricing Management
          </button>
          <button 
            className={selectedComponent === 'Home Management' ? 'active' : ''}
            onClick={() => setSelectedComponent('Home Management')}
          >
            Home Management
          </button>
        </nav>
      </div>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;