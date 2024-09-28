import React from "react";
import { useIngredients } from "../../contexts/IngredientContext";
import { useExpiringIngredients } from "../../hooks/useIngredientForm";
import "../../styles/IngredientList.css";

function IngredientList() {
  const { ingredients, deleteIngredient } = useIngredients();
  const { formatExpirationDate } = useExpiringIngredients(ingredients);

  return (
    <ul className="ingredient-list list-unstyled">
      {ingredients.map((ingredient) => (
        <li key={ingredient.id} className="ingredient-item">
          <div className="ingredient-info">
            <span className="ingredient-name">
              {ingredient.name} - {ingredient.quantity} {ingredient.unit}
            </span>
            <button
              className="delete-button"
              onClick={() => deleteIngredient(ingredient.id)}
            >
              Delete
            </button>
          </div>
          <small className="expiration-date">
            {formatExpirationDate(ingredient.expirationDate)}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;
