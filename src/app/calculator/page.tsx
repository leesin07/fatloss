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
  // 基础碳水计算：体重 × 系数
  // 运动时长影响系数：2-3h=1.5, 4-5h=2, 6-7h=2.5, 8-9h=3
  let carbCoefficient = 1.5;
  if (exerciseHours >= 8) carbCoefficient = 3;
  else if (exerciseHours >= 6) carbCoefficient = 2.5;
  else if (exerciseHours >= 4) carbCoefficient = 2;

  let carbs = weight * carbCoefficient;

  // 蛋白质：体重 × 1.5-2g
  const protein = weight * 1.8;

  // 脂肪：体重 × 0.8-1g
  let fat = weight * 0.9;

  // 性别调整
  let carbAdjust = 0;
  let fatAdjust = 0;
  if (gender === 'female') {
    carbAdjust = -20; // 女性碳水减少20g
    fatAdjust = 5; // 脂肪增加5g
    carbs += carbAdjust;
    fat += fatAdjust;
  }

  // 快速模式调整
  if (fastMode) {
    carbs -= 5;
    carbAdjust -= 5;
  }

  // 确保最小值
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
      alert('请输入有效的体重');
      return;
    }

    const exerciseOption = exerciseOptions.find((opt) => opt.value === exercise);
    if (!exerciseOption) {
      alert('请选择每周运动时长');
      return;
    }

    const nutrients = calculateNutrients(weightNum, exerciseOption.hours, gender, fastMode);
    setResult(nutrients);
  };

  const handleGeneratePlan = () => {
    if (!result) return;
    
    // 将计算结果存储到 sessionStorage
    sessionStorage.setItem('nutrients', JSON.stringify({
      weight,
      exercise,
      gender,
      fastMode,
      ...result,
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
          <h1 className="ml-4 text-lg font-semibold">个性化摄入量计算器</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6">
        {/* 输入表单 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">请填写以下信息</CardTitle>
            <p className="text-sm text-muted-foreground">
              只需4步，自动计算你的每日营养素需求
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 体重输入 */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base">
                当前体重
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="weight"
                  type="number"
                  placeholder="填写你当前初始体重"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex-1 h-12 text-lg"
                  min="30"
                  max="300"
                  step="0.1"
                />
                <span className="text-muted-foreground">KG</span>
              </div>
            </div>

            {/* 运动时长 */}
            <div className="space-y-2">
              <Label className="text-base">每周总运动时长</Label>
              <Select value={exercise} onValueChange={setExercise}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="选择每周运动时长" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 性别选择 */}
            <div className="space-y-2">
              <Label className="text-base">性别选择</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value: 'male' | 'female') => setGender(value)}
                className="flex gap-4"
              >
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="male" id="male" className="sr-only" />
                  <Label htmlFor="male" className="cursor-pointer text-base font-medium">
                    👨 男
                  </Label>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 dark:has-[:checked]:bg-green-950">
                  <RadioGroupItem value="female" id="female" className="sr-only" />
                  <Label htmlFor="female" className="cursor-pointer text-base font-medium">
                    👩 女
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                自动触发性别系数修正，不用手动计算
              </p>
            </div>

            {/* 目标调整 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">希望掉秤速度稍快</Label>
                <Switch
                  checked={fastMode}
                  onCheckedChange={setFastMode}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                默认「偏稳」，开启后碳水减少5g，适合不着急的新手
              </p>
            </div>

            {/* 计算按钮 */}
            <Button
              onClick={handleCalculate}
              className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600"
              size="lg"
            >
              开始计算
            </Button>
          </CardContent>
        </Card>

        {/* 计算结果 */}
        {result && (
          <Card className="mb-6 border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-950">
              <CardTitle className="text-base text-green-700 dark:text-green-400">
                计算结果
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* 三大营养素 */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {result.carbs}g
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">碳水化合物</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {result.protein}g
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">蛋白质</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-950">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {result.fat}g
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">脂肪</div>
                </div>
              </div>

              {/* 适配说明 */}
              <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {gender === 'female' && (
                      <>
                        已按性别要求调整：碳水减少{Math.abs(result.carbAdjust)}g、脂肪增加{result.fatAdjust}g
                        <br />
                      </>
                    )}
                    {fastMode && (
                      <>
                        已开启快速模式：碳水额外减少5g
                        <br />
                      </>
                    )}
                    运动时长影响碳水系数，运动越多碳水需求越高
                  </div>
                </div>
              </div>

              {/* 生成方案按钮 */}
              <Button
                onClick={handleGeneratePlan}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                生成专属饮食方案
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
