import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Food, FoodLog, CartItem, Recipe, MealTime } from '../types';
import { getFoods, getDayNutrients, toggleFoodPin, getRecipes, toggleRecipePin, deleteLog } from '../services/database';
import AddFoodModal from './AddFoodModal';
import Cart from './Cart';

interface DayInputProps {
  date: string;
}

const DayInput: React.FC<DayInputProps> = ({ date }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<MealTime>('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [dayTotals, setDayTotals] = useState({
    calories: 0,
    fat: 0,
    carbs: 0,
    protein: 0
  });

  // Determine initial time of day based on current hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 10) {
      setTimeOfDay('breakfast');
    } else if (hour < 11) {
      setTimeOfDay('amSnack');
    } else if (hour < 14) {
      setTimeOfDay('lunch');
    } else if (hour < 17) {
      setTimeOfDay('pmSnack');
    } else if (hour < 21) {
      setTimeOfDay('dinner');
    } else {
      setTimeOfDay('lateSnack');
    }
  }, []);

  const refreshData = async () => {
    try {
      const [foodsData, recipesData] = await Promise.all([
        getFoods(),
        getRecipes(),
      ]);
      
      // Sort foods and recipes with pinned items first
      const sortedFoods = [...foodsData].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
      });
      
      const sortedRecipes = [...recipesData].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
      });
      
      setFoods(sortedFoods);
      setRecipes(sortedRecipes);
      await refreshLogs();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [date]);

  const refreshLogs = async () => {
    try {
      const nutrients = await getDayNutrients(date);
      
      // Sort logs by timeOfDay in chronological order
      const sortedNutrients = nutrients.sort((a, b) => {
        const timeOrder = {
          breakfast: 0,
          amSnack: 1,
          lunch: 2,
          pmSnack: 3,
          dinner: 4,
          lateSnack: 5
        };
        return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
      });
      
      setLogs(sortedNutrients);
      
      // Calculate totals
      const totals = sortedNutrients.reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        fat: acc.fat + curr.fat,
        carbs: acc.carbs + curr.carbs,
        protein: acc.protein + curr.protein
      }), { calories: 0, fat: 0, carbs: 0, protein: 0 });
      
      setDayTotals(totals);
    } catch (error) {
      console.error('Error refreshing logs:', error);
    }
  };

  const handleAddToCart = (food: Food | Recipe) => {
    if ('items' in food) { // It's a recipe
      setCartItems([...cartItems, { 
        recipeId: food.id, 
        amount: 1, // Start with 1 quantity
        timeOfDay 
      }]);
    } else { // It's a food
      const existingItem = cartItems.find(item => item.foodId === food.id);
      if (existingItem) {
        const newItems = cartItems.map(item =>
          item.foodId === food.id
            ? { ...item, amount: item.amount + food.servingSize }
            : item
        );
        setCartItems(newItems);
      } else {
        setCartItems([...cartItems, { 
          foodId: food.id, 
          amount: food.servingSize, 
          timeOfDay 
        }]);
      }
    }
    setShowCart(true);
  };

  const handleTogglePin = async (id: number, type: 'food' | 'recipe') => {
    try {
      if (type === 'food') {
        await toggleFoodPin(id);
      } else {
        await toggleRecipePin(id);
      }
      await refreshData();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      await deleteLog(logId);
      await refreshLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const timeOfDayTabs = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'amSnack', label: 'AM Snack' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'pmSnack', label: 'PM Snack' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'lateSnack', label: 'Late Snack' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Totals: {Math.round(dayTotals.calories)} cal (F: {Math.round(dayTotals.fat)}g, 
          C: {Math.round(dayTotals.carbs)}g, P: {Math.round(dayTotals.protein)}g)
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowCart(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cart ({cartItems.length})
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Custom Food
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        {timeOfDayTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTimeOfDay(tab.id as MealTime)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timeOfDay === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {foods.map((food) => (
          <div
            key={food.id}
            className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all relative group"
          >
            <button
              onClick={() => handleTogglePin(food.id, 'food')}
              className={`absolute top-2 right-2 text-[10px] ${
                food.isPinned
                  ? 'text-blue-600'
                  : 'text-gray-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              📌
            </button>
            <button
              onClick={() => handleAddToCart(food)}
              className="w-full text-left"
            >
              <div className="font-medium text-gray-900">{food.name}</div>
              <div className="text-sm text-gray-600">
                {food.calories} cal / {food.servingSize}{food.servingUnit}
              </div>
            </button>
          </div>
        ))}

        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all relative group"
          >
            <button
              onClick={() => handleTogglePin(recipe.id, 'recipe')}
              className={`absolute top-2 right-2 text-[10px] ${
                recipe.isPinned
                  ? 'text-blue-600'
                  : 'text-gray-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              📌
            </button>
            <button
              onClick={() => handleAddToCart(recipe)}
              className="w-full text-left"
            >
              <div className="font-medium text-gray-900">{recipe.name}</div>
              <div className="text-sm text-gray-600">
                {Math.round(recipe.totalCalories)} cal / serving
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Log</h3>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-gray-50 rounded-lg flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900">{log.name}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(`2000-01-01T${log.timeLogged}`), 'h:mm a')}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({log.isRecipe ? 'Recipe' : `${log.amount}g`})
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(log.calories)} cal (F: {Math.round(log.fat)}g,
                  C: {Math.round(log.carbs)}g, P: {Math.round(log.protein)}g)
                </div>
              </div>
              <button
                onClick={() => handleDeleteLog(log.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <AddFoodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onFoodAdded={refreshData}
      />

      {showCart && (
        <Cart
          date={date}
          timeOfDay={timeOfDay}
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateCart={setCartItems}
          onFoodLogged={refreshLogs}
          onRecipeAdded={refreshData}
        />
      )}
    </div>
  );
};

export default DayInput;
