import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./layout/Header";
import Navbar from "./layout/Navbar";

function Layout({ children }) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="layout">
      <Header />
      {!isLandingPage && <Navbar />}
      <main>{children}</main>
    </div>
  );
}

export default Layout;