'use client';

import Link from 'next/link';
import { Calculator, History, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* 顶部区域 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            减脂饮食助手
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            科学计算营养需求，智能匹配饮食方案
          </p>
        </div>

        {/* 主要入口 */}
        <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
          <Link href="/calculator" className="block">
            <Card className="h-full hover:shadow-lg transition-all hover:border-green-500 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors">
                    <Calculator className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-green-700">开始计算</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  输入基本信息，计算每日营养素需求，获取10天饮食方案
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/record" className="block">
            <Card className="h-full hover:shadow-lg transition-all hover:border-blue-500 cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                    <History className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl text-blue-700">查看记录</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  记录体重变化，查看趋势图，获取调整建议
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>减脂是一个周期，建议给自己3个月的时间</p>
        </div>
      </div>
    </div>
  );
}
