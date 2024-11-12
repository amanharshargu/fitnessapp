import React, { useState, useRef, useEffect } from "react";
import { useIngredientForm } from "../../hooks/useIngredientForm";
import "../../styles/AddIngredientForm.css";

function AddIngredientForm({ editingIngredient, onCancel, onSuccess }) {
  const { ingredient, handleInputChange: originalHandleInputChange, handleSubmit } = useIngredientForm(editingIngredient);
  const [error, setError] = useState(null);
  const dateInputRef = useRef(null);
  const [minDate, setMinDate] = useState("");
  const [unitSuggestions, setUnitSuggestions] = useState([]);
  const [dateInputType, setDateInputType] = useState("text");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [allowSuggestions, setAllowSuggestions] = useState(true);

  const allUnits = [
    "count", "pieces", "mg", "g", "kg", "ounces", "pounds",
    "ml", "l", "cups", "tablespoons", "teaspoons"
  ];

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split("T")[0]);
  }, []);

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

    try {
      const trimmedIngredient = {
        ...ingredient,
        name: ingredient.name.trim(),
        unit: ingredient.unit.trim(),
      };

      const success = await handleSubmit(e, trimmedIngredient);
      if (success) {
        await onSuccess();
      } else {
        setError("Failed to add ingredient. Please try again.");
      }
    } catch (error) {
      console.error('Error in form submission:', error);
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

  const handleQuantityChange = (e) => {
    let value = e.target.value;
    // Allow decimal points and numbers
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      originalHandleInputChange({ target: { name: 'quantity', value } });
    }
  };

  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchIngredientSuggestions = async (query) => {
    if (!query.trim()) {
      setIngredientSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://api.edamam.com/auto-complete?app_id=${process.env.REACT_APP_EDAMAM_INGREDIENT_ID}&app_key=${process.env.REACT_APP_EDAMAM_INGREDIENT_KEY}&q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      const capitalizedData = data.map(item => capitalizeWords(item));
      setIngredientSuggestions(capitalizedData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setIngredientSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce the API calls
  useEffect(() => {
    if (!ingredient.name || !allowSuggestions) {
      setIngredientSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchIngredientSuggestions(ingredient.name);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ingredient.name, allowSuggestions]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    setAllowSuggestions(true);
    
    if (!value.trim()) {
      setIngredientSuggestions([]);
    }
  };

  const selectIngredientSuggestion = async (name) => {
    try {
      setIsLoadingSuggestions(true);
      setIngredientSuggestions([]); // Clear suggestions immediately
      setAllowSuggestions(false); // Disable suggestions after selection
      
      const capitalizedName = capitalizeWords(name);
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.REACT_APP_EDAMAM_INGREDIENT_ID}&app_key=${process.env.REACT_APP_EDAMAM_INGREDIENT_KEY}&ingr=${encodeURIComponent(name)}&nutrition-type=cooking`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nutritional data');
      }

      const data = await response.json();
      
      if (data.hints && data.hints.length > 0) {
        const firstResult = data.hints[0].food;
        
        const nutritionalData = {
          name: capitalizedName,
          calories: firstResult.nutrients.ENERC_KCAL || 0,
          protein: firstResult.nutrients.PROCNT || 0,
          carbs: firstResult.nutrients.CHOCDF || 0,
          fat: firstResult.nutrients.FAT || 0,
          servingSize: 100,
          servingUnit: 'g'
        };
        
        Object.entries(nutritionalData).forEach(([key, value]) => {
          handleInputChange({ target: { name: key, value } });
        });
      }
    } catch (error) {
      console.error('Error fetching nutritional data:', error);
      handleInputChange({ target: { name: "name", value: capitalizeWords(name) } });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Add click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ingredient-form__input-container')) {
        setIngredientSuggestions([]);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={onSubmit} className="ingredient-form">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="ingredient-form__input-container">
        <input
          type="text"
          className="ingredient-form__input"
          placeholder="Enter ingredient name (e.g., Tomatoes)"
          name="name"
          value={ingredient.name}
          onChange={handleNameChange}
          required
          autoComplete="off"
        />
        {isLoadingSuggestions && (
          <div className="ingredient-form__loading">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </div>
        )}
        {!isLoadingSuggestions && ingredientSuggestions.length > 0 && (
          <ul className="ingredient-form__suggestions">
            {ingredientSuggestions.map((name, index) => (
              <li key={index} onClick={() => selectIngredientSuggestion(name)} className="ingredient-form__suggestion-item">
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="ingredient-form__input-container">
        <input
          type="number"
          className="ingredient-form__input ingredient-form__input--number"
          placeholder="Enter quantity (e.g., 500)"
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
      <div className="ingredient-form__input-container">
        <input
          type="text"
          className="ingredient-form__input"
          placeholder="Enter unit (e.g., grams, pieces, ml)"
          name="unit"
          value={ingredient.unit}
          onChange={handleUnitChange}
          required
          autoComplete="off"
        />
        {unitSuggestions.length > 0 && (
          <ul className="ingredient-form__suggestions">
            {unitSuggestions.map((unit, index) => (
              <li key={index} onClick={() => selectSuggestion(unit)} className="ingredient-form__suggestion-item">
                {unit}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="ingredient-form__input-container">
        <input
          ref={dateInputRef}
          type={dateInputType}
          className="ingredient-form__input ingredient-form__input--date"
          name="expirationDate"
          value={ingredient.expirationDate}
          onChange={handleInputChange}
          onClick={handleDateClick}
          onFocus={handleDateFocus}
          onBlur={handleDateBlur}
          required
          min={minDate}
          placeholder="Select expiration date"
        />
      </div>
      <button type="submit" className="ingredient-form__button ingredient-form__button--submit">
        {editingIngredient ? "Update Ingredient" : "Add Ingredient"}
      </button>
      <button type="button" className="ingredient-form__button ingredient-form__button--cancel" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default AddIngredientForm;
