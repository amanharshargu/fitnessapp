import React, { useState, useRef, useEffect } from "react";
import { useIngredientForm } from "../../hooks/useIngredientForm";
import "../../styles/AddIngredientForm.css";

function AddIngredientForm({ editingIngredient, onCancel }) {
  const { ingredient, handleInputChange, handleSubmit } = useIngredientForm(editingIngredient);
  const [error, setError] = useState(null);
  const dateInputRef = useRef(null);
  const [minDate, setMinDate] = useState("");
  const [unitSuggestions, setUnitSuggestions] = useState([]);

  const allUnits = [
    "count", "pieces", "mg", "g", "kg", "ounces", "pounds",
    "ml", "l", "cups", "tablespoons", "teaspoons"
  ];

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split("T")[0]);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const success = await handleSubmit(e);
    if (success) {
      onCancel();
    } else {
      setError("Failed to add ingredient. Please try again.");
    }
  };

  const handleDateClick = () => {
    dateInputRef.current.showPicker();
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
          value={ingredient.quantity === 0 ? "" : ingredient.quantity}
          onChange={handleInputChange}
          required
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
          type="date"
          className="form-control"
          name="expirationDate"
          value={ingredient.expirationDate}
          onChange={handleInputChange}
          onClick={handleDateClick}
          required
          placeholder="Expiration date"
          min={minDate}
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
