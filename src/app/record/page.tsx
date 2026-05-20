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
  ChevronDown,
  ChevronUp,
  Sun,
  CloudSun,
  Moon,
  Utensils,
  Flame,
  RotateCcw,
  AlertTriangle,
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

interface DayPlan {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function RecordPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [showAllRecords, setShowAllRecords] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

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

  // 重置所有数据
  const resetAllData = () => {
    localStorage.removeItem('fatLossRecords');
    localStorage.removeItem('mealPlans');
    setRecords([]);
    setPlans([]);
    setSelectedPlan(null);
    setShowResetConfirm(false);
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

  const formatPlanDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 解析方案文本
  const parsePlan = (text: string): DayPlan[] => {
    const days: DayPlan[] = [];
    const dayPattern = /第\s*(\d+)\s*天[：:]/g;
    let match;
    
    const dayPositions: { day: number; start: number }[] = [];
    while ((match = dayPattern.exec(text)) !== null) {
      dayPositions.push({ day: parseInt(match[1]), start: match.index });
    }

    for (let i = 0; i < dayPositions.length; i++) {
      const current = dayPositions[i];
      const next = dayPositions[i + 1];
      const dayContent = text.slice(current.start, next?.start);

      const breakfastMatch = dayContent.match(/早[餐食][：:]\s*([\s\S]*?)(?=午[餐食]|晚[餐食]|$)/);
      const lunchMatch = dayContent.match(/午[餐食][：:]\s*([\s\S]*?)(?=晚[餐食]|第\s*\d+\s*天|$)/);
      const dinnerMatch = dayContent.match(/晚[餐食][：:]\s*([\s\S]*?)(?=第\s*\d+\s*天|$)/);

      days.push({
        day: current.day,
        breakfast: breakfastMatch?.[1]?.trim() || '',
        lunch: lunchMatch?.[1]?.trim() || '',
        dinner: dinnerMatch?.[1]?.trim() || '',
      });
    }

    return days;
  };

  // 渲染单个餐次
  const MealCard = ({ 
    type, 
    content, 
    icon: Icon, 
    colorClass 
  }: { 
    type: string; 
    content: string; 
    icon: React.ElementType;
    colorClass: string;
  }) => {
    if (!content) return null;
    
    const lines = content.split('\n').filter(l => l.trim());
    
    return (
      <div className={`rounded-xl p-3 ${colorClass}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{type}</span>
        </div>
        <div className="space-y-2">
          {lines.map((line, idx) => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '');
            const isTitle = cleanLine.includes('食材') && cleanLine.includes('：');
            const isRecipe = cleanLine.includes('做法') || cleanLine.includes('步骤');
            
            return (
              <div key={idx} className="text-sm leading-relaxed">
                {isTitle ? (
                  <div className="flex items-start gap-2 font-medium text-foreground">
                    <Utensils className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{cleanLine}</span>
                  </div>
                ) : isRecipe ? (
                  <div className="mt-2 pt-2 border-t border-white/30">
                    <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
                      <Flame className="h-3.5 w-3.5" />
                      <span>做法</span>
                    </div>
                    <p className="text-muted-foreground pl-5">{cleanLine.replace(/^做法[：:]?\s*/, '')}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground pl-5">{cleanLine}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const trend = getTrend();
  const suggestion = getAdjustmentSuggestion();

  // 趋势图数据
  const chartData = records.slice(0, 10).reverse();
  const minWeight = Math.min(...chartData.map(r => r.weight)) - 1;
  const maxWeight = Math.max(...chartData.map(r => r.weight)) + 1;
  const weightRange = maxWeight - minWeight || 1;

  // 计算SVG坐标
  const chartWidth = chartData.length * 50;
  const chartHeight = 120;
  const padding = { left: 35, right: 15, top: 20, bottom: 25 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (chartData.length - 1 || 1)) * graphWidth;
  const getY = (weight: number) => padding.top + (1 - (weight - minWeight) / weightRange) * graphHeight;

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

      <main className="container mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* 添加体重记录 */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm font-medium mb-3">记录今日体重</h3>
            <div className="flex gap-2">
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
              <span className="flex items-center text-muted-foreground text-sm">kg</span>
              <Button onClick={addWeightRecord} disabled={!newWeight} className="h-11 px-4">
                记录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 体重趋势图 */}
        {chartData.length >= 2 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">体重趋势</h3>
                {trend && (
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    trend.type === 'down' ? 'text-green-600' : trend.type === 'up' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {trend.type === 'down' && <TrendingDown className="h-4 w-4" />}
                    {trend.type === 'up' && <TrendingUp className="h-4 w-4" />}
                    {trend.type === 'stable' && <Minus className="h-4 w-4" />}
                    {trend.type === 'down' ? '-' : trend.type === 'up' ? '+' : ''}{trend.value}kg
                  </span>
                )}
              </div>
              
              {/* SVG 趋势图 */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full"
                  style={{ minWidth: '280px' }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Y轴刻度 */}
                  <text x="8" y={padding.top + 4} className="text-[10px] fill-gray-400">
                    {maxWeight.toFixed(1)}
                  </text>
                  <text x="8" y={chartHeight - padding.bottom + 4} className="text-[10px] fill-gray-400">
                    {minWeight.toFixed(1)}
                  </text>
                  
                  {/* 网格线 */}
                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={chartWidth - padding.right}
                    y2={padding.top}
                    stroke="currentColor"
                    className="text-gray-200 dark:text-gray-700"
                    strokeDasharray="4"
                  />
                  <line
                    x1={padding.left}
                    y1={chartHeight - padding.bottom}
                    x2={chartWidth - padding.right}
                    y2={chartHeight - padding.bottom}
                    stroke="currentColor"
                    className="text-gray-200 dark:text-gray-700"
                    strokeDasharray="4"
                  />
                  
                  {/* 趋势区域填充 */}
                  <polygon
                    points={`${getX(0)},${chartHeight - padding.bottom} ${chartData.map((r, i) => `${getX(i)},${getY(r.weight)}`).join(' ')} ${getX(chartData.length - 1)},${chartHeight - padding.bottom}`}
                    fill="url(#gradient)"
                    opacity="0.3"
                  />
                  
                  {/* 渐变定义 */}
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* 趋势线 */}
                  <polyline
                    points={chartData.map((r, i) => `${getX(i)},${getY(r.weight)}`).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  
                  {/* 数据点和标签 */}
                  {chartData.map((r, i) => (
                    <g key={r.id}>
                      <circle
                        cx={getX(i)}
                        cy={getY(r.weight)}
                        r="4"
                        fill="#22c55e"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={getX(i)}
                        y={getY(r.weight) - 10}
                        textAnchor="middle"
                        className="text-[10px] font-medium fill-gray-600 dark:fill-gray-300"
                      >
                        {r.weight}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                最近 {chartData.length} 次记录
              </p>
            </CardContent>
          </Card>
        )}

        {/* 调整建议 */}
        {suggestion && (
          <Card className={`${
            suggestion.type === 'good' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30' :
            suggestion.type === 'warning' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30' :
            'border-gray-200'
          }`}>
            <CardContent className="py-4">
              <h3 className="text-sm font-medium mb-2">💡 调整建议</h3>
              <p className={`text-sm ${
                suggestion.type === 'good' ? 'text-green-700 dark:text-green-400' :
                suggestion.type === 'warning' ? 'text-orange-700 dark:text-orange-400' :
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
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedPlan(p)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{p.weight}kg</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPlanDate(p.date)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.format === 'raw' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {p.format === 'raw' ? '生重' : '熟重'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        碳水 {p.carbs}g · 蛋白 {p.protein}g · 脂肪 {p.fat}g
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
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
              <div 
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                <h3 className="text-sm font-medium">体重记录</h3>
                <div className="flex items-center text-muted-foreground text-xs">
                  共 {records.length} 条
                  {showAllRecords ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              <div className="space-y-2">
                {(showAllRecords ? records : records.slice(0, 5)).map((record, index) => {
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
                          <span className={`text-xs font-medium ${
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
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
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
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">暂无记录</p>
            <p className="text-sm text-muted-foreground mt-2">
              去 <Link href="/calculator" className="text-green-600 hover:underline font-medium">计算摄入量</Link> 开始吧
            </p>
          </div>
        )}

        {/* 重置按钮 */}
        {(records.length > 0 || plans.length > 0) && (
          <div className="pt-4 pb-8">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置所有数据
            </Button>
          </div>
        )}
      </main>

      {/* 方案详情弹窗 */}
      {selectedPlan && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setSelectedPlan(null)}
        >
          <Card 
            className="w-full max-w-lg max-h-[90vh] overflow-hidden sm:mx-4 rounded-b-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-0">
              {/* 弹窗头部 */}
              <div className="sticky top-0 bg-white dark:bg-card border-b px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">饮食方案</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlan.weight}kg · {selectedPlan.format === 'raw' ? '生重' : '熟重'} · {formatPlanDate(selectedPlan.date)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPlan(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* 营养素 */}
              <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-around text-center">
                  <div>
                    <span className="font-bold text-orange-600 text-lg">{selectedPlan.carbs}g</span>
                    <span className="text-muted-foreground text-xs ml-1">碳水</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <span className="font-bold text-red-600 text-lg">{selectedPlan.protein}g</span>
                    <span className="text-muted-foreground text-xs ml-1">蛋白质</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <span className="font-bold text-yellow-600 text-lg">{selectedPlan.fat}g</span>
                    <span className="text-muted-foreground text-xs ml-1">脂肪</span>
                  </div>
                </div>
              </div>
              
              {/* 方案内容 - 卡片式展示 */}
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                {parsePlan(selectedPlan.plan).map((dayPlan) => (
                  <div key={dayPlan.day} className="border rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                          {dayPlan.day}
                        </div>
                        <span className="font-medium text-sm">第 {dayPlan.day} 天</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      <MealCard 
                        type="早餐" 
                        content={dayPlan.breakfast} 
                        icon={Sun}
                        colorClass="bg-amber-50 dark:bg-amber-950/30"
                      />
                      <MealCard 
                        type="午餐" 
                        content={dayPlan.lunch} 
                        icon={CloudSun}
                        colorClass="bg-orange-50 dark:bg-orange-950/30"
                      />
                      <MealCard 
                        type="晚餐" 
                        content={dayPlan.dinner} 
                        icon={Moon}
                        colorClass="bg-indigo-50 dark:bg-indigo-950/30"
                      />
                    </div>
                  </div>
                ))}
                
                {/* 如果解析失败，显示原始内容 */}
                {parsePlan(selectedPlan.plan).length === 0 && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedPlan.plan}
                  </div>
                )}
                
                <p className="text-xs text-center text-muted-foreground pt-2">
                  ⚠️ 所有食材重量为【{selectedPlan.format === 'raw' ? '生重' : '熟重'}】
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <Card 
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">确认重置？</h3>
                  <p className="text-sm text-muted-foreground">此操作不可恢复</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                将清除所有体重记录和饮食方案数据，确定要继续吗？
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowResetConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={resetAllData}
                >
                  确认重置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
