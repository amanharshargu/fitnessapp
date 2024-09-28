import React from "react";
import { useExpiringIngredients } from "../../hooks/useIngredientForm";
import { useIngredients } from "../../contexts/IngredientContext";
import "../../styles/ExpiringIngredients.css";

function ExpiringIngredients({ ingredients }) {
  const { expiringIngredients, formatExpirationDate } = useExpiringIngredients(ingredients);
  const { deleteIngredient } = useIngredients();

  const handleDelete = (id) => {
    deleteIngredient(id);
  };

  return (
    <div className="expiring-ingredients">
      <h3>Expiring Soon...</h3>
      {expiringIngredients.length > 0 ? (
        <ul className="expiring-list list-unstyled">
          {expiringIngredients.map((ingredient) => (
            <li key={ingredient.id} className="expiring-item">
              <div className="ingredient-details">
                <span className="ingredient-name">{ingredient.name}</span>
                <small className="ingredient-quantity">
                  {ingredient.quantity} {ingredient.unit}
                </small>
              </div>
              <div className="expiration-info">
                <span className="expiration-badge">
                  {formatExpirationDate(ingredient.expirationDate)}
                </span>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(ingredient.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No ingredients expiring within the next 7 days.</p>
      )}
    </div>
  );
}

export default ExpiringIngredients;
