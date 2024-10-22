import React from "react";
import { useIngredients } from "../../contexts/IngredientContext";
import { useExpiringIngredients, useIngredientList, formatQuantity } from "../../hooks/useIngredientForm";
import "../../styles/IngredientList.css";

function IngredientList() {
  const { ingredients, deleteIngredient } = useIngredients();
  const { formatExpirationDate } = useExpiringIngredients(ingredients);
  const { processedIngredients, toggleExpand } = useIngredientList(ingredients);

  const renderExpirationText = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    
    if (expDate < now) {
      return <span className="expired">Expired</span>;
    }
    
    return formatExpirationDate(expirationDate);
  };

  const handleItemClick = (e, name) => {
    // Prevent toggling when clicking on the delete button
    if (e.target.className !== "delete-button") {
      toggleExpand(name);
    }
  };

  return (
    <ul className="ingredient-list list-unstyled">
      {processedIngredients.map(({ name, items, totalQuantity, isExpanded }) => (
        <li key={name} className="ingredient-item" onClick={(e) => handleItemClick(e, name)}>
          <div className="ingredient-info">
            <span className="ingredient-name">
              {name} - {totalQuantity}
            </span>
            {items.length > 1 && (
              <span className="expand-indicator">
                {isExpanded ? '▲' : '▼'}
              </span>
            )}
            {items.length === 1 && (
              <button
                className="delete-button"
                onClick={() => deleteIngredient(items[0].id)}
              >
                Delete
              </button>
            )}
          </div>
          {items.length === 1 && (
            <small className="expiration-date">
              {renderExpirationText(items[0].expirationDate)}
            </small>
          )}
          {items.length > 1 && isExpanded && (
            <ul className="expiration-list">
              {items.map((item) => (
                <li key={item.id} className="expiration-item">
                  <small className="expiration-date">
                    {`${formatQuantity(item.quantity, item.unit)} - ${renderExpirationText(item.expirationDate)}`}
                  </small>
                  <button
                    className="delete-button"
                    onClick={() => deleteIngredient(item.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;
