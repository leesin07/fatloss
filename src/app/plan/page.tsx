'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateDailyNeeds, generateMealPlan, DayPlan, Meal, MealIngredient } from '@/lib/mealPlanner';

export default function PlanPage() {
  const router = useRouter();
  const [needs, setNeeds] = useState<{ carbs: number; protein: number; fat: number } | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 从 localStorage 获取计算结果
    const savedNeeds = localStorage.getItem('nutritionNeeds');
    const savedGender = localStorage.getItem('userGender');
    
    if (savedNeeds) {
      const parsedNeeds = JSON.parse(savedNeeds);
      setNeeds(parsedNeeds);
      
      if (savedGender) {
        setGender(savedGender as 'male' | 'female');
      }
      
      // 生成饮食方案
      const result = generateMealPlan(parsedNeeds, savedGender as 'male' | 'female' || 'male', 10);
      setPlans(result.days);
      
      // 保存方案到 localStorage
      localStorage.setItem('mealPlans', JSON.stringify(result.days));
      localStorage.setItem('targetNutrition', JSON.stringify(result.targetNutrition));
    }
    setLoading(false);
  }, []);

  // 收藏方案
  const savePlan = () => {
    if (!needs || plans.length === 0) return;
    
    const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
    const newPlan = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-CN'),
      carbs: needs.carbs,
      protein: needs.protein,
      fat: needs.fat,
      gender: gender,
      period: 10,
      plans: plans
    };
    savedPlans.unshift(newPlan);
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans.slice(0, 10)));
    setSaved(true);
  };

  const currentPlan = plans[selectedDay - 1];

  // 渲染单餐卡片
  const renderMealCard = (meal: Meal, title: string, icon: string) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        
        {/* 食材列表 */}
        <div className="space-y-2">
          {meal.items.map((item: MealIngredient, index: number) => {
            const categoryColors: Record<string, string> = {
              carb: 'bg-amber-100 text-amber-700',
              protein: 'bg-red-100 text-red-700',
              vegetable: 'bg-green-100 text-green-700',
              fat: 'bg-yellow-100 text-yellow-700',
              extra: 'bg-purple-100 text-purple-700',
            };
            const categoryLabels: Record<string, string> = {
              carb: '碳水',
              protein: '蛋白质',
              vegetable: '蔬菜',
              fat: '油脂',
              extra: '其他',
            };
            const colorClass = categoryColors[item.ingredient.category] || 'bg-gray-100 text-gray-700';
            const label = categoryLabels[item.ingredient.category] || '食材';
            
            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${colorClass} px-2 py-0.5 rounded`}>{label}</span>
                  <span className="text-gray-700">{item.ingredient.name}</span>
                </div>
                <span className="font-medium text-gray-900">{Math.round(item.grams)}g</span>
              </div>
            );
          })}
        </div>
        
        {/* 营养素汇总 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>碳水 {Math.round(meal.totalNutrition.carbs)}g</span>
            <span>蛋白质 {Math.round(meal.totalNutrition.protein)}g</span>
            <span>脂肪 {Math.round(meal.totalNutrition.fat)}g</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">正在生成饮食方案...</div>
      </div>
    );
  }

  if (!needs || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-gray-500 mb-4">请先计算每日营养素需求</div>
        <button
          onClick={() => router.push('/calculator')}
          className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium"
        >
          去计算
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部：每日营养素目标 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 pt-12">
        <h1 className="text-lg font-semibold mb-3 text-center">10天饮食方案</h1>
        <div className="text-center mb-2">
          <span className="text-green-100 text-sm">每日建议摄入</span>
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-bold text-xl">{needs.carbs}g</div>
            <div className="text-green-100 text-xs">碳水</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl">{needs.protein}g</div>
            <div className="text-green-100 text-xs">蛋白质</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl">{needs.fat}g</div>
            <div className="text-green-100 text-xs">脂肪</div>
          </div>
        </div>
      </div>

      {/* 日期导航 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center px-2 py-2">
          <button
            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
            disabled={selectedDay === 1}
            className="p-2 text-gray-400 disabled:opacity-30"
          >
            ◀
          </button>
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 px-2">
              {plans.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx + 1)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    selectedDay === idx + 1
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(Math.min(plans.length, selectedDay + 1))}
            disabled={selectedDay === plans.length}
            className="p-2 text-gray-400 disabled:opacity-30"
          >
            ▶
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 pb-2">
          第 {selectedDay} 天
        </div>
        
        {/* 收藏按钮 */}
        <div className="px-4 pb-3">
          <button
            onClick={savePlan}
            disabled={saved}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              saved 
                ? 'bg-green-100 text-green-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {saved ? '✓ 已收藏' : '❤️ 收藏此方案'}
          </button>
        </div>
      </div>

      {/* 当日方案 */}
      {currentPlan && (
        <div className="p-4 space-y-4">
          {/* 当日营养素汇总 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">今日营养素</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-amber-600">{Math.round(currentPlan.totalNutrition.carbs)}g</div>
                <div className="text-xs text-gray-400">碳水</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{Math.round(currentPlan.totalNutrition.protein)}g</div>
                <div className="text-xs text-gray-400">蛋白质</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-600">{Math.round(currentPlan.totalNutrition.fat)}g</div>
                <div className="text-xs text-gray-400">脂肪</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{currentPlan.salt}</div>
                <div className="text-xs text-gray-400">盐</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">所有食材重量均为生重</p>
          </div>

          {/* 三餐 */}
          {renderMealCard(currentPlan.breakfast, '早餐', '🌅')}
          {renderMealCard(currentPlan.lunch, '午餐', '☀️')}
          {renderMealCard(currentPlan.dinner, '晚餐', '🌙')}
        </div>
      )}
    </div>
  );
}
