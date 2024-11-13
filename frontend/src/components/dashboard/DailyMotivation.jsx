import React, { useMemo, useState, useEffect } from 'react';
import '../../styles/DailyMotivation.css';

const DailyMotivation = React.memo(() => {
  const [tip, setTip] = useState(null);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) return "morning";
    if (hours < 17) return "afternoon";
    return "evening";
  };

  const timeOfDay = useMemo(() => getCurrentTime(), []);

  const tips = useMemo(() => ({
    morning: [
      {
        title: "Morning Hydration",
        text: "Start your day with a glass of warm water with lemon. This helps kickstart your metabolism and aids in digestion. The vitamin C from lemon also supports your immune system 💧",
      },
      {
        title: "Protein-Rich Breakfast",
        text: "Include eggs, Greek yogurt, or lean protein in your breakfast. Protein helps maintain stable blood sugar levels and keeps you feeling full until lunch. Aim for 20-30g of protein 🍳",
      },
      {
        title: "Morning Movement",
        text: "Light stretching or yoga for 10 minutes increases blood flow and releases endorphins. Focus on gentle movements to wake up your muscles and improve flexibility 🧘‍♂️",
      },
      {
        title: "Balanced Breakfast",
        text: "Combine complex carbs (oats/whole grain), protein (eggs/yogurt), and healthy fats (nuts/avocado). This trio provides sustained energy and essential nutrients 🥑",
      },
      {
        title: "Meal Planning",
        text: "Take 5 minutes to plan your meals for the day. This helps you make healthier choices and avoid impulsive eating. Consider prep time and your schedule 📝",
      }
    ],
    afternoon: [
      {
        title: "Post-Lunch Activity",
        text: "A 10-15 minute walk after lunch aids digestion and prevents post-meal energy dips. It also helps regulate blood sugar levels and improves focus 🚶‍♂️",
      },
      {
        title: "Smart Snacking",
        text: "Choose snacks combining protein and fiber: apple with almond butter, Greek yogurt with berries, or hummus with vegetables. This combination helps maintain stable energy 🍎",
      },
      {
        title: "Hydration Check",
        text: "By mid-day, aim to drink half your daily water goal. If plain water is boring, try infusing it with cucumber, mint, or citrus fruits. Proper hydration improves concentration 💧",
      },
      {
        title: "Desk Exercises",
        text: "Every hour, do 2-3 minutes of desk stretches or walking. This prevents muscle stiffness, improves circulation, and helps maintain focus. Set reminders if needed 🪑",
      },
      {
        title: "Mindful Eating",
        text: "Practice eating lunch without distractions. Focus on your food's taste, texture, and your body's hunger signals. This improves digestion and prevents overeating 🥗",
      }
    ],
    evening: [
      {
        title: "Evening Meal Timing",
        text: "Try to eat dinner 2-3 hours before bedtime. This allows proper digestion and can improve sleep quality. Choose lighter proteins and complex carbs for better rest 🌙",
      },
      {
        title: "Calming Beverages",
        text: "Chamomile or valerian root tea can help prepare your body for sleep. These herbs have natural calming properties. Avoid caffeine after 2 PM for better sleep quality 🫖",
      },
      {
        title: "Tomorrow's Preparation",
        text: "Spend 10 minutes preparing for tomorrow: pack a healthy lunch, set out workout clothes, or prep breakfast ingredients. This reduces morning stress and helps maintain healthy habits 📋",
      },
      {
        title: "Evening Relaxation",
        text: "Light stretching or gentle yoga can help release tension from the day. Focus on deep breathing and relaxing tight muscles. This signals your body it's time to wind down 🧘‍♀️",
      },
      {
        title: "Smart Hydration",
        text: "Have your last big glass of water 2 hours before bed. This helps you stay hydrated while minimizing nighttime bathroom trips. Consider having small sips if needed later 💧",
      }
    ]
  }), []);

  const getRandomTip = () => {
    const timeSpecificTips = tips[timeOfDay];
    return timeSpecificTips[Math.floor(Math.random() * timeSpecificTips.length)];
  };

  const getDailyQuote = () => {
    const storageKey = `dailyQuote_${new Date().toDateString()}`;
    const storedQuote = localStorage.getItem(storageKey);
    
    if (storedQuote) {
      return storedQuote;
    }

    const quotes = [
      "Every healthy choice is an investment in your future well-being",
      "Small daily improvements lead to remarkable results",
      "Your body deserves the best, and you have the power to provide it",
      "Focus on progress, not perfection",
      "Today's choices shape tomorrow's health"
    ];
    
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    localStorage.setItem(storageKey, newQuote);
    return newQuote;
  };

  useEffect(() => {
    setTip(getRandomTip());
    
    const interval = setInterval(() => {
      setTip(getRandomTip());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const quote = useMemo(() => getDailyQuote(), []);

  if (!tip) return null;

  return (
    <div className="daily-motivation">
      <div className="motivation-content">
        <div className="greeting-section">
          <h3>Good {timeOfDay}! 👋</h3>
          <p className="motivational-quote">{quote}</p>
        </div>
        <div className="daily-tip">
          <h4>{tip.title}</h4>
          <p>{tip.text}</p>
        </div>
      </div>
    </div>
  );
});

DailyMotivation.displayName = 'DailyMotivation';

export default DailyMotivation; 