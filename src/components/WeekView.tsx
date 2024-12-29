import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { getDayNutrients } from '../services/database';

interface DayData {
  date: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

const WeekView: React.FC = () => {
  const [weekData, setWeekData] = useState<DayData[]>([]);

  useEffect(() => {
    const fetchWeekData = async () => {
      const today = new Date();
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, i);
        return format(date, 'yyyy-MM-dd');
      }).reverse();

      const weekNutrients = await Promise.all(
        days.map(async (date) => {
          try {
            const nutrients = await getDayNutrients(date);
            const totals = nutrients.reduce(
              (acc, curr) => ({
                calories: acc.calories + curr.calories,
                fat: acc.fat + curr.fat,
                carbs: acc.carbs + curr.carbs,
                protein: acc.protein + curr.protein,
              }),
              { calories: 0, fat: 0, carbs: 0, protein: 0 }
            );
            return { date, ...totals };
          } catch (error) {
            console.error(`Error fetching data for ${date}:`, error);
            return { date, calories: 0, fat: 0, carbs: 0, protein: 0 };
          }
        })
      );

      setWeekData(weekNutrients);
    };

    fetchWeekData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Week</h2>
      <div className="grid grid-cols-7 gap-4">
        {weekData.map((day) => (
          <div
            key={day.date}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">
              {format(new Date(day.date), 'EEE')}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(day.date), 'MMM d')}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div>{Math.round(day.calories)} cal</div>
              <div className="text-xs">
                F: {Math.round(day.fat)}g
                <br />
                C: {Math.round(day.carbs)}g
                <br />
                P: {Math.round(day.protein)}g
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
