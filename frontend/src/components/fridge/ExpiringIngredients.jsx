import React, { useMemo } from "react";
import { useExpiringIngredients, aggregateIngredients, convertToBaseUnit, formatQuantity } from "../../hooks/useIngredientForm";
import { useIngredients } from "../../contexts/IngredientContext";
import "../../styles/ExpiringIngredients.css";

function ExpiringIngredients({ ingredients }) {
  const { expiringIngredients, formatExpirationDate } = useExpiringIngredients(ingredients);
  const { deleteIngredient } = useIngredients();

  const aggregatedIngredients = useMemo(() => {
    return aggregateIngredients(expiringIngredients, {
      quantityConverter: convertToBaseUnit,
      unitNormalizer: (unit) => 
        unit.startsWith('m') || unit === 'l' ? 'ml' : 
        (unit === 'kg' || unit === 'g' ? 'g' : unit),
      sorter: (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
    });
  }, [expiringIngredients]);

  const handleDelete = (id) => {
    deleteIngredient(id);
  };

  return (
    <div className="expiring-ingredients">
      <h3>Expiring Soon...</h3>
      {Object.values(aggregatedIngredients).length > 0 ? (
        <ul className="expiring-list list-unstyled">
          {Object.values(aggregatedIngredients).map((group) => (
            <li key={group.name} className="expiring-group">
              <div className="ingredient-name">{group.name}</div>
              <ul className="expiring-items">
                {group.items.map((item) => (
                  <li key={item.id} className="expiring-item">
                    <div className="ingredient-details">
                      <span className="ingredient-quantity">
                        {formatQuantity(item.quantity, item.unit)}
                      </span>
                    </div>
                    <div className="expiration-info">
                      <span className="expiration-badge">
                        {formatExpirationDate(item.expirationDate)}
                      </span>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
