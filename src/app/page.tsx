'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, TrendingUp, ChevronRight, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
      <main className="container mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-64px)]">
        {/* Logo & 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 text-white mb-4">
            <Target className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            减脂计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            科学计算 · AI配餐 · 智能调整
          </p>
        </div>

        {/* 核心功能入口 */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-4">
          {/* 主入口 - 计算营养素 */}
          <Link href="/calculator" className="block">
            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-green-400 dark:hover:border-green-600 border-2">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Calculator className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      计算每日摄入量
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      输入体重和运动量，获取专属营养素目标
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 次入口 - 我的记录 */}
          <Link href="/record" className="block">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      我的记录
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      记录体重变化，获取智能调整建议
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            减脂是一个周期，给自己3个月的时间
          </p>
        </div>
      </main>
    </div>
  );
}
