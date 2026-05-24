// 预设食谱库 - 基于中国膳食指南
// 早餐15种、午餐15种、晚餐15种

export interface Ingredient {
  name: string;
  weight: number;
  unit: string;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: Ingredient[];
  nutrition: {
    carbs: number;    // 碳水 (g)
    protein: number;  // 蛋白质 (g)
    fat: number;      // 脂肪 (g)
    calories: number; // 热量 (kcal)
  };
  tags: string[];
  allergens: string[];
}

export interface MealDatabase {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
}

export const mealDatabase: MealDatabase = {
  breakfast: [
    {
      id: "b001",
      name: "燕麦鸡蛋牛奶",
      ingredients: [
        { name: "燕麦片", weight: 50, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "牛奶", weight: 250, unit: "ml" },
      ],
      nutrition: { carbs: 48, protein: 18, fat: 12, calories: 370 },
      tags: ["快手", "高蛋白"],
      allergens: ["蛋", "奶"]
    },
    {
      id: "b002",
      name: "全麦面包牛奶鸡蛋",
      ingredients: [
        { name: "全麦面包", weight: 70, unit: "g（约2片）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "牛奶", weight: 250, unit: "ml" },
      ],
      nutrition: { carbs: 52, protein: 20, fat: 14, calories: 410 },
      tags: ["快手", "经典"],
      allergens: ["蛋", "奶", "麸质"]
    },
    {
      id: "b003",
      name: "杂粮粥煮鸡蛋",
      ingredients: [
        { name: "杂粮米", weight: 50, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "小菜", weight: 50, unit: "g" },
      ],
      nutrition: { carbs: 42, protein: 14, fat: 8, calories: 290 },
      tags: ["中式", "养胃"],
      allergens: ["蛋"]
    },
    {
      id: "b004",
      name: "紫薯牛奶鸡蛋",
      ingredients: [
        { name: "紫薯", weight: 150, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "牛奶", weight: 250, unit: "ml" },
      ],
      nutrition: { carbs: 55, protein: 18, fat: 12, calories: 400 },
      tags: ["快手", "高纤维"],
      allergens: ["蛋", "奶"]
    },
    {
      id: "b005",
      name: "玉米鸡蛋豆浆",
      ingredients: [
        { name: "玉米", weight: 200, unit: "g（约1根）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "豆浆", weight: 300, unit: "ml" },
      ],
      nutrition: { carbs: 48, protein: 16, fat: 10, calories: 340 },
      tags: ["中式", "低脂"],
      allergens: ["蛋", "大豆"]
    },
    {
      id: "b006",
      name: "小米粥煮鸡蛋",
      ingredients: [
        { name: "小米", weight: 50, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "小菜", weight: 50, unit: "g" },
      ],
      nutrition: { carbs: 40, protein: 14, fat: 7, calories: 275 },
      tags: ["中式", "养胃"],
      allergens: ["蛋"]
    },
    {
      id: "b007",
      name: "红薯牛奶",
      ingredients: [
        { name: "红薯", weight: 200, unit: "g" },
        { name: "牛奶", weight: 250, unit: "ml" },
        { name: "核桃", weight: 15, unit: "g（约3个）" },
      ],
      nutrition: { carbs: 58, protein: 12, fat: 14, calories: 400 },
      tags: ["快手", "高纤维"],
      allergens: ["奶", "坚果"]
    },
    {
      id: "b008",
      name: "鸡蛋三明治",
      ingredients: [
        { name: "全麦面包", weight: 70, unit: "g（约2片）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "生菜", weight: 30, unit: "g" },
        { name: "番茄", weight: 50, unit: "g" },
      ],
      nutrition: { carbs: 45, protein: 16, fat: 10, calories: 330 },
      tags: ["快手", "西式"],
      allergens: ["蛋", "麸质"]
    },
    {
      id: "b009",
      name: "馒头鸡蛋豆浆",
      ingredients: [
        { name: "馒头", weight: 80, unit: "g（约1个）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "豆浆", weight: 300, unit: "ml" },
      ],
      nutrition: { carbs: 52, protein: 16, fat: 8, calories: 340 },
      tags: ["中式", "经典"],
      allergens: ["蛋", "大豆", "麸质"]
    },
    {
      id: "b010",
      name: "南瓜小米粥鸡蛋",
      ingredients: [
        { name: "南瓜", weight: 100, unit: "g" },
        { name: "小米", weight: 40, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
      ],
      nutrition: { carbs: 45, protein: 14, fat: 7, calories: 295 },
      tags: ["中式", "养胃"],
      allergens: ["蛋"]
    },
    {
      id: "b011",
      name: "酸奶燕麦水果",
      ingredients: [
        { name: "燕麦片", weight: 40, unit: "g" },
        { name: "酸奶", weight: 150, unit: "g" },
        { name: "香蕉", weight: 100, unit: "g（约1根）" },
      ],
      nutrition: { carbs: 55, protein: 12, fat: 8, calories: 340 },
      tags: ["快手", "西式"],
      allergens: ["奶"]
    },
    {
      id: "b012",
      name: "花卷鸡蛋豆浆",
      ingredients: [
        { name: "花卷", weight: 80, unit: "g（约1个）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "豆浆", weight: 300, unit: "ml" },
      ],
      nutrition: { carbs: 50, protein: 16, fat: 9, calories: 345 },
      tags: ["中式", "经典"],
      allergens: ["蛋", "大豆", "麸质"]
    },
    {
      id: "b013",
      name: "山药红枣粥鸡蛋",
      ingredients: [
        { name: "山药", weight: 100, unit: "g" },
        { name: "大米", weight: 30, unit: "g" },
        { name: "红枣", weight: 15, unit: "g（约3颗）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
      ],
      nutrition: { carbs: 48, protein: 14, fat: 7, calories: 310 },
      tags: ["中式", "养生"],
      allergens: ["蛋"]
    },
    {
      id: "b014",
      name: "藕粉鸡蛋",
      ingredients: [
        { name: "藕粉", weight: 40, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "坚果碎", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 42, protein: 14, fat: 9, calories: 300 },
      tags: ["中式", "快手"],
      allergens: ["蛋", "坚果"]
    },
    {
      id: "b015",
      name: "面包花生酱牛奶",
      ingredients: [
        { name: "全麦面包", weight: 70, unit: "g（约2片）" },
        { name: "花生酱", weight: 15, unit: "g" },
        { name: "牛奶", weight: 250, unit: "ml" },
        { name: "苹果", weight: 100, unit: "g（约半个）" },
      ],
      nutrition: { carbs: 55, protein: 16, fat: 16, calories: 420 },
      tags: ["快手", "西式"],
      allergens: ["奶", "花生", "麸质"]
    },
  ],

  lunch: [
    {
      id: "l001",
      name: "米饭青椒鸡胸肉",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡胸肉", weight: 100, unit: "g" },
        { name: "青椒", weight: 100, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 31, fat: 12, calories: 450 },
      tags: ["经典", "高蛋白"],
      allergens: []
    },
    {
      id: "l002",
      name: "米饭番茄炒蛋",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡蛋", weight: 60, unit: "g（约1个）" },
        { name: "番茄", weight: 150, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 18, fat: 14, calories: 420 },
      tags: ["经典", "快手"],
      allergens: ["蛋"]
    },
    {
      id: "l003",
      name: "米饭红烧豆腐",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "豆腐", weight: 150, unit: "g" },
        { name: "青菜", weight: 100, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 18, fat: 14, calories: 410 },
      tags: ["素食", "低脂"],
      allergens: ["大豆"]
    },
    {
      id: "l004",
      name: "面条酱牛肉黄瓜",
      ingredients: [
        { name: "面条", weight: 120, unit: "g（干重）" },
        { name: "酱牛肉", weight: 80, unit: "g" },
        { name: "黄瓜", weight: 100, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 60, protein: 26, fat: 10, calories: 430 },
      tags: ["快手", "高蛋白"],
      allergens: ["麸质"]
    },
    {
      id: "l005",
      name: "米饭清蒸鱼青菜",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鲈鱼", weight: 120, unit: "g" },
        { name: "青菜", weight: 150, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 28, fat: 8, calories: 405 },
      tags: ["清淡", "高蛋白"],
      allergens: ["鱼"]
    },
    {
      id: "l006",
      name: "米饭蒜苔炒肉",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "猪瘦肉", weight: 80, unit: "g" },
        { name: "蒜苔", weight: 120, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 25, fat: 14, calories: 445 },
      tags: ["经典", "下饭"],
      allergens: []
    },
    {
      id: "l007",
      name: "米饭宫保鸡丁",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡胸肉", weight: 100, unit: "g" },
        { name: "花生", weight: 15, unit: "g" },
        { name: "黄瓜丁", weight: 50, unit: "g" },
        { name: "油", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 32, fat: 16, calories: 490 },
      tags: ["经典", "高蛋白"],
      allergens: ["花生"]
    },
    {
      id: "l008",
      name: "米饭土豆炖牛肉",
      ingredients: [
        { name: "米饭", weight: 130, unit: "g" },
        { name: "牛腩", weight: 80, unit: "g" },
        { name: "土豆", weight: 100, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 58, protein: 26, fat: 15, calories: 480 },
      tags: ["经典", "暖胃"],
      allergens: []
    },
    {
      id: "l009",
      name: "米饭麻婆豆腐",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "豆腐", weight: 150, unit: "g" },
        { name: "肉末", weight: 30, unit: "g" },
        { name: "油", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 20, fat: 16, calories: 445 },
      tags: ["经典", "下饭"],
      allergens: ["大豆"]
    },
    {
      id: "l010",
      name: "杂粮饭西兰花虾仁",
      ingredients: [
        { name: "杂粮饭", weight: 150, unit: "g" },
        { name: "虾仁", weight: 100, unit: "g" },
        { name: "西兰花", weight: 150, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 52, protein: 28, fat: 8, calories: 395 },
      tags: ["低脂", "高蛋白"],
      allergens: ["虾"]
    },
    {
      id: "l011",
      name: "米饭白灼菜心鸡腿",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡腿肉", weight: 100, unit: "g" },
        { name: "菜心", weight: 150, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 28, fat: 12, calories: 435 },
      tags: ["清淡", "高蛋白"],
      allergens: []
    },
    {
      id: "l012",
      name: "米饭木须肉",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "猪瘦肉", weight: 60, unit: "g" },
        { name: "木耳", weight: 10, unit: "g（干）" },
        { name: "黄瓜", weight: 50, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 24, fat: 14, calories: 440 },
      tags: ["经典", "营养均衡"],
      allergens: ["蛋"]
    },
    {
      id: "l013",
      name: "馒头炖排骨",
      ingredients: [
        { name: "馒头", weight: 80, unit: "g（约1个）" },
        { name: "排骨", weight: 100, unit: "g" },
        { name: "土豆", weight: 80, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 52, protein: 24, fat: 18, calories: 470 },
      tags: ["经典", "暖胃"],
      allergens: ["麸质"]
    },
    {
      id: "l014",
      name: "米饭香菇滑鸡",
      ingredients: [
        { name: "米饭", weight: 150, unit: "g（约1碗）" },
        { name: "鸡腿肉", weight: 100, unit: "g" },
        { name: "香菇", weight: 50, unit: "g" },
        { name: "青菜", weight: 100, unit: "g" },
        { name: "油", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 55, protein: 28, fat: 13, calories: 450 },
      tags: ["经典", "鲜美"],
      allergens: []
    },
    {
      id: "l015",
      name: "炒面鸡蛋蔬菜",
      ingredients: [
        { name: "面条", weight: 120, unit: "g（干重）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "豆芽", weight: 80, unit: "g" },
        { name: "韭菜", weight: 30, unit: "g" },
        { name: "油", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 62, protein: 18, fat: 15, calories: 455 },
      tags: ["快手", "经典"],
      allergens: ["蛋", "麸质"]
    },
  ],

  dinner: [
    {
      id: "d001",
      name: "小米粥鸡蛋小菜",
      ingredients: [
        { name: "小米", weight: 40, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "凉拌黄瓜", weight: 100, unit: "g" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 35, protein: 14, fat: 7, calories: 260 },
      tags: ["清淡", "养胃"],
      allergens: ["蛋"]
    },
    {
      id: "d002",
      name: "杂粮粥豆腐小菜",
      ingredients: [
        { name: "杂粮米", weight: 40, unit: "g" },
        { name: "豆腐", weight: 100, unit: "g" },
        { name: "小菜", weight: 50, unit: "g" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 35, protein: 14, fat: 9, calories: 275 },
      tags: ["清淡", "低脂"],
      allergens: ["大豆"]
    },
    {
      id: "d003",
      name: "蔬菜沙拉鸡胸肉",
      ingredients: [
        { name: "鸡胸肉", weight: 100, unit: "g" },
        { name: "生菜", weight: 80, unit: "g" },
        { name: "番茄", weight: 100, unit: "g" },
        { name: "黄瓜", weight: 50, unit: "g" },
        { name: "沙拉酱", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 12, protein: 28, fat: 10, calories: 255 },
      tags: ["西式", "低碳水"],
      allergens: []
    },
    {
      id: "d004",
      name: "蒸红薯酸奶坚果",
      ingredients: [
        { name: "红薯", weight: 150, unit: "g" },
        { name: "酸奶", weight: 100, unit: "g" },
        { name: "坚果", weight: 10, unit: "g" },
      ],
      nutrition: { carbs: 38, protein: 10, fat: 10, calories: 280 },
      tags: ["快手", "高纤维"],
      allergens: ["奶", "坚果"]
    },
    {
      id: "d005",
      name: "蒸蛋羹小馒头",
      ingredients: [
        { name: "鸡蛋", weight: 60, unit: "g（约1个）" },
        { name: "小馒头", weight: 50, unit: "g（约1个）" },
        { name: "小菜", weight: 50, unit: "g" },
      ],
      nutrition: { carbs: 32, protein: 16, fat: 9, calories: 270 },
      tags: ["清淡", "养胃"],
      allergens: ["蛋", "麸质"]
    },
    {
      id: "d006",
      name: "玉米鸡蛋小菜",
      ingredients: [
        { name: "玉米", weight: 150, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "凉拌菜", weight: 80, unit: "g" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 35, protein: 14, fat: 7, calories: 260 },
      tags: ["清淡", "低脂"],
      allergens: ["蛋"]
    },
    {
      id: "d007",
      name: "紫薯牛奶",
      ingredients: [
        { name: "紫薯", weight: 150, unit: "g" },
        { name: "牛奶", weight: 200, unit: "ml" },
        { name: "全麦面包", weight: 35, unit: "g（约1片）" },
      ],
      nutrition: { carbs: 45, protein: 12, fat: 10, calories: 320 },
      tags: ["快手", "高纤维"],
      allergens: ["奶", "麸质"]
    },
    {
      id: "d008",
      name: "蔬菜豆腐汤",
      ingredients: [
        { name: "豆腐", weight: 100, unit: "g" },
        { name: "小白菜", weight: 100, unit: "g" },
        { name: "香菇", weight: 30, unit: "g" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 8, protein: 14, fat: 8, calories: 160 },
      tags: ["清淡", "低卡"],
      allergens: ["大豆"]
    },
    {
      id: "d009",
      name: "山药红枣粥",
      ingredients: [
        { name: "山药", weight: 100, unit: "g" },
        { name: "大米", weight: 30, unit: "g" },
        { name: "红枣", weight: 15, unit: "g（约3颗）" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
      ],
      nutrition: { carbs: 42, protein: 14, fat: 7, calories: 285 },
      tags: ["养生", "养胃"],
      allergens: ["蛋"]
    },
    {
      id: "d010",
      name: "南瓜粥鸡蛋",
      ingredients: [
        { name: "南瓜", weight: 120, unit: "g" },
        { name: "小米", weight: 30, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
      ],
      nutrition: { carbs: 38, protein: 14, fat: 6, calories: 260 },
      tags: ["养胃", "清淡"],
      allergens: ["蛋"]
    },
    {
      id: "d011",
      name: "藕粉鸡蛋",
      ingredients: [
        { name: "藕粉", weight: 35, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "坚果碎", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 36, protein: 14, fat: 8, calories: 270 },
      tags: ["快手", "中式"],
      allergens: ["蛋", "坚果"]
    },
    {
      id: "d012",
      name: "西兰花虾仁",
      ingredients: [
        { name: "虾仁", weight: 80, unit: "g" },
        { name: "西兰花", weight: 150, unit: "g" },
        { name: "玉米", weight: 80, unit: "g" },
        { name: "油", weight: 5, unit: "g" },
      ],
      nutrition: { carbs: 20, protein: 24, fat: 8, calories: 250 },
      tags: ["低碳水", "高蛋白"],
      allergens: ["虾"]
    },
    {
      id: "d013",
      name: "菠菜蛋花汤全麦面包",
      ingredients: [
        { name: "菠菜", weight: 100, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "全麦面包", weight: 35, unit: "g（约1片）" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 28, protein: 16, fat: 8, calories: 250 },
      tags: ["清淡", "快手"],
      allergens: ["蛋", "麸质"]
    },
    {
      id: "d014",
      name: "番茄蛋汤小花卷",
      ingredients: [
        { name: "番茄", weight: 150, unit: "g" },
        { name: "鸡蛋", weight: 50, unit: "g（约1个）" },
        { name: "小花卷", weight: 50, unit: "g（约1个）" },
        { name: "油", weight: 3, unit: "g" },
      ],
      nutrition: { carbs: 32, protein: 14, fat: 8, calories: 255 },
      tags: ["清淡", "经典"],
      allergens: ["蛋", "麸质"]
    },
    {
      id: "d015",
      name: "酸奶水果燕麦",
      ingredients: [
        { name: "酸奶", weight: 150, unit: "g" },
        { name: "燕麦片", weight: 30, unit: "g" },
        { name: "苹果", weight: 100, unit: "g（约半个）" },
        { name: "坚果", weight: 8, unit: "g" },
      ],
      nutrition: { carbs: 40, protein: 12, fat: 10, calories: 295 },
      tags: ["快手", "西式"],
      allergens: ["奶", "坚果"]
    },
  ],
};

// 获取所有过敏原列表
export const allAllergens = [
  { id: "蛋", name: "蛋类" },
  { id: "奶", name: "乳制品" },
  { id: "大豆", name: "大豆" },
  { id: "麸质", name: "麸质（小麦等）" },
  { id: "花生", name: "花生" },
  { id: "坚果", name: "坚果" },
  { id: "鱼", name: "鱼类" },
  { id: "虾", name: "虾蟹" },
];
