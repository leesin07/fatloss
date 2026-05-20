'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  BookOpen,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Scale,
  Flame,
  Clock,
  Target,
} from 'lucide-react';

export default function KnowledgePage() {
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
          <h1 className="ml-4 text-lg font-semibold">知识库</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 核心认知 */}
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <BookOpen className="h-5 w-5 text-green-600" />
            核心认知
          </h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900 flex-shrink-0">
                  <Scale className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    减脂 ≠ 减重
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    减重可能丢失水分和肌肉，减脂才是真正的目标。不要只看体重数字，
                    更要关注体脂率和身体围度的变化。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900 flex-shrink-0">
                  <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    热量缺口是核心
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    想要减脂，必须制造热量缺口。但缺口不能太大，否则会导致代谢下降、
                    肌肉流失。合理的缺口是每日300-500大卡。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    三个月周期
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    科学减脂需要时间，三个月是一个完整的周期。身体需要适应新的代谢模式，
                    给自己足够的耐心，不要急于求成。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    生活化减脂
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    不要追求极端饮食，选择你能长期坚持的方式。生活化减脂才能持久，
                    水煮菜、零碳水都不是长期之计。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 常见问题 */}
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            常见问题
          </h2>
          <Card>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-left">
                    生重和熟重有什么区别？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      生重是食材烹饪前的重量，熟重是烹饪后的重量。一般肉类煮熟后会缩水，
                      生熟比约为1:0.7（即100g生肉煮熟约70g）。计算营养素时，生重更准确，
                      因为烹饪方法会影响重量变化。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2">
                  <AccordionTrigger className="text-left">
                    油脂应该怎么选择？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      推荐使用橄榄油、山茶油、牛油果油等富含不饱和脂肪酸的油脂。
                      烹饪时控制用油量，建议每日用油不超过20-30ml。
                      避免使用反复加热的油脂，也不要完全不吃油，油脂对激素分泌很重要。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3">
                  <AccordionTrigger className="text-left">
                    盐应该怎么控制？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      建议每日盐摄入量不超过5g（约一啤酒瓶盖）。注意隐形钠来源：
                      酱油、耗油、豆瓣酱、腌制食品、加工肉类等都有较高的钠含量。
                      减盐不是完全不吃盐，而是控制总量。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4">
                  <AccordionTrigger className="text-left">
                    为什么体重不掉但看起来瘦了？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      这是因为你在减脂的同时可能增加了肌肉（或保持了肌肉），
                      肌肉比脂肪密度大、体积小。这是非常好的状态，说明身体成分在改善。
                      关注体脂率和围度变化比关注体重更重要。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5">
                  <AccordionTrigger className="text-left">
                    减脂期可以吃水果吗？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      可以吃，但要选择低糖水果并控制量。推荐：苹果、柚子、草莓、
                      蓝莓等。建议放在两餐之间作为加餐，每日不超过200g。
                      高糖水果如葡萄、荔枝、榴莲要少吃。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q6">
                  <AccordionTrigger className="text-left">
                    运动前后应该怎么吃？
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      运动前1-2小时可以吃一些碳水（如香蕉、燕麦）提供能量。
                      运动后30分钟内补充蛋白质（如鸡蛋、鸡胸肉）帮助肌肉恢复。
                      力量训练后尤其要注意蛋白质摄入。
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* 执行提醒 */}
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            执行提醒
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>不要天天称体重</strong>
                  <br />
                  体重每天波动1-2kg是正常的，建议每周固定时间（如周一早上空腹）称一次。
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>每10天拍对比图</strong>
                  <br />
                  照镜子、拍照片比称体重更能反映真实的身体变化。固定角度、光线，对比更准确。
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>保证充足睡眠</strong>
                  <br />
                  睡眠不足会影响激素分泌，增加食欲，降低代谢。每天保证7-8小时睡眠。
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>多喝水</strong>
                  <br />
                  每天喝够体重×30-40ml的水。水能促进代谢，减少假性饥饿感。
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>不要过度节食</strong>
                  <br />
                  过度节食会导致代谢下降、肌肉流失、暴食反弹。科学减脂，不要走极端。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
