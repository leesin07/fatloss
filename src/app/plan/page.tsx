'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface NutrientsData {
  weight: string;
  exercise: string;
  gender: 'male' | 'female' | null;
  format: 'raw' | 'cooked';
  preference: string;
  carbs: number;
  protein: number;
  fat: number;
}

interface FoodItem {
  name: string;
  amount: string;
  calories?: number;
}

interface MealData {
  name: string;
  calories: number;
  foods: FoodItem[];
}

interface DayPlan {
  day: number;
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  totalCalories: number;
}

export default function PlanPage() {
  const router = useRouter();
  const [nutrients, setNutrients] = useState<NutrientsData | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentNutrients');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setNutrients(data);
        generatePlan(data);
      } catch {
        router.push('/calculator');
      }
    } else {
      router.push('/calculator');
    }
  }, [router]);

  const generatePlan = async (data?: NutrientsData) => {
    const nutrientData = data || nutrients;
    if (!nutrientData) return;

    setIsLoading(true);
    setPlan('');
    setSaved(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nutrientData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let accumulatedPlan = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedPlan += parsed.content;
                setPlan(accumulatedPlan);
              }
              if (parsed.error) {
                setPlan(`❌ ${parsed.error}`);
              }
            } catch { /* ignore */ }
          }
        }
      }

      if (accumulatedPlan && nutrientData) {
        savePlanToStorage(nutrientData, accumulatedPlan);
        setSaved(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setPlan('生成失败，请点击重新生成');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlanToStorage = (data: NutrientsData, planContent: string) => {
    const planRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight: data.weight,
      gender: data.gender,
      format: data.format,
      carbs: data.carbs,
      protein: data.protein,
      fat: data.fat,
      plan: planContent,
    };

    const plans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
    plans.unshift(planRecord);
    localStorage.setItem('mealPlans', JSON.stringify(plans.slice(0, 50)));
  };

  const handleCopy = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // 解析方案文本，提取每天的数据
  const parsePlan = (text: string): DayPlan[] => {
    const days: DayPlan[] = [];
    const dayPattern = /第\s*(\d+)\s*天[：:]/g;
    let match;
    
    const dayPositions: { day: number; start: number }[] = [];
    while ((match = dayPattern.exec(text)) !== null) {
      dayPositions.push({ day: parseInt(match[1]), start: match.index });
    }

    for (let i = 0; i < dayPositions.length; i++) {
      const current = dayPositions[i];
      const next = dayPositions[i + 1];
      const dayContent = text.slice(current.start, next?.start);

      const parseMeal = (content: string, mealName: string): MealData => {
        const mealMatch = content.match(new RegExp(`${mealName}[：:]\\s*([\\s\\S]*?)(?=(?:早|午|晚)[餐食]|第\\s*\\d+\\s*天|$)`));
        if (!mealMatch) return { name: mealName, calories: 0, foods: [] };
        
        const mealText = mealMatch[1];
        const foods: FoodItem[] = [];
        
        // 提取食物项
        const foodPattern = /(?:[-•*]\s*)?([^：:\n]+)[：:]\s*(\d+\.?\d*\s*(?:克|g|ml|毫升|大碗|中碗|小碗|个|片|只|条))/gi;
        let foodMatch;
        while ((foodMatch = foodPattern.exec(mealText)) !== null) {
          foods.push({
            name: foodMatch[1].trim(),
            amount: foodMatch[2],
          });
        }

        // 如果没有匹配到，尝试其他格式
        if (foods.length === 0) {
          const lines = mealText.split('\n').filter(l => l.trim());
          for (const line of lines) {
            const cleanLine = line.replace(/^[-•*]\s*/, '');
            if (cleanLine && !cleanLine.includes('做法') && !cleanLine.includes('步骤')) {
              foods.push({ name: cleanLine, amount: '' });
            }
          }
        }

        return { name: mealName, calories: 0, foods };
      };

      const breakfast = parseMeal(dayContent, '早餐');
      const lunch = parseMeal(dayContent, '午餐');
      const dinner = parseMeal(dayContent, '晚餐');

      days.push({
        day: current.day,
        breakfast,
        lunch,
        dinner,
        totalCalories: 0,
      });
    }

    return days;
  };

  const mealPlans = plan ? parsePlan(plan) : [];

  // 获取当前选中天的数据
  const currentDayPlan = mealPlans.find(d => d.day === selectedDay);

  // 食物图标映射
  const getFoodEmoji = (name: string): string => {
    if (name.includes('蛋')) return '🥚';
    if (name.includes('鸡') || name.includes('鸭')) return '🍗';
    if (name.includes('鱼') || name.includes('虾') || name.includes('海鲜')) return '🐟';
    if (name.includes('牛')) return '🥩';
    if (name.includes('猪')) return '🥓';
    if (name.includes('米') || name.includes('饭') || name.includes('粥')) return '🍚';
    if (name.includes('面') || name.includes('粉')) return '🍜';
    if (name.includes('豆') || name.includes('豆浆')) return '🥛';
    if (name.includes('蔬菜') || name.includes('青菜') || name.includes('菠菜')) return '🥬';
    if (name.includes('西红柿') || name.includes('番茄')) return '🍅';
    if (name.includes('黄瓜')) return '🥒';
    if (name.includes('玉米')) return '🌽';
    if (name.includes('土豆') || name.includes('马铃薯')) return '🥔';
    if (name.includes('水果') || name.includes('苹果')) return '🍎';
    if (name.includes('香蕉')) return '🍌';
    if (name.includes('燕麦')) return '🥣';
    if (name.includes('牛奶') || name.includes('奶')) return '🥛';
    if (name.includes('面包')) return '🍞';
    if (name.includes('油')) return '🫒';
    return '🍽️';
  };

  // 餐次图标
  const mealIcons: Record<string, string> = {
    '早餐': '🌅',
    '午餐': '☀️',
    '晚餐': '🌙',
  };

  // 滚动日期栏
  const scrollDays = (direction: 'left' | 'right') => {
    if (dayScrollRef.current) {
      const scrollAmount = 200;
      dayScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!nutrients) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-28">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card shadow-sm">
        <div className="flex h-12 items-center px-4">
          <Link href="/calculator" className="flex items-center text-gray-600 dark:text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-center font-semibold">饮食方案</h1>
          <div className="flex gap-1">
            {plan && !isLoading && (
              <>
                <button onClick={() => generatePlan()} className="p-2">
                  <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={handleCopy} className="p-2">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 营养素概览卡片 */}
      <div className="bg-white dark:bg-card mx-4 mt-4 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">每日营养目标</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            nutrients.format === 'raw'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
          }`}>
            {nutrients.format === 'raw' ? '生重' : '熟重'}
          </span>
        </div>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{nutrients.carbs}g</div>
            <div className="text-xs text-gray-500">碳水</div>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{nutrients.protein}g</div>
            <div className="text-xs text-gray-500">蛋白质</div>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{nutrients.fat}g</div>
            <div className="text-xs text-gray-500">脂肪</div>
          </div>
        </div>
      </div>

      {/* 生成中状态 */}
      {isLoading && !plan && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">AI 正在为你生成方案...</p>
          <p className="mt-2 text-sm text-gray-400">10天饮食方案，让每顿饭都有新选择</p>
        </div>
      )}

      {/* 日期选择栏 */}
      {mealPlans.length > 0 && (
        <div className="sticky top-12 z-40 bg-white dark:bg-card mt-4">
          <div className="flex items-center">
            <button 
              onClick={() => scrollDays('left')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div 
              ref={dayScrollRef}
              className="flex-1 flex gap-2 overflow-x-auto px-2 py-3 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {mealPlans.map((dayPlan) => (
                <button
                  key={dayPlan.day}
                  onClick={() => setSelectedDay(dayPlan.day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDay === dayPlan.day
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  第{dayPlan.day}天
                </button>
              ))}
            </div>
            <button 
              onClick={() => scrollDays('right')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 当日食谱详情 */}
      {currentDayPlan && (
        <div className="px-4 py-4 space-y-4">
          {/* 早餐 */}
          <MealSection 
            title="早餐" 
            icon={mealIcons['早餐']}
            foods={currentDayPlan.breakfast.foods}
          />
          
          {/* 午餐 */}
          <MealSection 
            title="午餐" 
            icon={mealIcons['午餐']}
            foods={currentDayPlan.lunch.foods}
          />
          
          {/* 晚餐 */}
          <MealSection 
            title="晚餐" 
            icon={mealIcons['晚餐']}
            foods={currentDayPlan.dinner.foods}
          />
        </div>
      )}

      {/* 原始内容显示（解析失败时） */}
      {plan && mealPlans.length === 0 && !isLoading && (
        <div className="px-4 py-4">
          <Card>
            <CardContent className="py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {plan}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 底部提示 */}
      {plan && !isLoading && (
        <div className="px-4 mt-2">
          <p className="text-xs text-center text-gray-400">
            ⚠️ 所有食材重量为【{nutrients.format === 'raw' ? '生重' : '熟重'}】
          </p>
        </div>
      )}

      {/* 底部固定操作栏 */}
      {plan && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t p-4 space-y-2">
          <Link href="/record" className="block">
            <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-base">
              📋 查看我的记录
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-12 text-base">
              <Home className="mr-2 h-5 w-5" />
              返回首页
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// 餐次组件
function MealSection({ 
  title, 
  icon, 
  foods 
}: { 
  title: string; 
  icon: string; 
  foods: FoodItem[];
}) {
  if (foods.length === 0) return null;

  return (
    <div className="bg-white dark:bg-card rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {foods.map((food, idx) => (
          <div key={idx} className="flex items-center px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl">
              {getFoodEmoji(food.name)}
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium text-sm">{food.name}</div>
              {food.amount && (
                <div className="text-xs text-gray-500 mt-0.5">{food.amount}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getFoodEmoji(name: string): string {
  if (name.includes('蛋')) return '🥚';
  if (name.includes('鸡') || name.includes('鸭')) return '🍗';
  if (name.includes('鱼') || name.includes('虾')) return '🐟';
  if (name.includes('牛')) return '🥩';
  if (name.includes('猪')) return '🥓';
  if (name.includes('米') || name.includes('饭') || name.includes('粥')) return '🍚';
  if (name.includes('面') || name.includes('粉')) return '🍜';
  if (name.includes('豆浆') || name.includes('牛奶')) return '🥛';
  if (name.includes('蔬菜') || name.includes('青菜') || name.includes('菠菜')) return '🥬';
  if (name.includes('西红柿') || name.includes('番茄')) return '🍅';
  if (name.includes('黄瓜')) return '🥒';
  if (name.includes('玉米')) return '🌽';
  if (name.includes('土豆')) return '🥔';
  if (name.includes('苹果')) return '🍎';
  if (name.includes('燕麦')) return '🥣';
  if (name.includes('面包')) return '🍞';
  if (name.includes('豆腐')) return '🧈';
  return '🍽️';
}
