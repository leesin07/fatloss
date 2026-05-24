'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Utensils, History } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/calculator', label: '计算', icon: Calculator },
  { href: '/plan', label: '方案', icon: Utensils },
  { href: '/record', label: '记录', icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
