import React, { useState } from "react";
import { useIngredients } from "../../contexts/IngredientContext";
import { useExpiringIngredients, useIngredientList, formatQuantity } from "../../hooks/useIngredientForm";
import "../../styles/IngredientList.css";

function IngredientList() {
  const { ingredients, deleteIngredient, loading } = useIngredients();
  const { formatExpirationDate } = useExpiringIngredients(ingredients);
  const { processedIngredients } = useIngredientList(ingredients);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteIngredient(id);
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const renderDeleteButton = (id) => (
    <>
      {deleteConfirm === id ? (
        <div className="delete-confirmation">
          {deletingId === id ? (
            <div className="delete-loading">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Deleting...</span>
            </div>
          ) : (
            <>
              <span>Are you sure?</span>
              <button
                className="confirm-button"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(id);
                }}
              >
                Yes
              </button>
              <button
                className="cancel-button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelDelete();
                }}
              >
                No
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(id);
          }}
        >
          <i className="fas fa-trash"></i>
        </button>
      )}
    </>
  );

  const renderExpirationText = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    
    if (expDate < now) {
      return <span className="expired">Expired</span>;
    }
    
    return formatExpirationDate(expirationDate);
  };

  const renderNutritionalInfo = (item) => {
    const servingText = item.servingSize && item.servingUnit 
      ? `per ${item.servingSize}${item.servingUnit}`
      : 'per serving';

    // Helper function to safely format numbers
    const formatNumber = (value) => {
      const num = Number(value);
      return isNaN(num) ? '0.0' : num.toFixed(1);
    };

    return (
      <div className="nutritional-info">
        <span className="nutritional-item">
          <i className="fas fa-fire"></i> {formatNumber(item.calories)} kcal
        </span>
        <span className="nutritional-item">
          <i className="fas fa-drumstick-bite"></i> {formatNumber(item.protein)}g protein
        </span>
        <span className="nutritional-item">
          <i className="fas fa-bread-slice"></i> {formatNumber(item.carbs)}g carbs
        </span>
        <span className="nutritional-item">
          <i className="fas fa-cheese"></i> {formatNumber(item.fat)}g fat
        </span>
        <small className="per-100g">({servingText})</small>
      </div>
    );
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
    <div className="ingredient-list-container">
      {loading ? (
        <div className="ingredient-list-loading">
          <div className="spinner">
            <span className="spinner-border" role="status" aria-hidden="true"></span>
            <span className="loading-text">Loading ingredients...</span>
          </div>
        </div>
      ) : ingredients.length > 0 ? (
        <ul className="ingredient-list list-unstyled">
          {processedIngredients.map(({ name, items }) => (
            <li key={name} className="ingredient-item">
              <div className="ingredient-info">
                <div className="ingredient-header">
                  <span className="ingredient-name">
                    {name} : {formatAggregatedQuantity(items)}
                  </span>
                </div>
                {renderNutritionalInfo(items[0])}
              </div>
              {items.length === 1 ? (
                <div className="ingredient-footer">
                  <div className="footer-content">
                    <div className="expiration-info">
                      {renderExpirationText(items[0].expirationDate)}
                    </div>
                    {renderDeleteButton(items[0].id)}
                  </div>
                </div>
              ) : (
                <ul className="expiration-list">
                  {items.map((item) => (
                    <li key={item.id} className="expiration-item">
                      <div className="expanded-item-info">
                        <div className="quantity-and-expiration">
                          <div className="expanded-item-details">
                            <span className="quantity">{formatQuantity(item.quantity, item.unit)}</span>
                            <span className="expiration-date">
                              {renderExpirationText(item.expirationDate)}
                            </span>
                          </div>
                          {renderDeleteButton(item.id)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-ingredients-message">No ingredients in your fridge. Add some ingredients to get started!</p>
      )}
    </div>
  );
}

export default IngredientList;
