import { useState, useEffect, useMemo } from "react";
import { useIngredients } from "../contexts/IngredientContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export function useIngredientForm(editingIngredient) {
  const [ingredient, setIngredient] = useState({
    name: "",
    quantity: 0,
    unit: "",
    expirationDate: "",
  });
  const { addIngredient, updateIngredient } = useIngredients();
  const { user } = useAuth();

  useEffect(() => {
    if (editingIngredient) {
      setIngredient(editingIngredient);
    }
  }, [editingIngredient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIngredient((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("User not authenticated");
      return false;
    }
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredient);
      } else {
        await addIngredient({
          ...ingredient,
          userId: user.id
        });
      }
      setIngredient({ name: "", quantity: 0, unit: "", expirationDate: "" });
      return true;
    } catch (error) {
      console.error("Error submitting ingredient:", error);
      return false;
    }
  };

  return { ingredient, handleInputChange, handleSubmit };
}

export function useExpiringIngredients(ingredients) {
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringIngredients = ingredients.filter((ingredient) => {
    const expirationDate = new Date(ingredient.expirationDate);
    return expirationDate <= sevenDaysFromNow && expirationDate >= today;
  });

  const formatExpirationDate = (expirationDate) => {
    const expDate = new Date(expirationDate);
    const timeDiff = expDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 1) {
      const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
      return `Expires in ${hoursDiff} hour${hoursDiff !== 1 ? "s" : ""}`;
    } else {
      return `Expires in ${daysDiff} day${daysDiff !== 1 ? "s" : ""}`;
    }
  };

  return { expiringIngredients, formatExpirationDate };
}

export function useIngredientList(ingredients) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (name) => {
    setExpandedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const isCountBasedUnit = (unit) => {
    return ['count', 'piece', 'pcs', ''].includes(unit.toLowerCase());
  };

  const convertToBaseUnit = (quantity, unit) => {
    if (isCountBasedUnit(unit)) return quantity;
    const conversionFactors = {
      ml: 1,
      l: 1000,
      g: 1,
      kg: 1000,
    };
    return quantity * (conversionFactors[unit.toLowerCase()] || 1);
  };

  const formatQuantity = (quantity, unit) => {
    if (isCountBasedUnit(unit)) return `${quantity} ${unit === '' ? 'count' : unit}`;
    if (unit.toLowerCase() === 'l' && quantity < 1) {
      return `${quantity * 1000} ml`;
    }
    if (unit.toLowerCase() === 'kg' && quantity < 1) {
      return `${quantity * 1000} g`;
    }
    return `${quantity} ${unit}`;
  };

  const groupedIngredients = useMemo(() => {
    return ingredients.reduce((acc, ingredient) => {
      if (!acc[ingredient.name]) {
        acc[ingredient.name] = [];
      }
      acc[ingredient.name].push(ingredient);
      return acc;
    }, {});
  }, [ingredients]);

  const processedIngredients = useMemo(() => {
    return Object.entries(groupedIngredients).map(([name, items]) => {
      const totalQuantity = items.reduce((sum, item) => sum + convertToBaseUnit(item.quantity, item.unit), 0);
      const baseUnit = isCountBasedUnit(items[0].unit) ? items[0].unit : 
                       (items[0].unit.toLowerCase() === 'l' || items[0].unit.toLowerCase() === 'ml' ? 'l' : 'kg');
      const displayQuantity = isCountBasedUnit(baseUnit) ? totalQuantity : 
                              (baseUnit === 'l' ? totalQuantity / 1000 : totalQuantity / 1000);

      return {
        name,
        items,
        totalQuantity: formatQuantity(displayQuantity, baseUnit),
        isExpanded: expandedItems[name] || false
      };
    });
  }, [groupedIngredients, expandedItems]);

  return {
    processedIngredients,
    toggleExpand,
    formatQuantity
  };
}
