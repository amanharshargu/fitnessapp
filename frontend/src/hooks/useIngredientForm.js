import { useState, useEffect, useMemo } from "react";
import { useIngredients } from "../contexts/IngredientContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export function useIngredientForm(editingIngredient) {
  const [ingredient, setIngredient] = useState({
    name: "",
    quantity: "",
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
      [name]: name === "quantity" ? (value === "" ? "" : parseFloat(value)) : value,
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
      const baseUnit = items[0].unit; // Use the unit of the first item

      return {
        name,
        items,
        totalQuantity: formatQuantity(totalQuantity, baseUnit),
        isExpanded: expandedItems[name] || false
      };
    });
  }, [groupedIngredients, expandedItems]);

  return {
    processedIngredients,
    toggleExpand,
  };
}

export function aggregateIngredients(ingredients, options = {}) {
  const {
    keyExtractor = (ingredient) => ingredient.name.toLowerCase(),
    quantityConverter = (quantity, unit) => quantity,
    unitNormalizer = (unit) => unit,
    sorter = null
  } = options;

  const aggregated = ingredients.reduce((acc, ingredient) => {
    const key = keyExtractor(ingredient);
    if (!acc[key]) {
      acc[key] = {
        name: ingredient.name,
        items: []
      };
    }
    acc[key].items.push({
      id: ingredient.id,
      quantity: quantityConverter(parseFloat(ingredient.quantity), ingredient.unit),
      unit: unitNormalizer(ingredient.unit),
      expirationDate: ingredient.expirationDate
    });
    return acc;
  }, {});

  if (sorter) {
    Object.values(aggregated).forEach(group => {
      group.items.sort(sorter);
    });
  }

  return aggregated;
}

export const isCountBasedUnit = (unit) => {
  return ['count', 'piece', 'pcs', ''].includes(unit.toLowerCase());
};

export const convertToBaseUnit = (quantity, unit) => {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'kg') return quantity * 1000;
  if (lowerUnit === 'g') return quantity;
  if (lowerUnit === 'l') return quantity * 1000;
  if (lowerUnit === 'ml') return quantity;
  return quantity; // for units like 'piece' or 'count'
};

export const formatQuantity = (quantity, unit) => {
  const numericQuantity = parseFloat(quantity);
  if (isNaN(numericQuantity)) return '';

  if (unit === 'kg' || unit === 'g') {
    if (numericQuantity >= 1000 && unit === 'g') {
      return `${(numericQuantity / 1000).toFixed(2)} kg`;
    } else if (numericQuantity < 1 && unit === 'kg') {
      return `${(numericQuantity * 1000).toFixed(0)} g`;
    }
  }

  return `${numericQuantity} ${unit}`;
};
