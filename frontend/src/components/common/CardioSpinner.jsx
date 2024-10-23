import React, { useEffect } from 'react';
import { cardio } from 'ldrs';

function CardioSpinner({ size = "50", stroke = "4", speed = "2", color = "black" }) {
  useEffect(() => {
    cardio.register();
  }, []);

  return (
    <l-cardio
      size={size}
      stroke={stroke}
      speed={speed}
      color="#ff9800"
    ></l-cardio>
  );
}

export default CardioSpinner;
