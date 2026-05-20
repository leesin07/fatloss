'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface WeightRecord {
  id: number;
  date: string;
  weight: number;
  exercise: string;
  gender: 'male' | 'female' | null;
  format?: 'raw' | 'cooked';
  preference?: string;
  carbs: number;
  protein: number;
  fat: number;
}

// 运动时长映射
const exerciseLabels: Record<string, string> = {
  '2-3': '2-3h/周',
  '4-5': '4-5h/周',
  '6-7': '6-7h/周',
  '8-9': '8-9h/周',
};

export default function RecordPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [showDelete, setShowDelete] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('fatLossRecords');
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, []);

  const addWeightRecord = () => {
    const weightNum = parseFloat(newWeight);
    if (!weightNum || weightNum <= 0) return;

    const lastRecord = records[0];
    if (!lastRecord) {
      alert('请先在计算器页面计算营养素');
      return;
    }

    const newRecord: WeightRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      weight: weightNum,
      exercise: lastRecord.exercise,
      gender: lastRecord.gender,
      format: lastRecord.format,
      preference: lastRecord.preference,
      carbs: lastRecord.carbs,
      protein: lastRecord.protein,
      fat: lastRecord.fat,
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('fatLossRecords', JSON.stringify(updated.slice(0, 30)));
    setNewWeight('');
  };

  const deleteRecord = (id: number) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem('fatLossRecords', JSON.stringify(updated));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  };

  const getAnalysis = () => {
    if (records.length < 2) return null;

    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0].weight;
    const previous = sorted[1].weight;
    const change = latest - previous;
    const daysDiff = Math.ceil((new Date(sorted[0].date).getTime() - new Date(sorted[1].date).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const weeklyChange = (change / daysDiff) * 7;

    let status: 'fast' | 'normal' | 'slow' | 'gain';
    let message: string;

    if (change > 0) {
      status = 'gain';
      message = `体重增加 ${change.toFixed(1)}kg，建议检查饮食是否超标，适当减少碳水15-20g`;
    } else if (weeklyChange < -1.5) {
      status = 'fast';
      message = `掉秤过快（约${Math.abs(weeklyChange).toFixed(1)}kg/周），建议增加碳水10-15g，防止肌肉流失`;
    } else if (weeklyChange > -0.3) {
      status = 'slow';
      message = `掉秤偏慢（约${Math.abs(weeklyChange).toFixed(1)}kg/周），建议减少碳水10-15g，增加运动`;
    } else {
      status = 'normal';
      message = `掉秤正常（约${Math.abs(weeklyChange).toFixed(1)}kg/周），继续保持！`;
    }

    return { latest, previous, change, weeklyChange, status, message };
  };

  const analysis = getAnalysis();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-card">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-5 w-5" />
            返回
          </Link>
          <h1 className="ml-4 text-lg font-semibold">我的记录</h1>
          {records.length > 0 && (
            <button
              onClick={() => setShowDelete(!showDelete)}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground"
            >
              {showDelete ? '完成' : '编辑'}
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6">
        {/* 添加体重记录 */}
        {records.length > 0 && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="今日体重"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="flex-1 h-11"
                  step="0.1"
                />
                <Button onClick={addWeightRecord} disabled={!newWeight} className="h-11 px-4 bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-1" />
                  记录
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析结果 */}
        {analysis && (
          <Card className={`mb-4 ${
            analysis.status === 'normal' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
            analysis.status === 'fast' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
            analysis.status === 'slow' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
            'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                {analysis.status === 'normal' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    analysis.status === 'fast' ? 'text-red-600 dark:text-red-400' :
                    analysis.status === 'slow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {analysis.change > 0 ? (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" /> +{analysis.change.toFixed(1)}kg
                        </span>
                      ) : analysis.change < 0 ? (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4" /> {analysis.change.toFixed(1)}kg
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Minus className="h-4 w-4" /> 持平
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {analysis.weeklyChange.toFixed(1)}kg/周
                    </span>
                  </div>
                  <p className={`text-sm ${
                    analysis.status === 'normal' ? 'text-green-700 dark:text-green-300' :
                    analysis.status === 'fast' ? 'text-red-700 dark:text-red-300' :
                    analysis.status === 'slow' ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-orange-700 dark:text-orange-300'
                  }`}>
                    {analysis.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {records.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-4">还没有记录</p>
            <Link href="/calculator">
              <Button className="bg-green-500 hover:bg-green-600">
                开始计算营养素
              </Button>
            </Link>
          </div>
        )}

        {/* 记录列表 */}
        {records.length > 0 && (
          <div className="space-y-3">
            {records.map((record, index) => (
              <Card key={record.id} className={index === 0 ? 'border-green-300 dark:border-green-700' : ''}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{record.weight}kg</span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            当前
                          </span>
                        )}
                        {showDelete && (
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(record.date)}
                        {record.exercise && ` · ${exerciseLabels[record.exercise] || record.exercise}`}
                      </div>
                    </div>
                    <div className="flex gap-3 text-center text-sm">
                      <div>
                        <div className="font-medium text-orange-600 dark:text-orange-400">{record.carbs}g</div>
                        <div className="text-xs text-muted-foreground">碳水</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600 dark:text-red-400">{record.protein}g</div>
                        <div className="text-xs text-muted-foreground">蛋白质</div>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-600 dark:text-yellow-400">{record.fat}g</div>
                        <div className="text-xs text-muted-foreground">脂肪</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        {records.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            建议每7-10天记录一次体重，观察变化趋势
          </p>
        )}
      </main>
    </div>
  );
}
