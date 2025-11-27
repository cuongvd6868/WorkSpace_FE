import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserProvider } from './context/useAuth';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { SearchProvider } from './context/SearchContext';
import { BookingProvider } from './context/BookingContext';
import FloatingChatWidget from './components/FloatingChatWidget/FloatingChatWidget';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '~/App.css'; 

function App() {
  const location = useLocation();
  const GOOGLE_CLIENT_ID = "499711778033-gt8i1tg39cdmhil3r0721jhn2fjnjpfs.apps.googleusercontent.com";
  
  const isAnyDashboardPage = 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/owner');

  const isHideNavbarPage = 
    location.pathname === '/login' ||
    location.pathname === '/owner' ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff');

  const showNavbar = !isHideNavbarPage;

  return (
    <UserProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SearchProvider>
        <BookingProvider>
          {showNavbar && <Navbar/>}
          <Outlet/>
          {!isAnyDashboardPage && <FloatingChatWidget />}
          {!isAnyDashboardPage && <Footer/>}
        </BookingProvider>
      </SearchProvider>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover draggable theme="light"/>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}

export default App;