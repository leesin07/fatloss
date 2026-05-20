'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';

// 运动时长选项
const exerciseOptions = [
  { value: '2-3', label: '2-3 小时（每周 2 次）', hours: 2.5 },
  { value: '4-5', label: '4-5 小时（每周 3 次）', hours: 4.5 },
  { value: '6-7', label: '6-7 小时（每周 4 次）', hours: 6.5 },
  { value: '8-9', label: '8-9 小时（每周 5 次）', hours: 8.5 },
];

// 计算营养素的函数
function calculateNutrients(
  weight: number,
  exerciseHours: number,
  gender: 'male' | 'female',
  fastMode: boolean
) {
  let carbCoefficient = 1.5;
  if (exerciseHours >= 8) carbCoefficient = 3;
  else if (exerciseHours >= 6) carbCoefficient = 2.5;
  else if (exerciseHours >= 4) carbCoefficient = 2;

  let carbs = weight * carbCoefficient;
  const protein = weight * 1.8;
  let fat = weight * 0.9;

  let carbAdjust = 0;
  let fatAdjust = 0;
  
  if (gender === 'female') {
    carbAdjust = -20;
    fatAdjust = 5;
    carbs += carbAdjust;
    fat += fatAdjust;
  }

  if (fastMode) {
    carbs -= 5;
    carbAdjust -= 5;
  }

  carbs = Math.max(carbs, 50);
  fat = Math.max(fat, 30);

  return {
    carbs: Math.round(carbs),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbAdjust,
    fatAdjust,
  };
}

export default function CalculatorPage() {
  const router = useRouter();
  const [weight, setWeight] = useState<string>('');
  const [exercise, setExercise] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [fastMode, setFastMode] = useState<boolean>(false);
  const [result, setResult] = useState<ReturnType<typeof calculateNutrients> | null>(null);

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      return;
    }

    const exerciseOption = exerciseOptions.find((opt) => opt.value === exercise);
    if (!exerciseOption) {
      return;
    }

    const nutrients = calculateNutrients(weightNum, exerciseOption.hours, gender, fastMode);
    setResult(nutrients);
    
    // 保存到 localStorage
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight: weightNum,
      exercise: exerciseOption.value,
      gender,
      fastMode,
      ...nutrients,
    };
    
    const records = JSON.parse(localStorage.getItem('fatLossRecords') || '[]');
    records.unshift(record);
    localStorage.setItem('fatLossRecords', JSON.stringify(records.slice(0, 20)));
    
    // 同时保存到 sessionStorage 用于方案页面
    sessionStorage.setItem('currentNutrients', JSON.stringify({
      weight,
      exercise,
      gender,
      fastMode,
      ...nutrients,
    }));
  };

  const handleGeneratePlan = () => {
    if (!result) return;
    router.push('/plan');
  };

  const isValid = weight && exercise && parseFloat(weight) > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">计算每日摄入量</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6">
        {/* 输入表单 */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-5">
            {/* 体重输入 */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-medium">
                当前体重
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="weight"
                  type="number"
                  placeholder="例如：65"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setResult(null);
                  }}
                  className="flex-1 h-12 text-lg"
                  min="30"
                  max="300"
                  step="0.1"
                />
                <span className="text-muted-foreground text-lg">kg</span>
              </div>
            </div>

            {/* 运动时长 */}
            <div className="space-y-2">
              <Label className="text-base font-medium">每周运动时长</Label>
              <Select value={exercise} onValueChange={(v) => { setExercise(v); setResult(null); }}>
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

            {/* 性别选择 */}
            <div className="space-y-2">
              <Label className="text-base font-medium">性别</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value: 'male' | 'female') => { setGender(value); setResult(null); }}
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
            </div>

            {/* 目标调整 */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-base font-medium">加速模式</Label>
                <p className="text-xs text-muted-foreground mt-0.5">碳水减少5g/天</p>
              </div>
              <Switch checked={fastMode} onCheckedChange={(v) => { setFastMode(v); setResult(null); }} />
            </div>

            {/* 计算按钮 */}
            <Button
              onClick={handleCalculate}
              disabled={!isValid}
              className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-50"
            >
              计算营养素
            </Button>
          </CardContent>
        </Card>

        {/* 计算结果 */}
        {result && (
          <Card className="mb-6 border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-lg">
              <CardTitle className="text-base text-green-700 dark:text-green-400">
                每日营养素目标
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* 三大营养素 */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-950">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {result.carbs}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">碳水 (g)</div>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-950">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {result.protein}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 mt-1">蛋白质 (g)</div>
                </div>
                <div className="rounded-xl bg-yellow-50 p-4 text-center dark:bg-yellow-950">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {result.fat}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">脂肪 (g)</div>
                </div>
              </div>

              {/* 适配说明 */}
              {(gender === 'female' || fastMode) && (
                <div className="mb-5 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {gender === 'female' && `已按女性调整：碳水${result.carbAdjust}g、脂肪+${result.fatAdjust}g`}
                      {gender === 'female' && fastMode && '；'}
                      {fastMode && '加速模式：碳水额外-5g'}
                    </p>
                  </div>
                </div>
              )}

              {/* 生成方案按钮 */}
              <Button
                onClick={handleGeneratePlan}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                生成饮食方案
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
