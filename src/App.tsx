import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserProvider, useAuth } from './context/useAuth';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { SearchProvider } from './context/SearchContext';
import { BookingProvider } from './context/BookingContext';
import FloatingChatWidget from './components/FloatingChatWidget/FloatingChatWidget';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '~/App.css';

const AppContent = () => {
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  
  const isAnyDashboardPage = 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/owner');

  const showNavbar = !(location.pathname === '/login' || isAnyDashboardPage);

  return (
    <>
      {showNavbar && <Navbar/>}
      <Outlet/>
      
      
      {!isAnyDashboardPage && (
        <FloatingChatWidget key={user?.userName || 'guest'} />
      )}
      
      {!isAnyDashboardPage && <Footer/>}
    </>
  );
};

function App() {
  const GOOGLE_CLIENT_ID = "499711778033-gt8i1tg39cdmhil3r0721jhn2fjnjpfs.apps.googleusercontent.com";

  return (
    <UserProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <SearchProvider>
          <BookingProvider>
            <AppContent />
          </BookingProvider>
        </SearchProvider>
        <ToastContainer position="bottom-right" autoClose={3000} theme="light"/>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}

export default App;