import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../../services/api';
import '../../styles/WeeklyCalorieTracker.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Filler
);

function WeeklyCalorieTracker({ weeklyData }) {
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(null);
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = [...Array(7)].map((_, index) => addDays(startOfCurrentWeek, index));

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        const { data } = await api.get(`/dashboard/calorie-goal`);
        setDailyCalorieGoal(data.dailyCalories || null);
      } catch (error) {
        console.error('Error fetching calorie goal:', error);
      }
    };

    fetchCalorieGoal();
  }, []);

  const getCaloriesForDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return weeklyData.find(d => d.date === formattedDate)?.calories || 0;
  };

  const getPointColor = (calories) => {
    if (!dailyCalorieGoal) return '#ff7800';
    if (calories > dailyCalorieGoal) return '#FF6666'; // Red for exceeded
    if (calories === dailyCalorieGoal) return '#66BB6A'; // Green for exact match
    return '#ff7800'; // Orange for under goal
  };

  const getPointColors = () => {
    return daysOfWeek.map(date => getPointColor(getCaloriesForDate(date)));
  };

  const chartData = {
    labels: daysOfWeek.map(date => format(date, 'EEE')),
    datasets: [
      {
        label: 'Daily Calories',
        data: daysOfWeek.map(date => getCaloriesForDate(date)),
        borderColor: '#ff7800',
        backgroundColor: 'rgba(255, 120, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: getPointColors(),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        segment: {
          borderColor: (ctx) => {
            if (!ctx.p0.parsed || !ctx.p1.parsed) return '#ff7800';
            const curr = ctx.p0.parsed.y;
            const next = ctx.p1.parsed.y;
            
            if (curr > dailyCalorieGoal || next > dailyCalorieGoal) {
              return '#FF6666';
            }
            if (curr === dailyCalorieGoal && next === dailyCalorieGoal) {
              return '#66BB6A';
            }
            return '#ff7800';
          }
        }
      },
      {
        label: 'Daily Goal',
        data: daysOfWeek.map(() => dailyCalorieGoal),
        borderColor: '#66BB6A',
        borderDash: [5, 5],
        tension: 0,
        fill: false,
        pointRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Poppins', sans-serif"
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="weekly-calorie-tracker">
      <h3>Weekly Overview</h3>
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} height={300} />
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#FF6666' }}></span>
          <span>Over Goal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#66BB6A' }}></span>
          <span>At Goal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#ff7800' }}></span>
          <span>Under Goal</span>
        </div>
        <div className="legend-item">
          <span className="legend-line"></span>
          <span>Daily Goal</span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalorieTracker;
