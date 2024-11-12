import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpiringIngredients, aggregateIngredients, convertToBaseUnit, formatQuantity } from "../../hooks/useIngredientForm";
import { useIngredients } from "../../contexts/IngredientContext";
import { useRecipes } from "../../contexts/RecipeContext";
import "../../styles/ExpiringIngredients.css";

function ExpiringIngredients({ ingredients }) {
  const { expiringIngredients, formatExpirationDate } = useExpiringIngredients(ingredients);
  const { deleteIngredient } = useIngredients();
  const { setSearchTerm } = useRecipes();
  const navigate = useNavigate();
  const [selectedIngredients, setSelectedIngredients] = useState({});

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

  const handleIngredientSelect = (ingredientName) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [ingredientName]: !prev[ingredientName]
    }));
  };

  const handleSearchRecipes = () => {
    const selectedIngredientNames = Object.keys(selectedIngredients).filter(name => selectedIngredients[name]);
    const searchTerms = selectedIngredientNames.join(" ");
    setSearchTerm(searchTerms);
    navigate("/recipes");
  };

  return (
    <div className="expiring-ingredients">
      <h3>Expiring Soon...</h3>
      {ingredients.length > 0 ? (
        Object.values(aggregatedIngredients).length > 0 ? (
          <>
            <ul className="expiring-list list-unstyled">
              {Object.values(aggregatedIngredients).map((group) => (
                <li key={group.name} className="expiring-group">
                  <div className="ingredient-name">
                    <input
                      type="checkbox"
                      id={`select-${group.name}`}
                      checked={!!selectedIngredients[group.name]}
                      onChange={() => handleIngredientSelect(group.name)}
                    />
                    <label htmlFor={`select-${group.name}`}>{group.name}</label>
                  </div>
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
                            className="expiring-delete-button"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <button 
              className="search-recipes-button" 
              onClick={handleSearchRecipes}
              disabled={Object.values(selectedIngredients).filter(Boolean).length === 0}
            >
              Search Recipes with Selected Ingredients
            </button>
          </>
        ) : (
          <p>No ingredients expiring within the next 7 days.</p>
        )
      ) : null}
    </div>
  );
}

export default ExpiringIngredients;
