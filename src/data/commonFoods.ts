// Pre-seeded food list (per 100g unless noted)
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultServing: string;
  servingMultiplier: number; // multiplier from 100g to default serving
}

export const COMMON_FOODS: FoodItem[] = [
  // Proteins
  { name: 'Chicken Breast (cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Ground Beef 90% lean', calories: 215, protein: 26, carbs: 0, fat: 12, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Salmon (cooked)', calories: 208, protein: 20, carbs: 0, fat: 13, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 1, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Eggs (large)', calories: 72, protein: 6, carbs: 0.4, fat: 5, defaultServing: '1 egg (50g)', servingMultiplier: 0.5 },
  { name: 'Greek Yogurt (plain, 2%)', calories: 73, protein: 10, carbs: 6, fat: 2, defaultServing: '170g', servingMultiplier: 1.7 },
  { name: 'Cottage Cheese (low-fat)', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Turkey Breast (cooked)', calories: 135, protein: 30, carbs: 0, fat: 1, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Shrimp (cooked)', calories: 99, protein: 24, carbs: 0, fat: 0.3, defaultServing: '100g', servingMultiplier: 1 },
  { name: 'Tilapia (cooked)', calories: 128, protein: 26, carbs: 0, fat: 2.7, defaultServing: '100g', servingMultiplier: 1 },

  // Dairy
  { name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, defaultServing: '240ml', servingMultiplier: 2.4 },
  { name: 'Skim Milk', calories: 35, protein: 3.4, carbs: 5, fat: 0.2, defaultServing: '240ml', servingMultiplier: 2.4 },
  { name: 'Cheddar Cheese', calories: 403, protein: 25, carbs: 1.3, fat: 33, defaultServing: '28g (1oz)', servingMultiplier: 0.28 },
  { name: 'Mozzarella (part-skim)', calories: 280, protein: 28, carbs: 3.1, fat: 17, defaultServing: '28g (1oz)', servingMultiplier: 0.28 },

  // Carbs / Grains
  { name: 'White Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultServing: '186g (1 cup)', servingMultiplier: 1.86 },
  { name: 'Brown Rice (cooked)', calories: 123, protein: 2.7, carbs: 26, fat: 1, defaultServing: '202g (1 cup)', servingMultiplier: 2.02 },
  { name: 'Oatmeal (cooked)', calories: 71, protein: 2.5, carbs: 12, fat: 1.5, defaultServing: '234g (1 cup)', servingMultiplier: 2.34 },
  { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 3.4, defaultServing: '28g (1 slice)', servingMultiplier: 0.28 },
  { name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, defaultServing: '25g (1 slice)', servingMultiplier: 0.25 },
  { name: 'Pasta (cooked)', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, defaultServing: '140g (1 cup)', servingMultiplier: 1.4 },
  { name: 'Sweet Potato (cooked)', calories: 90, protein: 2, carbs: 21, fat: 0.1, defaultServing: '130g (1 medium)', servingMultiplier: 1.3 },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, defaultServing: '185g (1 cup)', servingMultiplier: 1.85 },

  // Vegetables
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, defaultServing: '91g (1 cup)', servingMultiplier: 0.91 },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, defaultServing: '30g (1 cup)', servingMultiplier: 0.3 },
  { name: 'Mixed Salad Greens', calories: 17, protein: 1.5, carbs: 2.9, fat: 0.2, defaultServing: '85g (3oz)', servingMultiplier: 0.85 },
  { name: 'Bell Pepper', calories: 31, protein: 1, carbs: 6, fat: 0.3, defaultServing: '119g (1 medium)', servingMultiplier: 1.19 },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, defaultServing: '300g (1 large)', servingMultiplier: 3 },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultServing: '123g (1 medium)', servingMultiplier: 1.23 },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, defaultServing: '150g (1 medium)', servingMultiplier: 1.5 },

  // Fruits
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultServing: '118g (1 medium)', servingMultiplier: 1.18 },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultServing: '182g (1 medium)', servingMultiplier: 1.82 },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, defaultServing: '131g (1 medium)', servingMultiplier: 1.31 },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, defaultServing: '148g (1 cup)', servingMultiplier: 1.48 },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, defaultServing: '152g (1 cup)', servingMultiplier: 1.52 },

  // Fats & Oils
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, defaultServing: '14g (1 tbsp)', servingMultiplier: 0.14 },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, defaultServing: '32g (2 tbsp)', servingMultiplier: 0.32 },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, defaultServing: '28g (1oz)', servingMultiplier: 0.28 },
  { name: 'Mixed Nuts', calories: 607, protein: 14, carbs: 21, fat: 54, defaultServing: '28g (1oz)', servingMultiplier: 0.28 },

  // Fast Food / Common meals
  { name: 'McDonald\'s Big Mac', calories: 563, protein: 26, carbs: 45, fat: 33, defaultServing: '1 burger', servingMultiplier: 1 },
  { name: 'Subway 6" Turkey', calories: 280, protein: 18, carbs: 46, fat: 4.5, defaultServing: '1 sandwich', servingMultiplier: 1 },
  { name: 'Chipotle Burrito Bowl (chicken)', calories: 665, protein: 51, carbs: 62, fat: 23, defaultServing: '1 bowl', servingMultiplier: 1 },
  { name: 'Pizza (cheese, 1 slice)', calories: 285, protein: 12, carbs: 36, fat: 10, defaultServing: '1 slice (107g)', servingMultiplier: 1 },

  // Beverages
  { name: 'Black Coffee', calories: 2, protein: 0.3, carbs: 0, fat: 0, defaultServing: '240ml (8oz)', servingMultiplier: 1 },
  { name: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, defaultServing: '240ml (8oz)', servingMultiplier: 2.4 },
  { name: 'Protein Shake (whey)', calories: 120, protein: 24, carbs: 5, fat: 2, defaultServing: '1 scoop (34g)', servingMultiplier: 1 },
];
