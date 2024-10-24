import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUtensils, FaBook, FaCalendarAlt, FaCaretDown, FaSearch, FaThumbsUp, FaMagic } from "react-icons/fa";
import "../../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: FaHome, color: "#4CAF50" },
    { path: "/fridge", name: "Fridge", icon: FaUtensils, color: "#2196F3" },
    { 
      name: "Recipes", 
      icon: FaBook, 
      color: "#FF9800",
      dropdown: [
        { path: "/recipes", name: "Recipe Search", icon: FaSearch },
        { path: "/liked-recipes", name: "Liked Recipes", icon: FaThumbsUp },
        { path: "/suggested-recipes", name: "Suggested Recipes", icon: FaMagic },
      ]
    },
    { path: "/meal-planner", name: "Meal Planner", icon: FaCalendarAlt, color: "#9C27B0" },
  ];

  const handleDropdownClick = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        {navItems.map((item) => (
          <li 
            key={item.name} 
            className={`nav-item ${item.dropdown ? 'has-dropdown' : ''}`}
          >
            {item.dropdown ? (
              <>
                <div 
                  className={`nav-link ${location.pathname.startsWith('/recipes') || location.pathname === '/liked-recipes' || location.pathname === '/suggested-recipes' ? "active" : ""}`}
                  style={{ "--nav-color": item.color }}
                  onClick={() => handleDropdownClick(item.name)}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.name}</span>
                  <FaCaretDown className={`dropdown-icon ${openDropdown === item.name ? 'open' : ''}`} />
                </div>
                <ul className={`dropdown-menu ${openDropdown === item.name ? 'show' : ''}`}>
                  {item.dropdown.map((dropdownItem) => (
                    <li key={dropdownItem.path}>
                      <Link
                        to={dropdownItem.path}
                        className={`dropdown-item ${location.pathname === dropdownItem.path ? "active" : ""}`}
                        style={{ "--nav-color": item.color }}
                      >
                        <dropdownItem.icon className="dropdown-icon" />
                        {dropdownItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                style={{ "--nav-color": item.color }}
              >
                <item.icon className="nav-icon" />
                <span>{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
