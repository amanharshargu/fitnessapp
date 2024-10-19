const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
};

const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
  };

  return bmr * activityMultipliers[activityLevel];
};

exports.calculateCalories = (weight, height, age, gender, goal, activityLevel) => {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  switch (goal) {
    case 'lose_weight':
      return Math.round(tdee * 0.85);
    case 'maintain_weight':
      return Math.round(tdee);
    case 'gain_weight':
      return Math.round(tdee * 1.10);
    default:
      console.log('Invalid goal:', goal);
      return Math.round(tdee);
  }
};