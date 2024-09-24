import React from "react";
import { useIngredients } from "../../contexts/IngredientContext";
import { useExpiringIngredients } from "../../hooks/useIngredientForm";

function IngredientList() {
  const { ingredients, deleteIngredient } = useIngredients();
  const { formatExpirationDate } = useExpiringIngredients(ingredients);

  return (
    <ul className="list-group">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="list-group-item d-flex justify-content-between align-items-center flex-column"
        >
          <div className="d-flex w-100 justify-content-between">
            <span>
              {ingredient.name} - {ingredient.quantity} {ingredient.unit}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteIngredient(ingredient.id)}
            >
              Delete
            </button>
          </div>
          <small className="text-muted w-100 text-start">
            {formatExpirationDate(ingredient.expirationDate)}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;
