import { useState, useEffect } from 'react';
import { CartItem, Food, Recipe, MealTime } from '../types';
import { getFoods, logFood, logRecipe, addRecipe, getRecipes } from '../services/database';

interface CartProps {
  date: string;
  timeOfDay: MealTime;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateCart: (items: CartItem[]) => void;
  onFoodLogged: () => void;
  onRecipeAdded: () => void;
  onUpdateTimeOfDay: (timeOfDay: MealTime) => void;
}

const Cart: React.FC<CartProps> = ({
  date,
  timeOfDay,
  cartItems,
  onClose,
  onUpdateCart,
  onFoodLogged,
  onRecipeAdded,
  onUpdateTimeOfDay,
}) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [showSaveRecipe, setShowSaveRecipe] = useState(false);
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<(CartItem & { 
    food?: Food;
    recipe?: Recipe;
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
  })[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [foodsData, recipesData] = await Promise.all([
        getFoods(),
        getRecipes(),
      ]);
      setFoods(foodsData);
      setRecipes(recipesData);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (foods.length > 0 && recipes.length > 0) {
      const itemsWithDetails = cartItems.map(item => {
        if ('recipeId' in item) {
          const recipe = recipes.find(r => r.id === item.recipeId);
          if (recipe) {
            return {
              ...item,
              recipe,
              calories: recipe.totalCalories * item.amount,
              fat: recipe.totalFat * item.amount,
              carbs: recipe.totalCarbs * item.amount,
              protein: recipe.totalProtein * item.amount,
            };
          }
        } else {
          const food = foods.find(f => f.id === item.foodId);
          if (food) {
            const multiplier = item.amount / food.servingSize;
            return {
              ...item,
              food,
              calories: food.calories * multiplier,
              fat: food.fat * multiplier,
              carbs: food.carbs * multiplier,
              protein: food.protein * multiplier,
            };
          }
        }
        return null;
      }).filter(Boolean);
      setCartItemsWithDetails(itemsWithDetails as any);
    }
  }, [foods, recipes, cartItems]);

  const calculateTotals = () => {
    return cartItemsWithDetails.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
        protein: acc.protein + item.protein,
      }),
      { calories: 0, fat: 0, carbs: 0, protein: 0 }
    );
  };

  const handleRemoveItem = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    onUpdateCart(newItems);
  };

  const handleUpdateAmount = (index: number, amount: number) => {
    const newItems = cartItems.map((item, i) =>
      i === index ? { ...item, amount } : item
    );
    onUpdateCart(newItems);
  };

  const handleLogFoods = async () => {
    try {
      const timeLogged = new Date().toISOString().split('T')[1].slice(0, 8);
      for (const item of cartItems) {
        if ('recipeId' in item) {
          await logRecipe({
            recipeId: item.recipeId,
            date,
            amount: item.amount,
            timeLogged,
            timeOfDay,
          });
        } else {
          await logFood({
            foodId: item.foodId,
            date,
            amount: item.amount,
            timeLogged,
            timeOfDay,
          });
        }
      }
      onUpdateCart([]); // Clear cart
      onFoodLogged(); // Refresh logs
      onClose();
    } catch (error) {
      console.error('Error logging foods:', error);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) return;

    const totals = calculateTotals();
    try {
      await addRecipe({
        name: recipeName,
        items: cartItems.map(item => ({
          foodId: item.foodId,
          amount: item.amount,
        })),
        totalCalories: totals.calories,
        totalFat: totals.fat,
        totalCarbs: totals.carbs,
        totalProtein: totals.protein,
        isPinned: false,
      });
      setShowSaveRecipe(false);
      setRecipeName('');
      onRecipeAdded(); // Refresh recipes list
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg flex flex-col max-h-screen">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Food Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSaveRecipe(true)}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Save as Recipe
          </button>
          <button
            onClick={handleLogFoods}
            disabled={cartItemsWithDetails.length === 0}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Log Foods
          </button>
        </div>

        {/* Save Recipe Form */}
        {showSaveRecipe && (
          <div className="mt-4">
            <input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 mb-2"
              placeholder="Recipe name"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveRecipe}
                disabled={!recipeName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveRecipe(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {cartItemsWithDetails.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Add foods to your cart by clicking on them
          </div>
        ) : (
          <div className="space-y-4">
            {cartItemsWithDetails.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {item.recipe?.name || item.food?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(item.calories)} cal
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleUpdateAmount(index, Number(e.target.value))
                    }
                    className="w-20 px-2 py-1 text-sm rounded border border-gray-300"
                    min="0"
                    step={item.recipe ? "0.25" : "1"}
                  />
                  <span className="ml-1 text-sm text-gray-600">
                    {item.recipe ? 'serving(s)' : item.food?.servingUnit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-white flex-shrink-0">
        <div className="mb-4">
          <div className="font-medium mb-2">Meal Time:</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'amSnack', label: 'AM Snack' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'pmSnack', label: 'PM Snack' },
              { id: 'dinner', label: 'Dinner' },
              { id: 'lateSnack', label: 'Late Snack' },
            ].map((time) => (
              <button
                key={time.id}
                onClick={() => onUpdateTimeOfDay(time.id as MealTime)}
                className={`px-2 py-1 text-sm font-medium rounded ${
                  timeOfDay === time.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        <div className="font-medium mb-1">Totals:</div>
        <div className="text-sm text-gray-600 mb-2">
          Calories: {Math.round(totals.calories)}
          <br />
          Fat: {Math.round(totals.fat)}g • Carbs: {Math.round(totals.carbs)}g • Protein: {Math.round(totals.protein)}g
        </div>
      </div>
    </div>
  );
};

export default Cart;
