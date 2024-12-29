import { useState, useEffect } from 'react';
import { getDailyGoals, updateDailyGoals } from '../services/database';
import { DailyGoals as DailyGoalsType } from '../types';

const DailyGoals: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState<DailyGoalsType>({
    calories: 2000,
    fatPercentage: 20,
    carbsPercentage: 40,
    proteinPercentage: 40,
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const savedGoals = await getDailyGoals();
        if (savedGoals) {
          setGoals(savedGoals);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };
    fetchGoals();
  }, []);

  const handlePercentageChange = (
    nutrient: 'fatPercentage' | 'carbsPercentage' | 'proteinPercentage',
    value: number
  ) => {
    const newGoals = { ...goals };
    newGoals[nutrient] = Math.max(0, Math.min(100, value));

    // Adjust other percentages to maintain 100% total
    const others = ['fatPercentage', 'carbsPercentage', 'proteinPercentage'].filter(
      n => n !== nutrient
    ) as Array<'fatPercentage' | 'carbsPercentage' | 'proteinPercentage'>;

    const remaining = 100 - newGoals[nutrient];
    const currentOthersTotal = others.reduce((sum, n) => sum + goals[n], 0);

    others.forEach(n => {
      newGoals[n] = Number((goals[n] * (remaining / currentOthersTotal)).toFixed(1));
    });

    setGoals(newGoals);
  };

  const handleSave = async () => {
    try {
      await updateDailyGoals(goals);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  const calculateGrams = (percentage: number) => {
    const totalCalories = goals.calories;
    const caloriesFromNutrient = (totalCalories * percentage) / 100;
    
    // Convert to grams based on calories per gram
    if (percentage === goals.fatPercentage) {
      return Math.round(caloriesFromNutrient / 9); // Fat has 9 calories per gram
    }
    return Math.round(caloriesFromNutrient / 4); // Protein and carbs have 4 calories per gram
  };

  if (!isEditing) {
    return (
      <div 
        className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsEditing(true)}
      >
        <h2 className="text-lg font-semibold text-gray-900">Daily Goals</h2>
        <div className="mt-2 text-gray-600">
          {goals.calories}cal F:{goals.fatPercentage}% ({calculateGrams(goals.fatPercentage)}g) 
          C:{goals.carbsPercentage}% ({calculateGrams(goals.carbsPercentage)}g) 
          P:{goals.proteinPercentage}% ({calculateGrams(goals.proteinPercentage)}g)
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Daily Goals</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Daily Calories</label>
          <input
            type="number"
            value={goals.calories}
            onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {(['fat', 'carbs', 'protein'] as const).map((nutrient) => (
          <div key={nutrient}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {nutrient} ({calculateGrams(goals[`${nutrient}Percentage` as keyof DailyGoalsType])}g)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="number"
                value={goals[`${nutrient}Percentage` as keyof DailyGoalsType]}
                onChange={(e) => handlePercentageChange(
                  `${nutrient}Percentage` as keyof DailyGoalsType,
                  Number(e.target.value)
                )}
                step="0.1"
                min="0"
                max="100"
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-500">%</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePercentageChange(
                    `${nutrient}Percentage` as keyof DailyGoalsType,
                    (goals[`${nutrient}Percentage` as keyof DailyGoalsType] || 0) - 1
                  )}
                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  -
                </button>
                <button
                  onClick={() => handlePercentageChange(
                    `${nutrient}Percentage` as keyof DailyGoalsType,
                    (goals[`${nutrient}Percentage` as keyof DailyGoalsType] || 0) + 1
                  )}
                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;
