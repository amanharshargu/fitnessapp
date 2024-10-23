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
    if (e.target.className !== "delete-button") {
      toggleExpand(name);
    }
  };

  const formatAggregatedQuantity = (items) => {
    const quantities = {};
    items.forEach(item => {
      if (!quantities[item.unit]) {
        quantities[item.unit] = 0;
      }
      quantities[item.unit] += parseFloat(item.quantity);
    });

    return Object.entries(quantities)
      .map(([unit, quantity]) => `${formatQuantity(quantity, unit)}`)
      .join(", ");
  };

  return (
    <ul className="ingredient-list list-unstyled">
      {processedIngredients.map(({ name, items, isExpanded }) => (
        <li key={name} className="ingredient-item" onClick={(e) => handleItemClick(e, name)}>
          <div className="ingredient-info">
            <span className="ingredient-name">
              {name} - {formatAggregatedQuantity(items)}
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
                Remove
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
                    {`${formatQuantity(item.quantity, item.unit)} - `}
                    {renderExpirationText(item.expirationDate)}
                  </small>
                  <button
                    className="delete-button"
                    onClick={() => deleteIngredient(item.id)}
                  >
                    Remove
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
