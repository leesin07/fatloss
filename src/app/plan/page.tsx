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
  Sparkles,
  RefreshCw,
  Home,
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const planEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentNutrients');
    if (stored) {
      const data = JSON.parse(stored);
      setNutrients(data);
      // 自动开始生成
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
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Error:', error);
      setPlan('生成失败，请点击重新生成');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="ml-4 text-lg font-semibold">饮食方案</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 营养素概览 */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">每日目标</span>
              <span className="text-xs text-muted-foreground">
                {nutrients.weight}kg · {nutrients.format === 'raw' ? '生重' : '熟重'}
              </span>
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
          </CardContent>
        </Card>

        {/* 生成的方案 */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isLoading ? 'AI 生成中...' : '你的饮食方案'}
              </span>
              {plan && !isLoading && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => generatePlan()}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {plan || (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI 正在为你生成方案...</span>
                </div>
              )}
            </div>
            <div ref={planEndRef} />
          </CardContent>
        </Card>

        {/* 底部操作 */}
        {plan && !isLoading && (
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-11">
                <Home className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <Link href="/record" className="flex-1">
              <Button className="w-full h-11 bg-green-500 hover:bg-green-600">
                查看我的记录
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
