'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { ChevronLeft, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

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
  gender: 'male' | 'female'
) {
  let carbCoefficient = 1.5;
  if (exerciseHours >= 8) carbCoefficient = 3;
  else if (exerciseHours >= 6) carbCoefficient = 2.5;
  else if (exerciseHours >= 4) carbCoefficient = 2;

  let carbs = weight * carbCoefficient;
  const protein = weight * 1.8;
  let fat = weight * 0.9;

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

export default function AdjustPage() {
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [previousWeight, setPreviousWeight] = useState<string>('');
  const [days, setDays] = useState<string>('7');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [exercise, setExercise] = useState<string>('2-3');
  const [result, setResult] = useState<{
    weightChange: number;
    adjustment: string;
    newNutrients: { carbs: number; protein: number; fat: number };
    status: 'fast' | 'normal' | 'slow';
  } | null>(null);

  const handleCalculate = () => {
    const current = parseFloat(currentWeight);
    const previous = parseFloat(previousWeight);
    const daysNum = parseInt(days);

    if (!current || !previous || current <= 0 || previous <= 0) {
      alert('请输入有效的体重');
      return;
    }

    const exerciseOption = exerciseOptions.find((opt) => opt.value === exercise);
    if (!exerciseOption) return;

    const weightChange = current - previous;
    const weeklyChange = (weightChange / daysNum) * 7;

    // 计算新的营养素
    const newNutrients = calculateNutrients(current, exerciseOption.hours, gender);

    // 判断状态
    let status: 'fast' | 'normal' | 'slow';
    let adjustment: string;

    if (weeklyChange < -1.5) {
      status = 'fast';
      adjustment = `掉秤过快（每周约${Math.abs(weeklyChange).toFixed(1)}kg），建议每日增加10-15g碳水化合物，防止肌肉流失和代谢下降。`;
    } else if (weeklyChange > -0.3 && weeklyChange <= 0) {
      status = 'slow';
      adjustment = `掉秤偏慢（每周约${Math.abs(weeklyChange).toFixed(1)}kg），建议每日减少10-15g碳水化合物，增加有氧运动时长。`;
    } else if (weeklyChange > 0) {
      status = 'slow';
      adjustment = `体重上升（每周约${weeklyChange.toFixed(1)}kg），建议每日减少15-20g碳水化合物，检查是否有隐形热量摄入（如饮料、零食）。`;
    } else {
      status = 'normal';
      adjustment = `掉秤速度正常（每周约${Math.abs(weeklyChange).toFixed(1)}kg），保持当前饮食方案即可。`;
    }

    setResult({
      weightChange,
      adjustment,
      newNutrients,
      status,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">动态调整工具</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6">
        {/* 说明卡片 */}
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <p className="font-medium mb-1">为什么要动态调整？</p>
                <p>
                  随着体重下降，你的身体需要的能量也会减少。每7-10天重新评估一次，
                  根据掉秤速度调整碳水摄入量，让减脂更科学有效。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 输入表单 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">填写评估信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 性别 */}
            <div className="space-y-2">
              <Label className="text-base">性别</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value: 'male' | 'female') => setGender(value)}
                className="flex gap-4"
              >
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="male" id="male" className="sr-only" />
                  <Label htmlFor="male" className="cursor-pointer font-medium">
                    👨 男
                  </Label>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="female" id="female" className="sr-only" />
                  <Label htmlFor="female" className="cursor-pointer font-medium">
                    👩 女
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 运动时长 */}
            <div className="space-y-2">
              <Label className="text-base">每周运动时长</Label>
              <Select value={exercise} onValueChange={setExercise}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 天数 */}
            <div className="space-y-2">
              <Label className="text-base">评估周期</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">过去 7 天</SelectItem>
                  <SelectItem value="10">过去 10 天</SelectItem>
                  <SelectItem value="14">过去 14 天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 体重输入 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousWeight" className="text-base">
                  之前体重
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="previousWeight"
                    type="number"
                    placeholder="XX.X"
                    value={previousWeight}
                    onChange={(e) => setPreviousWeight(e.target.value)}
                    className="h-12 text-lg"
                    step="0.1"
                  />
                  <span className="text-muted-foreground">KG</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentWeight" className="text-base">
                  当前体重
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="currentWeight"
                    type="number"
                    placeholder="XX.X"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="h-12 text-lg"
                    step="0.1"
                  />
                  <span className="text-muted-foreground">KG</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600"
              size="lg"
            >
              计算调整建议
            </Button>
          </CardContent>
        </Card>

        {/* 计算结果 */}
        {result && (
          <div className="space-y-4">
            {/* 调整建议 */}
            <Card
              className={`${
                result.status === 'fast'
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  : result.status === 'slow'
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {result.status === 'normal' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        result.status === 'fast'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    />
                  )}
                  <div
                    className={`text-sm ${
                      result.status === 'normal'
                        ? 'text-green-700 dark:text-green-300'
                        : result.status === 'fast'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    <p className="font-medium mb-1">调整建议</p>
                    <p>{result.adjustment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 新的营养素 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  基于当前体重的营养素需求
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {result.newNutrients.carbs}g
                    </div>
                    <div className="text-sm text-muted-foreground">碳水</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {result.newNutrients.protein}g
                    </div>
                    <div className="text-sm text-muted-foreground">蛋白质</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {result.newNutrients.fat}g
                    </div>
                    <div className="text-sm text-muted-foreground">脂肪</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
