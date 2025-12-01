import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { HowItWorks } from './components/HowItWorks';
import { Comparison } from './components/Comparison';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsLoggedIn(true);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    window.scrollTo(0, 0);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar onLoginClick={handleLoginClick} />
      <main>
        <Hero onStartClick={handleLoginClick} />
        <Problem />
        <Solution />
        <HowItWorks />
        <Comparison />
        <CTA />
      </main>
      <Footer />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
