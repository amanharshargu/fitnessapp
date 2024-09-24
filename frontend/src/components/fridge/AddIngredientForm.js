import React, { useState } from "react";
import { useIngredientForm } from "../../hooks/useIngredientForm";
import "../../styles/AddIngredientForm.css";


function AddIngredientForm({ editingIngredient, onCancel }) {
  const { ingredient, handleInputChange, handleSubmit } = useIngredientForm(editingIngredient);
  const [error, setError] = useState(null);

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
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Unit"
          name="unit"
          value={ingredient.unit}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="date"
          className="form-control"
          name="expirationDate"
          value={ingredient.expirationDate}
          onChange={handleInputChange}
          required
          placeholder="Expiration date"
          onFocus={(e) => {
            e.target.type = 'date';
          }}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
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
