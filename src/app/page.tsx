'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calculator,
  Utensils,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-background/80">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-green-700 dark:text-green-400">
              减脂计算器
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/knowledge">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <BookOpen className="mr-1 h-4 w-4" />
                知识库
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero 区域 */}
        <section className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-1.5 text-sm text-green-700 dark:bg-green-900 dark:text-green-300">
            <Sparkles className="mr-1.5 h-4 w-4" />
            三个月科学减脂计划
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
            「剪纸拉锯战」
            <br />
            <span className="text-green-600 dark:text-green-400">减脂计算器</span>
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-600 dark:text-gray-300">
            减脂 ≠ 减重。三个月是一个周期，我们把它叫做「拉锯战」。
            <br />
            科学的减脂需要耐心和正确的方法，让工具帮你计算，你只需要坚持。
          </p>

          {/* 核心入口 */}
          <Link href="/calculator" className="inline-block">
            <Button
              size="lg"
              className="group h-14 px-8 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
            >
              <Calculator className="mr-2 h-5 w-5" />
              开始计算
              <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>

        {/* 亮点卡片 */}
        <section className="mx-auto mt-12 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-0 shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">不用算基础代谢</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  输入体重和运动时长，自动计算三大营养素
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-base">动态调整</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  适配体重变化，每7-10天重新评估调整
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">生活化食材</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  不用吃补剂，日常食材即可满足营养需求
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 功能入口 */}
        <section className="mx-auto mt-12 max-w-md">
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
            功能模块
          </h2>
          <div className="space-y-3">
            <Link href="/calculator">
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-green-300 dark:hover:border-green-700">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                    <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      个性化摄入量计算器
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      输入4项信息，自动计算每日营养素
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/adjust">
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      动态调整工具
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      根据体重变化，智能调整营养素
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/knowledge">
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      知识库
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      核心认知、常见问题、执行提醒
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      {/* 底部 */}
      <footer className="mt-16 border-t py-6 text-center text-sm text-muted-foreground">
        <p>减脂计算器 · 科学减脂，轻松瘦身</p>
        <p className="mt-1 text-xs">Get达人 出品</p>
      </footer>
    </div>
  );
}
