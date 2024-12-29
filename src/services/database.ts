import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Food, FoodLog, DailyGoals, Recipe } from '../types';

interface MyDB extends DBSchema {
  foods: {
    key: number;
    value: Food;
    indexes: { 'by-name': string };
  };
  foodLogs: {
    key: number;
    value: FoodLog;
    indexes: { 'by-date': string };
  };
  recipes: {
    key: number;
    value: Recipe;
    indexes: { 'by-name': string };
  };
  dailyGoals: {
    key: string;
    value: DailyGoals;
  };
}

let db: IDBPDatabase<MyDB>;

const initDB = async () => {
  db = await openDB<MyDB>('julia-child-db', 2, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        const foodStore = db.createObjectStore('foods', {
          keyPath: 'id',
          autoIncrement: true,
        });
        foodStore.createIndex('by-name', 'name');

        const foodLogsStore = db.createObjectStore('foodLogs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        foodLogsStore.createIndex('by-date', 'date');

        db.createObjectStore('dailyGoals');

        // Add some default foods
        const foodsStore = foodStore;
        foodsStore.add({
          name: 'Chicken Breast',
          calories: 165,
          fat: 3.6,
          carbs: 0,
          protein: 31,
          servingSize: 100,
          servingUnit: 'g',
          isCustom: false,
          isPinned: false,
        });
        foodsStore.add({
          name: 'Brown Rice',
          calories: 112,
          fat: 0.9,
          carbs: 23.5,
          protein: 2.6,
          servingSize: 100,
          servingUnit: 'g',
          isCustom: false,
          isPinned: false,
        });
      }

      if (oldVersion < 2) {
        // Add recipes store in version 2
        const recipesStore = db.createObjectStore('recipes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        recipesStore.createIndex('by-name', 'name');
      }
    },
  });
};

export const getFoods = async (): Promise<Food[]> => {
  if (!db) await initDB();
  const foods = await db.getAll('foods');
  // Sort pinned items first
  return foods.sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });
};

export const addFood = async (food: Omit<Food, 'id'>): Promise<number> => {
  if (!db) await initDB();
  return db.add('foods', food);
};

export const updateFood = async (food: Food): Promise<void> => {
  if (!db) await initDB();
  await db.put('foods', food);
};

export const toggleFoodPin = async (foodId: number): Promise<void> => {
  if (!db) await initDB();
  const food = await db.get('foods', foodId);
  if (food) {
    food.isPinned = !food.isPinned;
    await db.put('foods', food);
  }
};

export const getRecipes = async (): Promise<Recipe[]> => {
  if (!db) await initDB();
  const recipes = await db.getAll('recipes');
  // Sort pinned items first
  return recipes.sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });
};

export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<number> => {
  if (!db) await initDB();
  return db.add('recipes', recipe);
};

export const updateRecipe = async (recipe: Recipe): Promise<void> => {
  if (!db) await initDB();
  await db.put('recipes', recipe);
};

export const toggleRecipePin = async (recipeId: number): Promise<void> => {
  if (!db) await initDB();
  const recipe = await db.get('recipes', recipeId);
  if (recipe) {
    recipe.isPinned = !recipe.isPinned;
    await db.put('recipes', recipe);
  }
};

export const logFood = async (log: FoodLog): Promise<void> => {
  if (!db) await initDB();
  await db.add('foodLogs', log);
};

export const logRecipe = async (log: FoodLog): Promise<void> => {
  if (!db) await initDB();
  await db.add('foodLogs', log);
};

export const deleteLog = async (logId: number): Promise<void> => {
  if (!db) await initDB();
  await db.delete('foodLogs', logId);
};

export const getDayNutrients = async (date: string) => {
  if (!db) await initDB();
  const logs = await db.getAllFromIndex('foodLogs', 'by-date', date);
  const foods = await getFoods();
  const recipes = await getRecipes();
  
  const nutrients = await Promise.all(
    logs.map(async (log: FoodLog) => {
      if (log.recipeId) {
        const recipe = recipes.find(r => r.id === log.recipeId);
        if (recipe) {
          return {
            id: log.id,
            name: recipe.name,
            calories: recipe.totalCalories * log.amount,
            fat: recipe.totalFat * log.amount,
            carbs: recipe.totalCarbs * log.amount,
            protein: recipe.totalProtein * log.amount,
            amount: log.amount,
            timeLogged: log.timeLogged,
            timeOfDay: log.timeOfDay,
            isRecipe: true
          };
        }
      } else if (log.foodId) {
        const food = foods.find(f => f.id === log.foodId);
        if (food) {
          const multiplier = log.amount / food.servingSize;
          return {
            id: log.id,
            name: food.name,
            calories: food.calories * multiplier,
            fat: food.fat * multiplier,
            carbs: food.carbs * multiplier,
            protein: food.protein * multiplier,
            amount: log.amount,
            timeLogged: log.timeLogged,
            timeOfDay: log.timeOfDay,
            isRecipe: false
          };
        }
      }
      return null;
    })
  );
  
  return nutrients.filter(Boolean);
};

export const getDailyGoals = async (): Promise<DailyGoals> => {
  if (!db) await initDB();
  
  const goals = await db.get('dailyGoals', 'current');
  return goals || {
    calories: 2000,
    fatPercentage: 20,
    carbsPercentage: 40,
    proteinPercentage: 40,
  };
};

export const updateDailyGoals = async (goals: DailyGoals): Promise<void> => {
  if (!db) await initDB();
  await db.put('dailyGoals', goals, 'current');
};
