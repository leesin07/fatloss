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
  FileText,
  Sun,
  CloudSun,
  Moon,
  ChevronDown,
  ChevronUp,
  Utensils,
  Flame,
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

interface MealPlan {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function PlanPage() {
  const router = useRouter();
  const [nutrients, setNutrients] = useState<NutrientsData | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const abortControllerRef = useRef<AbortController | null>(null);
  const planEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentNutrients');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log('Loaded nutrients data:', data);
        setNutrients(data);
        generatePlan(data);
      } catch (e) {
        console.error('Failed to parse nutrients data:', e);
        router.push('/calculator');
      }
    } else {
      console.log('No nutrients data found in sessionStorage');
      router.push('/calculator');
    }
  }, [router]);

  useEffect(() => {
    if (plan && planEndRef.current) {
      planEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [plan]);

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
      console.error('Error:', error);
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
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  // 解析方案文本
  const parsePlan = (text: string): MealPlan[] => {
    const days: MealPlan[] = [];
    const dayPattern = /第\s*(\d+)\s*天[：:]/g;
    let match;
    
    // 找到所有天的位置
    const dayPositions: { day: number; start: number }[] = [];
    while ((match = dayPattern.exec(text)) !== null) {
      dayPositions.push({ day: parseInt(match[1]), start: match.index });
    }

    // 提取每天的内容
    for (let i = 0; i < dayPositions.length; i++) {
      const current = dayPositions[i];
      const next = dayPositions[i + 1];
      const dayContent = text.slice(current.start, next?.start);

      const breakfastMatch = dayContent.match(/早[餐食][：:]\s*([\s\S]*?)(?=午[餐食]|晚[餐食]|$)/);
      const lunchMatch = dayContent.match(/午[餐食][：:]\s*([\s\S]*?)(?=晚[餐食]|第\s*\d+\s*天|$)/);
      const dinnerMatch = dayContent.match(/晚[餐食][：:]\s*([\s\S]*?)(?=第\s*\d+\s*天|$)/);

      days.push({
        day: current.day,
        breakfast: breakfastMatch?.[1]?.trim() || '',
        lunch: lunchMatch?.[1]?.trim() || '',
        dinner: dinnerMatch?.[1]?.trim() || '',
      });
    }

    return days;
  };

  const mealPlans = plan ? parsePlan(plan) : [];

  // 渲染单个餐次
  const MealCard = ({ 
    type, 
    content, 
    icon: Icon, 
    colorClass 
  }: { 
    type: string; 
    content: string; 
    icon: React.ElementType;
    colorClass: string;
  }) => {
    if (!content) return null;
    
    // 解析食材和做法
    const lines = content.split('\n').filter(l => l.trim());
    
    return (
      <div className={`rounded-xl p-3 ${colorClass}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{type}</span>
        </div>
        <div className="space-y-2">
          {lines.map((line, idx) => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '');
            const isTitle = cleanLine.includes('食材') && cleanLine.includes('：');
            const isRecipe = cleanLine.includes('做法') || cleanLine.includes('步骤');
            
            return (
              <div key={idx} className="text-sm leading-relaxed">
                {isTitle ? (
                  <div className="flex items-start gap-2 font-medium text-foreground">
                    <Utensils className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{cleanLine}</span>
                  </div>
                ) : isRecipe ? (
                  <div className="mt-2 pt-2 border-t border-white/30">
                    <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
                      <Flame className="h-3.5 w-3.5" />
                      <span>做法</span>
                    </div>
                    <p className="text-muted-foreground pl-5">{cleanLine.replace(/^做法[：:]?\s*/, '')}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground pl-5">{cleanLine}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!nutrients) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/calculator" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">饮食方案</h1>
          <div className="ml-auto flex gap-1">
            {plan && !isLoading && (
              <>
                <Button variant="ghost" size="sm" onClick={() => generatePlan()} title="重新生成">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy} title="复制">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-4">
        {/* 营养素概览 */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">每日营养目标</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  nutrients.format === 'raw'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                }`}>
                  {nutrients.format === 'raw' ? '生重' : '熟重'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-around text-center">
              <div className="flex flex-col items-center">
                <div className="text-xl font-bold text-orange-500">{nutrients.carbs}g</div>
                <div className="text-xs text-muted-foreground">碳水</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <div className="text-xl font-bold text-red-500">{nutrients.protein}g</div>
                <div className="text-xs text-muted-foreground">蛋白质</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <div className="text-xl font-bold text-yellow-500">{nutrients.fat}g</div>
                <div className="text-xs text-muted-foreground">脂肪</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生成中状态 */}
        {isLoading && !plan && (
          <Card className="mb-4 shadow-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                <span className="font-medium">AI 正在为你生成方案...</span>
                <span className="text-xs text-center">10天饮食方案，每天不重复<br/>让每顿饭都有新选择</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 方案列表 - 按天展示 */}
        {mealPlans.length > 0 ? (
          <div className="space-y-3">
            {mealPlans.map((dayPlan) => (
              <Card key={dayPlan.day} className="shadow-sm overflow-hidden">
                <div 
                  className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 cursor-pointer"
                  onClick={() => toggleDay(dayPlan.day)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                      {dayPlan.day}
                    </div>
                    <span className="font-medium">第 {dayPlan.day} 天</span>
                    {saved && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {expandedDays.has(dayPlan.day) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                {expandedDays.has(dayPlan.day) && (
                  <CardContent className="py-3 space-y-3">
                    <MealCard 
                      type="早餐" 
                      content={dayPlan.breakfast} 
                      icon={Sun}
                      colorClass="bg-amber-50 dark:bg-amber-950/30"
                    />
                    <MealCard 
                      type="午餐" 
                      content={dayPlan.lunch} 
                      icon={CloudSun}
                      colorClass="bg-orange-50 dark:bg-orange-950/30"
                    />
                    <MealCard 
                      type="晚餐" 
                      content={dayPlan.dinner} 
                      icon={Moon}
                      colorClass="bg-indigo-50 dark:bg-indigo-950/30"
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : plan && plan.length > 0 ? (
          /* 解析失败时显示原始内容 */
          <Card className="mb-4 shadow-sm">
            <CardContent className="py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {plan}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div ref={planEndRef} />

        {/* 底部提示 */}
        {plan && !isLoading && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ⚠️ 所有食材重量为【{nutrients.format === 'raw' ? '生重' : '熟重'}】
            </p>
          </div>
        )}
      </main>

      {/* 底部固定操作栏 */}
      {plan && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-4 space-y-2">
          <Link href="/record" className="block">
            <Button className="w-full h-11 bg-green-500 hover:bg-green-600">
              <FileText className="mr-2 h-4 w-4" />
              查看我的记录
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-11">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
