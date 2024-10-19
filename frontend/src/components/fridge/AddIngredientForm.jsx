import React, { useState, useRef, useEffect } from "react";
import { useIngredientForm } from "../../hooks/useIngredientForm";
import "../../styles/AddIngredientForm.css";

function AddIngredientForm({ editingIngredient, onCancel }) {
  const { ingredient, handleInputChange: originalHandleInputChange, handleSubmit } = useIngredientForm(editingIngredient);
  const [error, setError] = useState(null);
  const dateInputRef = useRef(null);
  const [minDate, setMinDate] = useState("");
  const [unitSuggestions, setUnitSuggestions] = useState([]);
  const [dateInputType, setDateInputType] = useState("text");

  const allUnits = [
    "count", "pieces", "mg", "g", "kg", "ounces", "pounds",
    "ml", "l", "cups", "tablespoons", "teaspoons"
  ];

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split("T")[0]);
  }, []);

  const validateQuantity = (value) => {
    const regex = /^\d*\.?\d*$/;
    return regex.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      // Allow decimal inputs
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        originalHandleInputChange(e);
      }
    } else {
      originalHandleInputChange(e);
    }
  };

  const handleQuantityStep = (step) => {
    const currentValue = parseFloat(ingredient.quantity) || 0;
    const newValue = Math.max(0, currentValue + step).toFixed(2);
    originalHandleInputChange({ target: { name: "quantity", value: newValue } });
  };

  const validateForm = () => {
    if (!ingredient.name.trim()) {
      setError("Ingredient name is required.");
      return false;
    }
    if (ingredient.quantity === "" || isNaN(ingredient.quantity) || parseFloat(ingredient.quantity) <= 0) {
      setError("Quantity must be a positive number.");
      return false;
    }
    if (!ingredient.unit.trim()) {
      setError("Unit is required.");
      return false;
    }
    if (!ingredient.expirationDate) {
      setError("Expiration date is required.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    const trimmedIngredient = {
      ...ingredient,
      name: ingredient.name.trim(),
      unit: ingredient.unit.trim(),
    };

    const success = await handleSubmit(e, trimmedIngredient);
    if (success) {
      onCancel();
    } else {
      setError("Failed to add ingredient. Please try again.");
    }
  };

  const handleDateClick = () => {
    if (dateInputType === "text") {
      setDateInputType("date");
    }
    setTimeout(() => {
      dateInputRef.current.showPicker();
    }, 0);
  };

  const handleUnitChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    if (value) {
      const suggestions = allUnits.filter(unit => 
        unit.toLowerCase().includes(value.toLowerCase())
      );
      setUnitSuggestions(suggestions);
    } else {
      setUnitSuggestions([]);
    }
  };

  const selectSuggestion = (unit) => {
    handleInputChange({ target: { name: "unit", value: unit } });
    setUnitSuggestions([]);
  };

  const handleDateFocus = () => {
    setDateInputType("date");
  };

  const handleDateBlur = (e) => {
    if (!e.target.value) {
      setDateInputType("text");
    }
  };

  const handleQuantityKeyDown = (e) => {
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleQuantityChange = (e) => {
    let value = e.target.value;
    // Allow decimal points and numbers
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      originalHandleInputChange({ target: { name: 'quantity', value } });
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 add-ingredient-form">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Ingredient name"
          name="name"
          value={ingredient.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Quantity"
          name="quantity"
          value={ingredient.quantity}
          onChange={handleQuantityChange}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              handleQuantityStep(1);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              handleQuantityStep(-1);
            }
          }}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div className="mb-3 unit-input-container">
        <input
          type="text"
          className="form-control"
          placeholder="Unit"
          name="unit"
          value={ingredient.unit}
          onChange={handleUnitChange}
          required
          autoComplete="off"
        />
        {unitSuggestions.length > 0 && (
          <ul className="unit-suggestions">
            {unitSuggestions.map((unit, index) => (
              <li key={index} onClick={() => selectSuggestion(unit)}>
                {unit}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-3">
        <input
          ref={dateInputRef}
          type={dateInputType}
          className="form-control"
          name="expirationDate"
          value={ingredient.expirationDate}
          onChange={handleInputChange}
          onClick={handleDateClick}
          onFocus={handleDateFocus}
          onBlur={handleDateBlur}
          required
          min={minDate}
          placeholder="Expiry date"
        />
      </div>
      <button type="submit" className="btn btn-success me-2">
        {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
      </button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default AddIngredientForm;
