'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator as CalculatorIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateDailyNeeds } from '@/lib/mealPlanner';

type UserNeeds = {
  carbs: number;
  protein: number;
  fat: number;
};

type ActivityLevel = '2-3' | '4-5' | '6-7' | '8+';

// 每周运动量选项（按小时数）
const activityOptions = [
  { value: '2-3', label: '2-3小时/周（约2次）', desc: '轻松运动' },
  { value: '4-5', label: '4-5小时/周（约3次）', desc: '适度运动' },
  { value: '6-7', label: '6-7小时/周（约4次）', desc: '积极运动' },
  { value: '8+', label: '8小时+/周（约5次）', desc: '高强度运动' },
];

export default function CalculatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    weight: '',
    gender: 'male' as 'male' | 'female',
    activity: '2-3' as ActivityLevel,
  });
  const [result, setResult] = useState<UserNeeds | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const weight = parseFloat(formData.weight);

    if (!weight || weight <= 0) {
      alert('请输入有效体重');
      return;
    }

    // 使用新公式计算（传入活动等级字符串）
    const needs = calculateDailyNeeds(weight, formData.gender, formData.activity as '2-3' | '4-5' | '6-7' | '8+');
    setResult(needs);
    setShowResult(true);
  };

  const handleGeneratePlan = () => {
    if (!result) return;
    
    // 存储到 localStorage（与 plan 页面保持一致）
    localStorage.setItem('nutritionNeeds', JSON.stringify(result));
    localStorage.setItem('userGender', formData.gender);
    localStorage.setItem('userInfo', JSON.stringify(formData));
    
    router.push('/plan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">营养需求计算</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl pb-24">
        {/* 输入表单 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-green-500" />
              基本信息
            </CardTitle>
            <CardDescription>
              只需3项信息，即可计算每日营养素需求
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 体重 */}
            <div className="space-y-2">
              <Label htmlFor="weight">体重 (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="例如：70"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label>性别</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v as 'male' | 'female' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 运动量 */}
            <div className="space-y-2">
              <Label>每周运动量</Label>
              <Select
                value={formData.activity}
                onValueChange={(v) => setFormData({ ...formData, activity: v as ActivityLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCalculate} 
              className="w-full bg-green-500 hover:bg-green-600"
            >
              计算营养需求
            </Button>
          </CardContent>
        </Card>

        {/* 计算结果 */}
        {showResult && result && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">每日营养素目标</CardTitle>
              <CardDescription className="text-green-600">
                减脂期建议摄入量
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-orange-500">{result.carbs}</div>
                  <div className="text-sm text-gray-500 mt-1">碳水 (g)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-red-500">{result.protein}</div>
                  <div className="text-sm text-gray-500 mt-1">蛋白质 (g)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-yellow-500">{result.fat}</div>
                  <div className="text-sm text-gray-500 mt-1">脂肪 (g)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg mb-4">
                <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>可根据实际食材适当调整，保持总量平衡即可</span>
              </div>

              <Button 
                onClick={handleGeneratePlan}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                生成10天饮食方案
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
