import React from "react";
import { useExpiringIngredients } from "../../hooks/useIngredientForm";
import { useIngredients } from "../../contexts/IngredientContext";

function ExpiringIngredients({ ingredients }) {
  const { expiringIngredients, formatExpirationDate } = useExpiringIngredients(ingredients);
  const { deleteIngredient } = useIngredients();

  const handleDelete = (id) => {
    deleteIngredient(id);
  };

  return (
    <div>
      <h3>Expiring Soon...</h3>
      {expiringIngredients.length > 0 ? (
        <ul className="list-group">
          {expiringIngredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{ingredient.name}</span>
              <div>
                <span className="badge bg-warning text-dark me-2">
                  {formatExpirationDate(ingredient.expirationDate)}
                </span>
                <button
                  className="btn btn-danger btn-sm"
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
