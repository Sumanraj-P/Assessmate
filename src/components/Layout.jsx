import React from 'react';
import { Outlet } from 'react-router-dom';
import 'notyf/notyf.min.css'; // Import Notyf styles

const Layout = ({ children }) => {
  return (
    <div className="relative">
      {/* This is where the toast notifications will appear via Notyf */}
      {/* They are rendered via the DOM, not through React */}
      {children || <Outlet />}
    </div>
  );
};

export default Layout;
