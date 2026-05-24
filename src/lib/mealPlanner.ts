// 饮食方案生成器 - 新规则版本

import {
  carbIngredients,
  proteinIngredients,
  fatIngredients,
  nutIngredients,
  breakfastExtras,
  vegetableIngredients,
  getIngredientById,
  dinnerCarbIds,
  mealProteinIds,
  mealVegetableIds,
} from '@/data/ingredients';

// ==================== 类型定义 ====================

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface MealIngredient {
  ingredient: Ingredient;
  grams: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MealIngredient[];
  totalNutrition: {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  };
}

export interface DayPlan {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  salt: string; // 盐 6-8g
  totalNutrition: {
    carbs: number;
    protein: number;
    fat: number;
    calories: number;
  };
}

export interface MealPlan {
  days: DayPlan[];
  targetNutrition: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

// ==================== 营养素计算 ====================

// 活动系数映射
const ACTIVITY_COEFFICIENTS: Record<string, { carbs: number; protein: number; fat: number }> = {
  '2-3': { carbs: 2.2, protein: 1.4, fat: 0.8 },
  '4-5': { carbs: 2.5, protein: 1.6, fat: 0.9 },
  '6-7': { carbs: 3.0, protein: 1.7, fat: 1.0 },
  '8+': { carbs: 3.5, protein: 1.8, fat: 1.0 },
};

// 计算每日营养素需求
export function calculateDailyNeeds(
  weight: number,
  gender: 'male' | 'female',
  activityLevel: '2-3' | '4-5' | '6-7' | '8+'
): { carbs: number; protein: number; fat: number } {
  const base = ACTIVITY_COEFFICIENTS[activityLevel];
  
  // 女性调整
  let carbsCoeff = base.carbs;
  let fatCoeff = base.fat;
  
  if (gender === 'female') {
    carbsCoeff -= 0.3;
    fatCoeff += 0.15;
  }
  
  const carbs = Math.round(weight * carbsCoeff);
  const protein = Math.round(weight * base.protein);
  const fat = Math.round(weight * fatCoeff);
  
  return { carbs, protein, fat };
}

// ==================== 三餐分配 ====================

// 三餐分配比例：早30%、午40%、晚30%
const MEAL_DISTRIBUTION = {
  breakfast: 0.30,
  lunch: 0.40,
  dinner: 0.30,
};

// 计算每餐营养素目标
function calculateMealTargets(dailyNeeds: { carbs: number; protein: number; fat: number }) {
  return {
    breakfast: {
      carbs: Math.round(dailyNeeds.carbs * MEAL_DISTRIBUTION.breakfast),
      protein: Math.round(dailyNeeds.protein * MEAL_DISTRIBUTION.breakfast),
      fat: Math.round(dailyNeeds.fat * MEAL_DISTRIBUTION.breakfast),
    },
    lunch: {
      carbs: Math.round(dailyNeeds.carbs * MEAL_DISTRIBUTION.lunch),
      protein: Math.round(dailyNeeds.protein * MEAL_DISTRIBUTION.lunch),
      fat: Math.round(dailyNeeds.fat * MEAL_DISTRIBUTION.lunch),
    },
    dinner: {
      carbs: Math.round(dailyNeeds.carbs * MEAL_DISTRIBUTION.dinner),
      protein: Math.round(dailyNeeds.protein * MEAL_DISTRIBUTION.dinner),
      fat: Math.round(dailyNeeds.fat * MEAL_DISTRIBUTION.dinner),
    },
  };
}

// ==================== 早餐生成 ====================

// 早餐固定食材
const OATMEAL = getIngredientById('carb_oatmeal')!;
const EGG = getIngredientById('protein_egg')!;
const PUMPKIN_SEED = getIngredientById('extra_pumpkin_seed')!;
const BLUEBERRY = getIngredientById('extra_blueberry')!;

// 生成早餐
function generateBreakfast(
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  usedEggs: number[] // 记录已使用的鸡蛋数量，避免重复
): { meal: Meal; eggsUsed: number } {
  // 固定食材
  const OATMEAL_GRAMS = 40;
  const PUMPKIN_SEED_GRAMS = 18;
  const BLUEBERRY_GRAMS = 100;
  
  // 计算固定食材的营养素
  const oatmealNutrition = {
    carbs: (OATMEAL.carbs / 100) * OATMEAL_GRAMS,
    protein: (OATMEAL.protein / 100) * OATMEAL_GRAMS,
    fat: (OATMEAL.fat / 100) * OATMEAL_GRAMS,
  };
  
  const pumpkinSeedNutrition = {
    carbs: (PUMPKIN_SEED.carbs / 100) * PUMPKIN_SEED_GRAMS,
    protein: (PUMPKIN_SEED.protein / 100) * PUMPKIN_SEED_GRAMS,
    fat: (PUMPKIN_SEED.fat / 100) * PUMPKIN_SEED_GRAMS,
  };
  
  const blueberryNutrition = {
    carbs: (BLUEBERRY.carbs / 100) * BLUEBERRY_GRAMS,
    protein: (BLUEBERRY.protein / 100) * BLUEBERRY_GRAMS,
    fat: (BLUEBERRY.fat / 100) * BLUEBERRY_GRAMS,
  };
  
  // 固定食材已提供的蛋白质
  const fixedProtein = oatmealNutrition.protein + pumpkinSeedNutrition.protein + blueberryNutrition.protein;
  
  // 剩余需要的蛋白质
  const remainingProtein = targetProtein - fixedProtein;
  
  // 计算鸡蛋数量（每个鸡蛋约6.5g蛋白质）
  let eggs = 2;
  if (remainingProtein > 13) {
    eggs = 3; // 需要更多蛋白质
  } else if (remainingProtein > 6.5) {
    eggs = 3; // 向上取整
  } else if (remainingProtein > 0) {
    eggs = 2;
  }
  
  // 确保鸡蛋数量在2-3之间
  eggs = Math.max(2, Math.min(3, eggs));
  
  // 避免连续使用相同数量
  if (usedEggs.length > 0 && usedEggs[usedEggs.length - 1] === eggs) {
    eggs = eggs === 2 ? 3 : 2;
  }
  
  const eggGrams = eggs * 50; // 每个鸡蛋约50g
  
  const eggNutrition = {
    carbs: (EGG.carbs / 100) * eggGrams,
    protein: (EGG.protein / 100) * eggGrams,
    fat: (EGG.fat / 100) * eggGrams,
  };
  
  // 计算总营养素
  const totalNutrition = {
    carbs: Math.round(oatmealNutrition.carbs + pumpkinSeedNutrition.carbs + blueberryNutrition.carbs + eggNutrition.carbs),
    protein: Math.round(oatmealNutrition.protein + pumpkinSeedNutrition.protein + blueberryNutrition.protein + eggNutrition.protein),
    fat: Math.round(oatmealNutrition.fat + pumpkinSeedNutrition.fat + blueberryNutrition.fat + eggNutrition.fat),
    calories: 0,
  };
  totalNutrition.calories = Math.round(totalNutrition.carbs * 4 + totalNutrition.protein * 4 + totalNutrition.fat * 9);
  
  const meal: Meal = {
    type: 'breakfast',
    items: [
      { ingredient: OATMEAL, grams: OATMEAL_GRAMS },
      { ingredient: EGG, grams: eggGrams },
      { ingredient: PUMPKIN_SEED, grams: PUMPKIN_SEED_GRAMS },
      { ingredient: BLUEBERRY, grams: BLUEBERRY_GRAMS },
    ],
    totalNutrition,
  };
  
  return { meal, eggsUsed: eggs };
}

// ==================== 午餐生成 ====================

// 生成午餐：米饭 + 蛋白质 + 蔬菜
function generateLunch(
  targetCarbs: number,
  targetProtein: number,
  targetFat: number,
  gender: 'male' | 'female',
  usedProteins: string[],
  usedVegetables: string[]
): Meal {
  const RICE = getIngredientById('carb_rice')!;
  
  // 计算蔬菜克数
  const vegMin = gender === 'female' ? 150 : 200;
  const vegMax = gender === 'female' ? 250 : 300;
  const vegGrams = vegMin + Math.floor(Math.random() * (vegMax - vegMin) / 10) * 10;
  
  // 选择蔬菜（避免重复）
  const availableVegs = mealVegetableIds.filter(id => !usedVegetables.includes(id));
  const vegId = availableVegs.length > 0 
    ? availableVegs[Math.floor(Math.random() * availableVegs.length)]
    : mealVegetableIds[Math.floor(Math.random() * mealVegetableIds.length)];
  const vegetable = getIngredientById(vegId)!;
  
  // 蔬菜营养素
  const vegNutrition = {
    carbs: (vegetable.carbs / 100) * vegGrams,
    protein: (vegetable.protein / 100) * vegGrams,
    fat: (vegetable.fat / 100) * vegGrams,
  };
  
  // 选择蛋白质（避免重复）
  const availableProteins = mealProteinIds.filter(id => !usedProteins.includes(id));
  const proteinId = availableProteins.length > 0
    ? availableProteins[Math.floor(Math.random() * availableProteins.length)]
    : mealProteinIds[Math.floor(Math.random() * mealProteinIds.length)];
  const protein = getIngredientById(proteinId)!;
  
  // 计算蛋白质克数（目标蛋白质 - 蔬菜蛋白质）
  const proteinFromVeg = vegNutrition.protein;
  const remainingProtein = Math.max(0, targetProtein - proteinFromVeg);
  const proteinGrams = Math.min(500, Math.max(30, Math.round((remainingProtein / protein.protein) * 100)));
  
  const proteinNutrition = {
    carbs: (protein.carbs / 100) * proteinGrams,
    protein: (protein.protein / 100) * proteinGrams,
    fat: (protein.fat / 100) * proteinGrams,
  };
  
  // 计算米饭克数（目标碳水 - 蔬菜碳水 - 蛋白质碳水）
  const carbsFromVegAndProtein = vegNutrition.carbs + proteinNutrition.carbs;
  const remainingCarbs = Math.max(0, targetCarbs - carbsFromVegAndProtein);
  const riceGrams = Math.min(500, Math.max(50, Math.round((remainingCarbs / RICE.carbs) * 100)));
  
  const riceNutrition = {
    carbs: (RICE.carbs / 100) * riceGrams,
    protein: (RICE.protein / 100) * riceGrams,
    fat: (RICE.fat / 100) * riceGrams,
  };
  
  // 计算总营养素
  let totalNutrition = {
    carbs: Math.round(riceNutrition.carbs + proteinNutrition.carbs + vegNutrition.carbs),
    protein: Math.round(riceNutrition.protein + proteinNutrition.protein + vegNutrition.protein),
    fat: Math.round(riceNutrition.fat + proteinNutrition.fat + vegNutrition.fat),
    calories: 0,
  };
  totalNutrition.calories = Math.round(totalNutrition.carbs * 4 + totalNutrition.protein * 4 + totalNutrition.fat * 9);
  
  const items: MealIngredient[] = [
    { ingredient: RICE, grams: riceGrams },
    { ingredient: protein, grams: proteinGrams },
    { ingredient: vegetable, grams: vegGrams },
  ];
  
  return {
    type: 'lunch',
    items,
    totalNutrition,
  };
}

// ==================== 晚餐生成 ====================

// 生成晚餐：碳水4选1 + 蛋白质 + 蔬菜
function generateDinner(
  targetCarbs: number,
  targetProtein: number,
  targetFat: number,
  gender: 'male' | 'female',
  usedCarbs: string[],
  usedProteins: string[],
  usedVegetables: string[]
): Meal {
  // 计算蔬菜克数
  const vegMin = gender === 'female' ? 150 : 200;
  const vegMax = gender === 'female' ? 250 : 300;
  const vegGrams = vegMin + Math.floor(Math.random() * (vegMax - vegMin) / 10) * 10;
  
  // 选择蔬菜（避免重复）
  const availableVegs = mealVegetableIds.filter(id => !usedVegetables.includes(id));
  const vegId = availableVegs.length > 0
    ? availableVegs[Math.floor(Math.random() * availableVegs.length)]
    : mealVegetableIds[Math.floor(Math.random() * mealVegetableIds.length)];
  const vegetable = getIngredientById(vegId)!;
  
  // 蔬菜营养素
  const vegNutrition = {
    carbs: (vegetable.carbs / 100) * vegGrams,
    protein: (vegetable.protein / 100) * vegGrams,
    fat: (vegetable.fat / 100) * vegGrams,
  };
  
  // 选择蛋白质（避免重复）
  const availableProteins = mealProteinIds.filter(id => !usedProteins.includes(id));
  const proteinId = availableProteins.length > 0
    ? availableProteins[Math.floor(Math.random() * availableProteins.length)]
    : mealProteinIds[Math.floor(Math.random() * mealProteinIds.length)];
  const protein = getIngredientById(proteinId)!;
  
  // 计算蛋白质克数
  const proteinFromVeg = vegNutrition.protein;
  const remainingProtein = Math.max(0, targetProtein - proteinFromVeg);
  const proteinGrams = Math.min(500, Math.max(30, Math.round((remainingProtein / protein.protein) * 100)));
  
  const proteinNutrition = {
    carbs: (protein.carbs / 100) * proteinGrams,
    protein: (protein.protein / 100) * proteinGrams,
    fat: (protein.fat / 100) * proteinGrams,
  };
  
  // 选择碳水（晚餐4选1，避免重复）
  const availableCarbs = dinnerCarbIds.filter(id => !usedCarbs.includes(id));
  const carbId = availableCarbs.length > 0
    ? availableCarbs[Math.floor(Math.random() * availableCarbs.length)]
    : dinnerCarbIds[Math.floor(Math.random() * dinnerCarbIds.length)];
  const carb = getIngredientById(carbId)!;
  
  // 计算碳水克数
  const carbsFromVegAndProtein = vegNutrition.carbs + proteinNutrition.carbs;
  const remainingCarbs = Math.max(0, targetCarbs - carbsFromVegAndProtein);
  const carbGrams = Math.min(500, Math.max(50, Math.round((remainingCarbs / carb.carbs) * 100)));
  
  const carbNutrition = {
    carbs: (carb.carbs / 100) * carbGrams,
    protein: (carb.protein / 100) * carbGrams,
    fat: (carb.fat / 100) * carbGrams,
  };
  
  // 计算总营养素
  let totalNutrition = {
    carbs: Math.round(carbNutrition.carbs + proteinNutrition.carbs + vegNutrition.carbs),
    protein: Math.round(carbNutrition.protein + proteinNutrition.protein + vegNutrition.protein),
    fat: Math.round(carbNutrition.fat + proteinNutrition.fat + vegNutrition.fat),
    calories: 0,
  };
  totalNutrition.calories = Math.round(totalNutrition.carbs * 4 + totalNutrition.protein * 4 + totalNutrition.fat * 9);
  
  const items: MealIngredient[] = [
    { ingredient: carb, grams: carbGrams },
    { ingredient: protein, grams: proteinGrams },
    { ingredient: vegetable, grams: vegGrams },
  ];
  
  return {
    type: 'dinner',
    items,
    totalNutrition,
  };
}

// ==================== 主生成函数 ====================

export function generateMealPlan(
  dailyNeeds: { carbs: number; protein: number; fat: number },
  gender: 'male' | 'female',
  days: number = 10
): MealPlan {
  const mealTargets = calculateMealTargets(dailyNeeds);
  const dayPlans: DayPlan[] = [];
  
  // 记录已使用的食材（用于避免重复）
  const usedEggs: number[] = [];
  const usedLunchProteins: string[] = [];
  const usedLunchVegetables: string[] = [];
  const usedDinnerCarbs: string[] = [];
  const usedDinnerProteins: string[] = [];
  const usedDinnerVegetables: string[] = [];
  
  for (let day = 1; day <= days; day++) {
    // 生成早餐
    const { meal: breakfast, eggsUsed } = generateBreakfast(
      mealTargets.breakfast.protein,
      mealTargets.breakfast.carbs,
      mealTargets.breakfast.fat,
      usedEggs
    );
    usedEggs.push(eggsUsed);
    
    // 计算早餐后剩余的营养素目标
    const breakfastNutrition = breakfast.totalNutrition;
    const remainingLunch = {
      carbs: mealTargets.lunch.carbs,
      protein: mealTargets.lunch.protein,
      fat: mealTargets.lunch.fat,
    };
    const remainingDinner = {
      carbs: mealTargets.dinner.carbs,
      protein: mealTargets.dinner.protein,
      fat: mealTargets.dinner.fat,
    };
    
    // 生成午餐
    const lunch = generateLunch(
      remainingLunch.carbs,
      remainingLunch.protein,
      remainingLunch.fat,
      gender,
      usedLunchProteins,
      usedLunchVegetables
    );
    usedLunchProteins.push(lunch.items[1].ingredient.id);
    usedLunchVegetables.push(lunch.items[2].ingredient.id);
    
    // 生成晚餐
    const dinner = generateDinner(
      remainingDinner.carbs,
      remainingDinner.protein,
      remainingDinner.fat,
      gender,
      usedDinnerCarbs,
      usedDinnerProteins,
      usedDinnerVegetables
    );
    usedDinnerCarbs.push(dinner.items[0].ingredient.id);
    usedDinnerProteins.push(dinner.items[1].ingredient.id);
    usedDinnerVegetables.push(dinner.items[2].ingredient.id);
    
    // 计算三餐总脂肪
    const currentFat = breakfast.totalNutrition.fat + lunch.totalNutrition.fat + dinner.totalNutrition.fat;
    const targetFat = dailyNeeds.fat;
    
    // 如果脂肪不够，在晚餐中添加坚果补足
    if (currentFat < targetFat) {
      const fatDeficit = targetFat - currentFat;
      // 随机选择一种坚果
      const nutOptions = nutIngredients;
      const selectedNut = nutOptions[Math.floor(Math.random() * nutOptions.length)];
      // 计算需要的坚果克数（每100g坚果含多少脂肪）
      const nutGrams = Math.round((fatDeficit / selectedNut.fat) * 100);
      // 限制坚果量在10-30g之间（合理范围）
      const finalNutGrams = Math.min(30, Math.max(10, nutGrams));
      
      // 添加坚果到晚餐
      dinner.items.push({
        ingredient: selectedNut,
        grams: finalNutGrams,
      });
      
      // 更新晚餐营养素
      const nutFat = (selectedNut.fat / 100) * finalNutGrams;
      const nutProtein = (selectedNut.protein / 100) * finalNutGrams;
      const nutCarbs = (selectedNut.carbs / 100) * finalNutGrams;
      
      dinner.totalNutrition.fat += nutFat;
      dinner.totalNutrition.protein += nutProtein;
      dinner.totalNutrition.carbs += nutCarbs;
      dinner.totalNutrition.calories += nutCarbs * 4 + nutProtein * 4 + nutFat * 9;
    }
    
    // 计算每日总营养素
    const totalNutrition = {
      carbs: breakfast.totalNutrition.carbs + lunch.totalNutrition.carbs + dinner.totalNutrition.carbs,
      protein: breakfast.totalNutrition.protein + lunch.totalNutrition.protein + dinner.totalNutrition.protein,
      fat: breakfast.totalNutrition.fat + lunch.totalNutrition.fat + dinner.totalNutrition.fat,
      calories: breakfast.totalNutrition.calories + lunch.totalNutrition.calories + dinner.totalNutrition.calories,
    };
    
    // 盐 6-8g
    const salt = `${6 + Math.floor(Math.random() * 3)}g`;
    
    dayPlans.push({
      day,
      breakfast,
      lunch,
      dinner,
      salt,
      totalNutrition: {
        carbs: totalNutrition.carbs,
        protein: totalNutrition.protein,
        fat: totalNutrition.fat,
        calories: totalNutrition.calories,
      },
    });
    
    // 每5天重置已用食材记录，允许适度重复
    if (day % 5 === 0) {
      usedLunchProteins.length = 0;
      usedLunchVegetables.length = 0;
      usedDinnerCarbs.length = 0;
      usedDinnerProteins.length = 0;
      usedDinnerVegetables.length = 0;
    }
  }
  
  return {
    days: dayPlans,
    targetNutrition: dailyNeeds,
  };
}

// ==================== 辅助函数 ====================

// 格式化营养素显示
export function formatNutrition(value: number): string {
  return `${Math.round(value)}g`;
}

// 计算调整建议
export function getAdjustmentAdvice(weightRecords: { date: string; weight: number }[]): string | null {
  if (weightRecords.length < 2) return null;
  
  const sortedRecords = [...weightRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const latestWeight = sortedRecords[0].weight;
  const previousWeight = sortedRecords[1].weight;
  const diff = previousWeight - latestWeight;
  
  // 一周减重超过1kg，过快
  if (diff > 1) {
    return `掉秤过快（${diff.toFixed(1)}kg），建议每日增加${Math.round(diff * 20)}g碳水`;
  }
  
  // 一周减重小于0.3kg，偏慢
  if (diff < 0.3 && diff > 0) {
    return `掉秤偏慢（${diff.toFixed(1)}kg），建议每日减少${Math.round((0.5 - diff) * 20)}g碳水`;
  }
  
  // 体重增加
  if (diff < 0) {
    return `体重增加${Math.abs(diff).toFixed(1)}kg，建议每日减少${Math.round(Math.abs(diff) * 30)}g碳水`;
  }
  
  return '减脂进度正常，继续保持！';
}
