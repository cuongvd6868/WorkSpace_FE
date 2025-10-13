import React from 'react';
import logo from './logo.svg';
import '~/App.css';
import { Outlet, useLocation } from 'react-router-dom';
import { UserProvider } from './context/useAuth';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { ToastContainer } from 'react-toastify';

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <UserProvider>
      {showNavbar && <Navbar/>}
      <Outlet/>
      <Footer/>
      <ToastContainer />
    </UserProvider>
  );
}

export default App;
