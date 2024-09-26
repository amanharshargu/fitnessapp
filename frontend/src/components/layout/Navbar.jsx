import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/fridge" className={`nav-link ${location.pathname === "/fridge" ? "active" : ""}`}>
            <span>Fridge</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/recipes" className={`nav-link ${location.pathname === "/recipes" ? "active" : ""}`}>
            <span>Recipes</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/liked-recipes" className={`nav-link ${location.pathname === "/liked-recipes" ? "active" : ""}`}>
            <span>Liked Recipes</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
