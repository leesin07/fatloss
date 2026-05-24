// 食材库 - 根据用户规则精简版

// 碳水类食材（每100g营养素）
export const carbIngredients = [
  // 早餐固定
  { id: 'carb_oatmeal', name: '燕麦', category: 'carb', carbs: 66, protein: 17, fat: 7, calories: 391 },
  
  // 午餐唯一选择
  { id: 'carb_rice', name: '米饭', category: 'carb', carbs: 25, protein: 2.6, fat: 0.3, calories: 116 },
  
  // 晚餐选择（4选1）
  { id: 'carb_sweet_potato', name: '红薯', category: 'carb', carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 'carb_purple_potato', name: '紫薯', category: 'carb', carbs: 18, protein: 1.4, fat: 0.2, calories: 82 },
  { id: 'carb_potato', name: '土豆', category: 'carb', carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  { id: 'carb_pumpkin', name: '贝贝南瓜', category: 'carb', carbs: 10, protein: 1.2, fat: 0.1, calories: 46 },
];

// 蛋白质类食材（每100g营养素）
export const proteinIngredients = [
  // 早餐固定
  { id: 'protein_egg', name: '鸡蛋', category: 'protein', carbs: 1, protein: 13, fat: 11, calories: 155 },
  
  // 午餐/晚餐选择（7选1）
  { id: 'protein_basa', name: '巴沙鱼', category: 'protein', carbs: 0, protein: 18, fat: 1, calories: 81 },
  { id: 'protein_flounder', name: '龙利鱼', category: 'protein', carbs: 0, protein: 17, fat: 2, calories: 88 },
  { id: 'protein_chicken_thigh', name: '鸡腿肉', category: 'protein', carbs: 0, protein: 20, fat: 10, calories: 170 },
  { id: 'protein_chicken_breast', name: '鸡胸肉', category: 'protein', carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 'protein_beef_lean', name: '牛肉', category: 'protein', carbs: 0, protein: 26, fat: 10, calories: 190 },
  { id: 'protein_shrimp', name: '虾仁', category: 'protein', carbs: 0, protein: 24, fat: 0.6, calories: 100 },
  { id: 'protein_tofu', name: '豆腐', category: 'protein', carbs: 3, protein: 8, fat: 4, calories: 80 },
];

// 脂肪类食材（每100g营养素）
export const fatIngredients = [
  { id: 'fat_olive_oil', name: '橄榄油', category: 'fat', carbs: 0, protein: 0, fat: 100, calories: 900 },
];

// 坚果类食材（每100g营养素）- 用于补充脂肪
export const nutIngredients = [
  { id: 'nut_almond', name: '杏仁', category: 'nut', carbs: 20, protein: 21, fat: 50, calories: 579 },
  { id: 'nut_walnut', name: '核桃', category: 'nut', carbs: 14, protein: 15, fat: 65, calories: 654 },
];

// 早餐固定食材
export const breakfastExtras = [
  { id: 'extra_pumpkin_seed', name: '南瓜子', category: 'extra', carbs: 4.9, protein: 30, fat: 48, calories: 559 },
  { id: 'extra_blueberry', name: '蓝莓', category: 'extra', carbs: 14, protein: 0.7, fat: 0.3, calories: 61 },
];

// 蔬菜类食材（每100g营养素）- 午餐/晚餐选择
export const vegetableIngredients = [
  { id: 'veg_broccoli', name: '西兰花', category: 'vegetable', carbs: 3, protein: 3, fat: 0.3, calories: 26 },
  { id: 'veg_cauliflower', name: '菜花', category: 'vegetable', carbs: 3, protein: 2, fat: 0.2, calories: 21 },
  { id: 'veg_spinach', name: '菠菜', category: 'vegetable', carbs: 2, protein: 2.6, fat: 0.3, calories: 21 },
  { id: 'veg_amaranth', name: '苋菜', category: 'vegetable', carbs: 4, protein: 2.8, fat: 0.4, calories: 30 },
  { id: 'veg_king_oyster', name: '杏鲍菇', category: 'vegetable', carbs: 6, protein: 1.3, fat: 0.1, calories: 30 },
  { id: 'veg_oyster_mushroom', name: '平菇', category: 'vegetable', carbs: 4, protein: 2.5, fat: 0.3, calories: 27 },
  { id: 'veg_white_mushroom', name: '白蘑', category: 'vegetable', carbs: 3, protein: 3.5, fat: 0.2, calories: 27 },
  { id: 'veg_asparagus', name: '芦笋', category: 'vegetable', carbs: 3, protein: 2, fat: 0.1, calories: 21 },
  { id: 'veg_qingcai', name: '青菜', category: 'vegetable', carbs: 2, protein: 1.5, fat: 0.2, calories: 15 },
  { id: 'veg_baby_cabbage', name: '娃娃菜', category: 'vegetable', carbs: 2, protein: 1.3, fat: 0.1, calories: 14 },
  { id: 'veg_carrot', name: '红萝卜', category: 'vegetable', carbs: 8, protein: 1, fat: 0.2, calories: 38 },
  { id: 'veg_bell_pepper', name: '彩椒', category: 'vegetable', carbs: 5, protein: 1, fat: 0.2, calories: 24 },
  { id: 'veg_tomato', name: '西红柿', category: 'vegetable', carbs: 3, protein: 0.9, fat: 0.2, calories: 15 },
];

// 所有食材合并（方便查找）
export const allIngredients = [
  ...carbIngredients,
  ...proteinIngredients,
  ...fatIngredients,
  ...nutIngredients,
  ...breakfastExtras,
  ...vegetableIngredients,
];

// 根据ID获取食材
export function getIngredientById(id: string) {
  return allIngredients.find(item => item.id === id);
}

// 晚餐碳水选项ID列表
export const dinnerCarbIds = ['carb_sweet_potato', 'carb_purple_potato', 'carb_potato', 'carb_pumpkin'];

// 午餐/晚餐蛋白质选项ID列表
export const mealProteinIds = [
  'protein_basa', 'protein_flounder', 'protein_chicken_thigh', 
  'protein_chicken_breast', 'protein_beef_lean', 'protein_shrimp', 'protein_tofu'
];

// 午餐/晚餐蔬菜选项ID列表
export const mealVegetableIds = [
  'veg_broccoli', 'veg_cauliflower', 'veg_spinach', 'veg_amaranth',
  'veg_king_oyster', 'veg_oyster_mushroom', 'veg_white_mushroom',
  'veg_asparagus', 'veg_qingcai', 'veg_baby_cabbage', 
  'veg_carrot', 'veg_bell_pepper', 'veg_tomato'
];
