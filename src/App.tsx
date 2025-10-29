import React from 'react';
import logo from './logo.svg';
import '~/App.css';
import { Outlet, useLocation } from 'react-router-dom';
import { UserProvider } from './context/useAuth';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { SearchProvider } from './context/SearchContext';

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <UserProvider>
      <SearchProvider>
      {showNavbar && <Navbar/>}
      <Outlet/>
      <Footer/>
      </SearchProvider>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover draggable theme="light"/>
    </UserProvider>
  );
}

export default App;
