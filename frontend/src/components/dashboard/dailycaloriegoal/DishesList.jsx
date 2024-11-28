import React from 'react';

export default function DishesList({ 
  dishes, 
  editingDish, 
  handleEditChange, 
  saveEdit, 
  setEditingDish,
  startEditing, 
  renderDeleteButton 
}) {
  return (
    <div className="dcg-dishes-list-container">
      <h4 style={{ color: '#ff7800', fontSize: '0.9rem', marginBottom: '5px' }}>Today's Dishes</h4>
      <ul className="dcg-dishes-list">
        {dishes.map((dish) => (
          <li key={dish.id}>
            <div className="dcg-dish-content" style={{ padding: '6px 8px' }}>
              {editingDish && editingDish.id === dish.id ? (
                <div className="dcg-editing-dish">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit();
                  }}>
                    <input
                      type="text"
                      name="dishName"
                      value={editingDish.dishName}
                      onChange={handleEditChange}
                      placeholder="Dish name"
                      className="dcg-edit-input dcg-edit-input--name"
                    />
                    <input
                      type="text"
                      name="calories"
                      value={editingDish.calories}
                      onChange={handleEditChange}
                      placeholder="Calories"
                      pattern="\d*"
                      className="dcg-edit-input dcg-edit-input--calories"
                    />
                    <div className="dcg-editing-dish-actions">
                      <button type="submit" className="dcg-edit-save-button">Save</button>
                      <button 
                        type="button" 
                        className="dcg-edit-cancel-button" 
                        onClick={() => setEditingDish(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="dcg-dish-info" style={{ fontSize: '0.8rem' }}>
                    <span>{dish.dishName}</span>
                    <span className="dcg-dish-calories" style={{ color: '#ff7800' }}> • {dish.calories} cal</span>
                  </div>
                  <div className="dcg-dish-actions">
                    <button onClick={() => startEditing(dish)} className="dcg-edit-button">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    {renderDeleteButton(dish.id)}
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 