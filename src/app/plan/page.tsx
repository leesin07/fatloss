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

export default function PlanPage() {
  const router = useRouter();
  const [nutrients, setNutrients] = useState<NutrientsData | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const planEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentNutrients');
    if (stored) {
      const data = JSON.parse(stored);
      setNutrients(data);
      generatePlan(data);
    } else {
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

      // 生成完成后自动保存方案
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

  if (!nutrients) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/calculator" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">10天饮食方案</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 营养素概览 */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">每日营养目标</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  nutrients.format === 'raw'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                }`}>
                  {nutrients.format === 'raw' ? '🥩 生重' : '🍳 熟重'}
                </span>
                <span className="text-xs text-muted-foreground">{nutrients.weight}kg</span>
              </div>
            </div>
            <div className="flex items-center justify-around text-center">
              <div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{nutrients.carbs}g</div>
                <div className="text-xs text-muted-foreground">碳水</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{nutrients.protein}g</div>
                <div className="text-xs text-muted-foreground">蛋白质</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{nutrients.fat}g</div>
                <div className="text-xs text-muted-foreground">脂肪</div>
              </div>
            </div>
            {nutrients.format === 'raw' && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                ⚠️ 所有食材重量为【生重】，即烹饪前的重量
              </p>
            )}
            {nutrients.format === 'cooked' && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                ⚠️ 所有食材重量为【熟重】，即烹饪后可直接称量的重量
              </p>
            )}
          </CardContent>
        </Card>

        {/* 生成的方案 */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {isLoading ? 'AI 生成中...' : '你的专属方案'}
                </span>
                {saved && !isLoading && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> 已保存
                  </span>
                )}
              </div>
              {plan && !isLoading && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => generatePlan()} title="重新生成">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy} title="复制">
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {plan || (
                <div className="flex flex-col items-center gap-3 text-muted-foreground py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  <span>AI 正在为你生成10天多样化方案...</span>
                  <span className="text-xs">请稍候，这可能需要十几秒</span>
                </div>
              )}
            </div>
            <div ref={planEndRef} />
          </CardContent>
        </Card>

        {/* 底部操作 */}
        {plan && !isLoading && (
          <div className="space-y-3">
            <Link href="/record" className="block">
              <Button className="w-full h-11 bg-green-500 hover:bg-green-600">
                <FileText className="mr-2 h-4 w-4" />
                查看我的记录与历史方案
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
      </main>
    </div>
  );
}
