'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface NutrientsData {
  weight: string;
  exercise: string;
  gender: 'male' | 'female';
  fastMode: boolean;
  carbs: number;
  protein: number;
  fat: number;
}

export default function PlanPage() {
  const router = useRouter();
  const [nutrients, setNutrients] = useState<NutrientsData | null>(null);
  const [preference, setPreference] = useState<string>('');
  const [format, setFormat] = useState<'raw' | 'cooked'>('raw');
  const [plan, setPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const planEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentNutrients');
    if (stored) {
      setNutrients(JSON.parse(stored));
    } else {
      router.push('/calculator');
    }
  }, [router]);

  useEffect(() => {
    if (plan && planEndRef.current) {
      planEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [plan]);

  const generatePlan = async () => {
    if (!nutrients) return;

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
        body: JSON.stringify({ ...nutrients, preference, format }),
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
      setPlan('生成失败，请重试');
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
          <h1 className="ml-4 text-lg font-semibold">生成饮食方案</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 营养素概览 */}
        <Card className="mb-4">
          <CardContent className="py-4">
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

        {/* 选项配置 */}
        <Card className="mb-4">
          <CardContent className="py-4 space-y-4">
            {/* 格式选择 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">食材重量格式</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: 'raw' | 'cooked') => setFormat(value)}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="raw" id="raw" className="sr-only" />
                  <Label htmlFor="raw" className="cursor-pointer text-sm">生重（未烹饪）</Label>
                </div>
                <div className="flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="cooked" id="cooked" className="sr-only" />
                  <Label htmlFor="cooked" className="cursor-pointer text-sm">熟重（烹饪后）</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 食材偏好 */}
            <div>
              <Label htmlFor="preference" className="text-sm font-medium mb-2 block">
                食材偏好（可选）
              </Label>
              <Textarea
                id="preference"
                placeholder="例如：不吃海鲜、对花生过敏、只有鸡蛋和鸡胸肉..."
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={generatePlan}
              disabled={isLoading}
              className="w-full h-11 font-semibold bg-green-500 hover:bg-green-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 正在生成...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成方案
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 生成的方案 */}
        {(plan || isLoading) && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">你的饮食方案</span>
                {plan && !isLoading && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={generatePlan}>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      重新生成
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                      {copied ? '已复制' : '复制'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {plan || (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI 正在为你生成方案...</span>
                  </div>
                )}
              </div>
              <div ref={planEndRef} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
