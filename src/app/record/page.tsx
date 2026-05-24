'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Minus, AlertCircle, Calendar, Scale, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAdjustmentAdvice, type DayPlan } from '@/lib/mealPlanner';

interface WeightRecord {
  date: string;
  weight: number;
}

interface SavedPlan {
  id: string;
  date: string;
  carbs: number;
  protein: number;
  fat: number;
  period: number;
  plans: DayPlan[];
}

function RecordContent() {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, number>>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    // 加载体重记录
    const storedWeights = localStorage.getItem('weightRecords');
    if (storedWeights) {
      setWeightRecords(JSON.parse(storedWeights));
    }

    // 加载保存的方案
    const storedPlans = localStorage.getItem('savedPlans');
    if (storedPlans) {
      setSavedPlans(JSON.parse(storedPlans));
    }

    // 测试数据注入（通过 URL 参数 ?test=1 触发）
    if (searchParams.get('test') === '1' && !storedWeights) {
      const testWeights = [
        { date: '2024-01-01', weight: 75.5 },
        { date: '2024-01-02', weight: 75.2 },
        { date: '2024-01-03', weight: 74.8 },
        { date: '2024-01-04', weight: 75.0 },
        { date: '2024-01-05', weight: 74.5 },
        { date: '2024-01-06', weight: 74.2 },
        { date: '2024-01-07', weight: 73.8 },
        { date: '2024-01-08', weight: 73.5 },
        { date: '2024-01-09', weight: 73.2 },
        { date: '2024-01-10', weight: 72.8 },
      ];
      setWeightRecords(testWeights);
      localStorage.setItem('weightRecords', JSON.stringify(testWeights));
    }
  }, [searchParams]);

  useEffect(() => {
    // 生成调整建议
    if (weightRecords.length >= 2) {
      const result = getAdjustmentAdvice(weightRecords);
      setAdvice(result);
    }
  }, [weightRecords]);

  const addWeightRecord = () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已记录
    const existing = weightRecords.find((r) => r.date === today);
    let newRecords: WeightRecord[];
    
    if (existing) {
      newRecords = weightRecords.map((r) =>
        r.date === today ? { ...r, weight } : r
      );
    } else {
      newRecords = [...weightRecords, { date: today, weight }];
    }
    
    // 按日期排序
    newRecords.sort((a, b) => a.date.localeCompare(b.date));
    
    setWeightRecords(newRecords);
    localStorage.setItem('weightRecords', JSON.stringify(newRecords));
    setNewWeight('');
  };

  const deleteWeightRecord = (date: string) => {
    const newRecords = weightRecords.filter((r) => r.date !== date);
    setWeightRecords(newRecords);
    localStorage.setItem('weightRecords', JSON.stringify(newRecords));
  };

  const deletePlan = (id: string) => {
    const newPlans = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(newPlans);
    localStorage.setItem('savedPlans', JSON.stringify(newPlans));
  };

  // 重置所有数据
  const resetAllData = () => {
    localStorage.removeItem('weightRecords');
    localStorage.removeItem('savedPlans');
    localStorage.removeItem('nutritionNeeds');
    localStorage.removeItem('userGender');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('mealPlans');
    localStorage.removeItem('targetNutrition');
    
    setWeightRecords([]);
    setSavedPlans([]);
    setAdvice(null);
    setShowResetConfirm(false);
  };

  // 计算体重变化
  const weightStats = useMemo(() => {
    if (weightRecords.length < 2) return null;
    
    const recent = weightRecords.slice(-7);
    const first = recent[0].weight;
    const last = recent[recent.length - 1].weight;
    const change = first - last;
    const percent = ((change / first) * 100).toFixed(1);
    
    return { first, last, change, percent, days: recent.length - 1 };
  }, [weightRecords]);

  // 简单的趋势图数据
  const chartData = useMemo(() => {
    if (weightRecords.length === 0) return [];
    
    const max = Math.max(...weightRecords.map((r) => r.weight));
    const min = Math.min(...weightRecords.map((r) => r.weight));
    const range = max - min || 1;
    
    return weightRecords.map((r) => ({
      ...r,
      position: ((max - r.weight) / range) * 100,
    }));
  }, [weightRecords]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">我的记录</h1>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <RotateCcw className="h-4 w-4" />
            重置
          </button>
        </div>
      </div>

      {/* 重置确认弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">确认重置</h3>
            <p className="text-gray-600 mb-4">此操作将清空所有体重记录和收藏的饮食方案，无法恢复。确定要继续吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={resetAllData}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 体重记录区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              体重记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 添加体重 */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="今日体重 (kg)"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWeightRecord()}
                />
              </div>
              <Button onClick={addWeightRecord} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* 体重趋势图 */}
            {weightRecords.length > 0 && (
              <div className="mb-4">
                <div className="relative h-32 bg-gray-50 rounded-lg overflow-hidden">
                  {/* 横向参考线 */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="border-t border-dashed border-gray-200" />
                    ))}
                  </div>
                  
                  {/* Y轴刻度 */}
                  <div className="absolute left-2 top-1 text-xs text-gray-400">
                    {Math.max(...weightRecords.map(r => r.weight)).toFixed(1)}
                  </div>
                  <div className="absolute left-2 bottom-1 text-xs text-gray-400">
                    {Math.min(...weightRecords.map(r => r.weight)).toFixed(1)}
                  </div>
                  
                  {/* 趋势线 */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1 || 1)) * 90 + 5;
                        const y = d.position * 0.8 + 10;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                </div>
                
                {/* 日期标签 */}
                <div className="flex justify-between mt-1 px-2">
                  {chartData.length > 0 && (
                    <>
                      <span className="text-xs text-gray-400">{chartData[0].date}</span>
                      <span className="text-xs text-gray-400">{chartData[chartData.length - 1].date}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            {weightStats && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">起始</div>
                  <div className="font-semibold">{weightStats.first} kg</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">当前</div>
                  <div className="font-semibold">{weightStats.last} kg</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">变化</div>
                  <div className={`font-semibold flex items-center gap-1 ${
                    weightStats.change > 0 ? 'text-green-500' : weightStats.change < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {weightStats.change > 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : weightStats.change < 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {weightStats.change > 0 ? '-' : '+'}{Math.abs(weightStats.change).toFixed(1)} kg
                  </div>
                </div>
              </div>
            )}

            {/* 调整建议 */}
            {advice && weightRecords.length >= 2 && (
              <div className={`p-4 rounded-lg ${
                advice.includes('过快') ? 'bg-orange-50 border border-orange-200' :
                advice.includes('偏慢') ? 'bg-blue-50 border border-blue-200' :
                advice.includes('增加') ? 'bg-red-50 border border-red-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                    advice.includes('过快') ? 'text-orange-500' :
                    advice.includes('偏慢') ? 'text-blue-500' :
                    advice.includes('增加') ? 'text-red-500' :
                    'text-green-500'
                  }`} />
                  <p className={`text-sm ${
                    advice.includes('过快') ? 'text-orange-700' :
                    advice.includes('偏慢') ? 'text-blue-700' :
                    advice.includes('增加') ? 'text-red-700' :
                    'text-green-700'
                  }`}>
                    {advice}
                  </p>
                </div>
              </div>
            )}

            {/* 历史记录列表 */}
            {weightRecords.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-500 mb-2">历史记录</div>
                {weightRecords.slice().reverse().map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{record.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.weight} kg</span>
                      <button
                        onClick={() => deleteWeightRecord(record.date)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {weightRecords.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                暂无记录，开始记录您的体重变化吧
              </div>
            )}
          </CardContent>
        </Card>

        {/* 保存的饮食方案 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              收藏的饮食方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                暂无保存的方案，去生成并保存一个吧
              </div>
            ) : (
              <div className="space-y-3">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg">
                    <div
                      className="p-3 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        if (expandedPlan !== plan.id) {
                          setExpandedDays(prev => ({ ...prev, [plan.id]: 3 }));
                        }
                        setExpandedPlan(expandedPlan === plan.id ? null : plan.id);
                      }}
                    >
                      <div>
                        <div className="font-medium">
                          {plan.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {plan.carbs}g / {plan.protein}g / {plan.fat}g
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{plan.plans.length}天</span>
                        {expandedPlan === plan.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedPlan === plan.id && (
                      <div className="p-3 pt-0 border-t">
                        <div className="space-y-2">
                          {plan.plans.slice(0, expandedDays[plan.id] || 3).map((day) => {
                            // 从 items 数组获取食材名称
                            const getItemNames = (items: { ingredient: { name: string }; grams: number }[]) => {
                              return items.map(item => `${item.ingredient.name}${Math.round(item.grams)}g`).join(' + ');
                            };
                            
                            const breakfast = day.breakfast?.items ? getItemNames(day.breakfast.items) : '';
                            const lunch = day.lunch?.items ? getItemNames(day.lunch.items) : '';
                            const dinner = day.dinner?.items ? getItemNames(day.dinner.items) : '';
                            
                            return (
                              <div key={day.day} className="text-sm bg-gray-50 p-2 rounded">
                                <div className="font-medium mb-1">第{day.day}天</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div>早餐：{breakfast}</div>
                                  <div>午餐：{lunch}</div>
                                  <div>晚餐：{dinner}</div>
                                </div>
                              </div>
                            );
                          })}
                          {(expandedDays[plan.id] || 3) < plan.plans.length && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => setExpandedDays(prev => ({
                                ...prev,
                                [plan.id]: Math.min((prev[plan.id] || 3) + 3, plan.plans.length)
                              }))}
                            >
                              加载更多（还有 {plan.plans.length - (expandedDays[plan.id] || 3)} 天）
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlan(plan.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除此方案
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>}>
      <RecordContent />
    </Suspense>
  );
}
