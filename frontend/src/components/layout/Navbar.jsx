import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUtensils, FaBook, FaHeart, FaCalendarAlt } from "react-icons/fa";
import "../../styles/Navbar.css";

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: FaHome, color: "#4CAF50" },
    { path: "/fridge", name: "Fridge", icon: FaUtensils, color: "#2196F3" },
    { path: "/recipes", name: "Recipes", icon: FaBook, color: "#FF9800" },
    { path: "/liked-recipes", name: "Liked Recipes", icon: FaHeart, color: "#E91E63" },
    { path: "/meal-planner", name: "Meal Planner", icon: FaCalendarAlt, color: "#9C27B0" },
  ];

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              style={{ "--nav-color": item.color }}
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
