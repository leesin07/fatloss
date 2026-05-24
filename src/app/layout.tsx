import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: {
    default: '减脂计算器 | 科学减脂，轻松瘦身',
    template: '%s | 减脂计算器',
  },
  description:
    '面向零基础减脂人群的生活化减脂个性化工具，核心解决手动算摄入量麻烦、不知道怎么搭配具体食物、不会做动态调整三个痛点，让普通人不用懂营养学，就能跟着三个月科学减脂计划走。',
  keywords: [
    '减脂计算器',
    '减脂',
    '瘦身',
    '营养素计算',
    '饮食方案',
    '健康减肥',
    '三个月减脂计划',
  ],
  authors: [{ name: 'Get达人' }],
  generator: 'Coze Code',
  openGraph: {
    title: '减脂计算器 | 科学减脂，轻松瘦身',
    description:
      '面向零基础减脂人群的生活化减脂个性化工具，让普通人不用懂营养学，就能跟着三个月科学减脂计划走。',
    siteName: '减脂计算器',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#22c55e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50">
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
