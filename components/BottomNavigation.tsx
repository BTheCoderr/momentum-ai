'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Home',
    path: '/dashboard',
    icon: '🏠',
    emoji: '🏠'
  },
  {
    name: 'Goals',
    path: '/goals',
    icon: '🎯',
    emoji: '🎯'
  },
  {
    name: 'Progress',
    path: '/progress',
    icon: '📊',
    emoji: '📊'
  },
  {
    name: 'AI Coach',
    path: '/coach',
    icon: '🤖',
    emoji: '🤖'
  },
  {
    name: 'Check-In',
    path: '/checkin',
    icon: '📝',
    emoji: '📝'
  }
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-orange-500 transform scale-110' 
                  : 'text-gray-500 hover:text-orange-400'
              }`}
            >
              <span 
                className={`text-2xl transition-transform duration-200 ${
                  isActive ? 'transform scale-125' : ''
                }`}
              >
                {item.emoji}
              </span>
              <span 
                className={`text-xs font-medium ${
                  isActive ? 'text-orange-500' : 'text-gray-600'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 