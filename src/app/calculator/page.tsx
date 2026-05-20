'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

// 运动时长选项
const exerciseOptions = [
  { value: '2-3', label: '2-3 小时（每周 2 次）', hours: 2.5 },
  { value: '4-5', label: '4-5 小时（每周 3 次）', hours: 4.5 },
  { value: '6-7', label: '6-7 小时（每周 4 次）', hours: 6.5 },
  { value: '8-9', label: '8-9 小时（每周 5 次）', hours: 8.5 },
];

// 计算营养素
function calculateNutrients(
  weight: number,
  exerciseHours: number,
  gender: 'male' | 'female' | null
) {
  let carbCoefficient = 1.5;
  if (exerciseHours >= 8) carbCoefficient = 3;
  else if (exerciseHours >= 6) carbCoefficient = 2.5;
  else if (exerciseHours >= 4) carbCoefficient = 2;

  let carbs = weight * carbCoefficient;
  const protein = weight * 1.8;
  let fat = weight * 0.9;

  // 性别调整
  if (gender === 'female') {
    carbs -= 20;
    fat += 5;
  }

  carbs = Math.max(carbs, 50);
  fat = Math.max(fat, 30);

  return {
    carbs: Math.round(carbs),
    protein: Math.round(protein),
    fat: Math.round(fat),
  };
}

export default function CalculatorPage() {
  const router = useRouter();
  const [weight, setWeight] = useState<string>('');
  const [exercise, setExercise] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [format, setFormat] = useState<'raw' | 'cooked'>('raw');
  const [preference, setPreference] = useState<string>('');

  // 实时计算营养素
  const nutrients = useMemo(() => {
    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0 || !exercise || !gender) return null;
    
    const exerciseOption = exerciseOptions.find((opt) => opt.value === exercise);
    if (!exerciseOption) return null;

    return calculateNutrients(weightNum, exerciseOption.hours, gender);
  }, [weight, exercise, gender]);

  // 是否可以生成方案
  const canGenerate = weight && exercise && gender && parseFloat(weight) > 0;

  const handleGenerate = () => {
    if (!nutrients) return;

    // 保存记录到 localStorage
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      exercise,
      gender,
      format,
      preference,
      carbs: nutrients.carbs,
      protein: nutrients.protein,
      fat: nutrients.fat,
    };

    const records = JSON.parse(localStorage.getItem('fatLossRecords') || '[]');
    records.unshift(record);
    localStorage.setItem('fatLossRecords', JSON.stringify(records.slice(0, 30)));

    // 传递数据到方案页面
    sessionStorage.setItem('currentNutrients', JSON.stringify({
      weight,
      exercise,
      gender,
      format,
      preference,
      carbs: nutrients.carbs,
      protein: nutrients.protein,
      fat: nutrients.fat,
    }));

    router.push('/plan');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">计算摄入量</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6 pb-24">
        {/* 基础信息输入 */}
        <div className="space-y-5">
          {/* 体重 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">当前体重</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="例如：65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 h-12 text-lg"
                min="30"
                max="300"
                step="0.1"
              />
              <span className="text-muted-foreground">kg</span>
            </div>
          </div>

          {/* 运动时长 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">每周运动时长</Label>
            <Select value={exercise} onValueChange={setExercise}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="选择运动时长" />
              </SelectTrigger>
              <SelectContent>
                {exerciseOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-3">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 性别 - 可选项 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">性别（可选）</Label>
            <RadioGroup
              value={gender || ''}
              onValueChange={(value) => setGender(value as 'male' | 'female' | null)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                <RadioGroupItem value="male" id="male" className="sr-only" />
                <Label htmlFor="male" className="cursor-pointer text-lg">👨 男性</Label>
              </div>
              <div className="flex items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                <RadioGroupItem value="female" id="female" className="sr-only" />
                <Label htmlFor="female" className="cursor-pointer text-lg">👩 女性</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-2">
              女性碳水减少20g、脂肪增加5g
            </p>
          </div>
        </div>

        {/* 实时计算结果 */}
        {nutrients && (
          <Card className="mt-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="py-4">
              <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-3">
                每日营养素目标
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-white dark:bg-green-900 p-3">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {nutrients.carbs}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">碳水 (g)</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-green-900 p-3">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {nutrients.protein}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">蛋白质 (g)</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-green-900 p-3">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {nutrients.fat}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">脂肪 (g)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 饮食方案配置 - 只在有效计算结果后显示 */}
        {nutrients && (
          <div className="mt-6 space-y-5">
            <div className="h-px bg-border" />
            
            {/* 食材重量格式 */}
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
          </div>
        )}
      </main>

      {/* 底部固定按钮 */}
      {nutrients && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-card border-t">
          <div className="container mx-auto max-w-lg">
            <Button
              onClick={handleGenerate}
              className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              保存并生成饮食方案
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
