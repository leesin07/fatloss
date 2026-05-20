'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Trash2,
  TrendingDown,
  TrendingUp,
  Minus,
  FileText,
  ChevronRight,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface WeightRecord {
  id: number;
  date: string;
  weight: number;
  exercise?: string;
  gender?: 'male' | 'female' | null;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface MealPlan {
  id: number;
  date: string;
  weight: string;
  gender: 'male' | 'female' | null;
  format: 'raw' | 'cooked';
  carbs: number;
  protein: number;
  fat: number;
  plan: string;
}

export default function RecordPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedRecords = JSON.parse(localStorage.getItem('fatLossRecords') || '[]');
    const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
    setRecords(savedRecords);
    setPlans(savedPlans);
  };

  const addWeightRecord = () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) return;

    const record: WeightRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight,
    };

    const updatedRecords = [record, ...records].slice(0, 100);
    setRecords(updatedRecords);
    localStorage.setItem('fatLossRecords', JSON.stringify(updatedRecords));
    setNewWeight('');
  };

  const deleteRecord = (id: number) => {
    const updatedRecords = records.filter((r) => r.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem('fatLossRecords', JSON.stringify(updatedRecords));
  };

  const deletePlan = (id: number) => {
    const updatedPlans = plans.filter((p) => p.id !== id);
    setPlans(updatedPlans);
    localStorage.setItem('mealPlans', JSON.stringify(updatedPlans));
    if (selectedPlan?.id === id) {
      setSelectedPlan(null);
    }
  };

  // 计算体重变化趋势
  const getTrend = () => {
    if (records.length < 2) return null;
    const recent = records.slice(0, 5).reverse();
    if (recent.length < 2) return null;
    
    const diff = recent[recent.length - 1].weight - recent[0].weight;
    if (diff > 0.5) return { type: 'up', value: diff.toFixed(1) };
    if (diff < -0.5) return { type: 'down', value: Math.abs(diff).toFixed(1) };
    return { type: 'stable', value: Math.abs(diff).toFixed(1) };
  };

  // 获取调整建议
  const getAdjustmentSuggestion = () => {
    const trend = getTrend();
    if (!trend) return null;

    if (trend.type === 'down') {
      const weeklyLoss = (parseFloat(trend.value) / records.length) * 7;
      if (weeklyLoss > 1.5) {
        return {
          type: 'warning',
          text: `掉秤速度较快（约${weeklyLoss.toFixed(1)}kg/周），建议适当增加碳水摄入，避免肌肉流失`,
        };
      }
      return {
        type: 'good',
        text: `掉秤速度正常，继续保持当前饮食方案`,
      };
    } else if (trend.type === 'up') {
      return {
        type: 'warning',
        text: '体重有所上升，建议检查饮食执行情况，或适当减少碳水摄入',
      };
    }
    return {
      type: 'neutral',
      text: '体重基本稳定，可以继续观察几天',
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const trend = getTrend();
  const suggestion = getAdjustmentSuggestion();

  // 简单的趋势图数据
  const chartData = records.slice(0, 10).reverse();
  const minWeight = Math.min(...chartData.map(r => r.weight)) - 1;
  const maxWeight = Math.max(...chartData.map(r => r.weight)) + 1;
  const weightRange = maxWeight - minWeight || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">我的记录</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* 添加体重记录 */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm font-medium mb-3">记录今日体重</h3>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="输入体重"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 h-11"
                min="30"
                max="300"
                step="0.1"
              />
              <span className="flex items-center text-muted-foreground">kg</span>
              <Button onClick={addWeightRecord} disabled={!newWeight} className="h-11">
                记录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 体重趋势图 */}
        {chartData.length >= 2 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">体重趋势</h3>
                {trend && (
                  <span className={`text-xs flex items-center gap-1 ${
                    trend.type === 'down' ? 'text-green-600' : trend.type === 'up' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {trend.type === 'down' && <TrendingDown className="h-3 w-3" />}
                    {trend.type === 'up' && <TrendingUp className="h-3 w-3" />}
                    {trend.type === 'stable' && <Minus className="h-3 w-3" />}
                    {trend.type === 'down' ? '-' : trend.type === 'up' ? '+' : ''}{trend.value}kg
                  </span>
                )}
              </div>
              
              {/* SVG 趋势图 */}
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartData.length * 40} 120`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {/* 趋势线 */}
                  <polyline
                    points={chartData.map((r, i) => {
                      const x = i * 40 + 20;
                      const y = 110 - ((r.weight - minWeight) / weightRange) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* 数据点 */}
                  {chartData.map((r, i) => {
                    const x = i * 40 + 20;
                    const y = 110 - ((r.weight - minWeight) / weightRange) * 100;
                    return (
                      <g key={r.id}>
                        <circle cx={x} cy={y} r="4" fill="#22c55e" />
                        <text x={x} y={y - 10} textAnchor="middle" className="text-[10px] fill-gray-500">
                          {r.weight}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {/* Y轴标签 */}
                <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">
                  {maxWeight.toFixed(1)}kg
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                  {minWeight.toFixed(1)}kg
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 调整建议 */}
        {suggestion && (
          <Card className={`${
            suggestion.type === 'good' ? 'border-green-200 dark:border-green-800' :
            suggestion.type === 'warning' ? 'border-orange-200 dark:border-orange-800' :
            'border-gray-200 dark:border-gray-800'
          }`}>
            <CardContent className="py-4">
              <h3 className="text-sm font-medium mb-2">调整建议</h3>
              <p className={`text-sm ${
                suggestion.type === 'good' ? 'text-green-600 dark:text-green-400' :
                suggestion.type === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                'text-muted-foreground'
              }`}>
                {suggestion.text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 历史饮食方案 */}
        {plans.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <h3 className="text-sm font-medium mb-3">历史饮食方案</h3>
              <div className="space-y-2">
                {plans.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedPlan(p)}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{p.weight}kg</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(p.date)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          p.format === 'raw' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {p.format === 'raw' ? '生重' : '熟重'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        碳水{p.carbs}g · 蛋白{p.protein}g · 脂肪{p.fat}g
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(p.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 体重记录列表 */}
        {records.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <h3 className="text-sm font-medium mb-3">体重记录</h3>
              <div className="space-y-2">
                {records.slice(0, 10).map((record, index) => {
                  const prevRecord = records[index + 1];
                  const diff = prevRecord ? (record.weight - prevRecord.weight).toFixed(1) : null;
                  
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <span className="text-lg font-semibold">{record.weight}</span>
                        <span className="text-sm text-muted-foreground ml-1">kg</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {diff && (
                          <span className={`text-xs ${
                            parseFloat(diff) < 0 ? 'text-green-600' : 
                            parseFloat(diff) > 0 ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {parseFloat(diff) < 0 ? '' : '+'}{diff}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.date)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {records.length === 0 && plans.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无记录</p>
            <p className="text-sm text-muted-foreground mt-1">
              去<Link href="/calculator" className="text-green-600 hover:underline">计算摄入量</Link>开始吧
            </p>
          </div>
        )}
      </main>

      {/* 方案详情弹窗 */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden sm:mx-4 rounded-b-none sm:rounded-b-lg">
            <CardContent className="p-0">
              {/* 弹窗头部 */}
              <div className="sticky top-0 bg-white dark:bg-card border-b p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">饮食方案</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlan.weight}kg · {selectedPlan.format === 'raw' ? '生重' : '熟重'} · {formatDate(selectedPlan.date)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 营养素 */}
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-around text-center text-sm">
                  <div>
                    <span className="font-semibold text-orange-600">{selectedPlan.carbs}g</span>
                    <span className="text-muted-foreground ml-1">碳水</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div>
                    <span className="font-semibold text-red-600">{selectedPlan.protein}g</span>
                    <span className="text-muted-foreground ml-1">蛋白质</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div>
                    <span className="font-semibold text-yellow-600">{selectedPlan.fat}g</span>
                    <span className="text-muted-foreground ml-1">脂肪</span>
                  </div>
                </div>
              </div>
              
              {/* 方案内容 */}
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                  {selectedPlan.plan}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
