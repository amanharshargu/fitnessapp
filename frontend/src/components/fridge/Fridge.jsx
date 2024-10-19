import React, { useState } from "react";
import IngredientList from "./IngredientList";
import ExpiringIngredients from "./ExpiringIngredients";
import AddIngredientForm from "./AddIngredientForm";
import { useIngredients } from "../../contexts/IngredientContext";
import ContentWrapper from "../layout/ContentWrapper";
import "../../styles/fridge.css";

function Fridge() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const { ingredients, deleteIngredient } = useIngredients();

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id) => {
    deleteIngredient(id);
  };

  return (
    <ContentWrapper>
      <div className="fridge-container">
        <div className="fridge-content">
          <div className="fridge-left">
            <div className="ingredients-header">
              <h3>Your Ingredients</h3>
              <button
                className="add-ingredient-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? "Cancel" : "+ Add Ingredient"}
              </button>
            </div>
            {showAddForm && (
              <AddIngredientForm
                editingIngredient={editingIngredient}
                onCancel={handleCancelForm}
              />
            )}
            <IngredientList
              ingredients={ingredients}
              onDeleteIngredient={handleDeleteIngredient}
              onEditIngredient={handleEditIngredient}
            />
          </div>
          <div className="fridge-right">
            <ExpiringIngredients ingredients={ingredients} />
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Fridge;
