import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUtensils, FaBook, FaHeart, FaCalendarAlt } from "react-icons/fa";
import "../../styles/Navbar.css";

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: FaHome },
    { path: "/fridge", name: "Fridge", icon: FaUtensils },
    { path: "/recipes", name: "Recipes", icon: FaBook },
    { path: "/liked-recipes", name: "Liked Recipes", icon: FaHeart },
    { path: "/meal-planner", name: "Meal Planner", icon: FaCalendarAlt },
  ];

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
