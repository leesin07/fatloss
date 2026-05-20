'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const searchParams = useSearchParams();
  const [nutrients, setNutrients] = useState<NutrientsData | null>(null);
  const [preference, setPreference] = useState<string>('');
  const [format, setFormat] = useState<'raw' | 'cooked'>('raw');
  const [plan, setPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 从 sessionStorage 获取数据
    const stored = sessionStorage.getItem('nutrients');
    if (stored) {
      const data = JSON.parse(stored);
      setNutrients(data);
    } else {
      // 如果没有数据，跳转回计算器页面
      router.push('/calculator');
    }
  }, [router]);

  const generatePlan = async () => {
    if (!nutrients) return;

    setIsLoading(true);
    setPlan('');
    setHasStarted(true);

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nutrients,
          preference,
          format,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

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
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedPlan += parsed.content;
                setPlan(accumulatedPlan);
              }
              if (parsed.error) {
                setPlan(`生成出错：${parsed.error}`);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // 用户取消，不处理
      }
      console.error('Error:', error);
      setPlan('生成方案时出错，请重试');
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
          <Link
            href="/calculator"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">专属饮食方案</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 营养素概览 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">每日营养素目标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {nutrients.carbs}g
                </div>
                <div className="text-sm text-muted-foreground">碳水</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {nutrients.protein}g
                </div>
                <div className="text-sm text-muted-foreground">蛋白质</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {nutrients.fat}g
                </div>
                <div className="text-sm text-muted-foreground">脂肪</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 选项配置 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">方案配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 格式选择 */}
            <div className="space-y-2">
              <Label className="text-base">重量格式</Label>
              <RadioGroup
                value={format}
                onValueChange={(value: 'raw' | 'cooked') => setFormat(value)}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="raw" id="raw" className="sr-only" />
                  <Label htmlFor="raw" className="cursor-pointer text-center">
                    <div className="font-medium">标准生重版</div>
                    <div className="text-xs text-muted-foreground">
                      食材烹饪前重量
                    </div>
                  </Label>
                </div>
                <div className="flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="cooked" id="cooked" className="sr-only" />
                  <Label htmlFor="cooked" className="cursor-pointer text-center">
                    <div className="font-medium">方便熟重版</div>
                    <div className="text-xs text-muted-foreground">
                      食材烹饪后重量
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 食材偏好 */}
            <div className="space-y-2">
              <Label htmlFor="preference" className="text-base">
                食材偏好/限制（可选）
              </Label>
              <Textarea
                id="preference"
                placeholder="例如：不吃香菜、对海鲜过敏、只有鸡胸肉和鸡蛋..."
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                AI 会根据你的偏好调整食材，保持营养素总量不变
              </p>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={generatePlan}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  正在生成方案...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  生成饮食方案
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 生成的方案 */}
        {(plan || isLoading) && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">你的饮食方案</CardTitle>
              {plan && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePlan}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    重新生成
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!plan}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        复制方案
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {plan || (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    <span className="ml-2 text-muted-foreground">
                      AI 正在为你生成方案...
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 提示信息 */}
        {hasStarted && !isLoading && plan && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 提示：方案中的食材可以根据你的实际情况灵活调整。
                如果不喜欢某种食材，可以替换成同类食材（如鸡胸肉换瘦牛肉），
                保持营养素总量不变即可。
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
