import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './components/common/NavBar';
import FAQPage from './components/faq/FAQPage';
import Events from './components/events/Events';
import Menu from './components/menu/Menu';
import Pricing from './components/pricing/Pricing';
import Leagues from './components/leagues/Leagues';
import Contact from './components/contact/Contact';
import Home from './components/home/Home';
import AdminPanel from './components/admin/AdminPanel';
import TeamFinder from './components/leagues/TeamFinder';
import LeagueRegistration from './components/leagues/LeagueRegistration';
import Footer from './components/common/Footer';
import Shop from './components/shop/Shop';
import PasswordReset from './components/shared/PasswordReset';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={
            <>
              <NavBar />
              <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/home" element={<Home/>} />
                <Route path="/events" element={<Events />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/shop" element={<Shop />} />  
                <Route path="/leagues" element={<Leagues />} />
                <Route path="/about/faq" element={<FAQPage />} />
                <Route path="/about/contact" element={<Contact/>} />
                <Route path="/leagues/registration" element={<LeagueRegistration />} />
                <Route path="/leagues/team-finder" element={<TeamFinder />} />
                <Route path="/reset-password" element={<PasswordReset />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;