'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNavigation from '@/components/BottomNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠', href: '/dashboard' },
    { id: 'goals', name: 'Goals', icon: '🎯', href: '/goals' },
    { id: 'checkin', name: 'Check-In', icon: '✅', href: '/checkin' },
    { id: 'coach', name: 'AI Coach', icon: '🤖', href: '/coach' },
    { id: 'insights', name: 'Insights', icon: '📊', href: '/insights' },
    { id: 'chat', name: 'Chat', icon: '💬', href: '/chat' },
    { id: 'analysis', name: 'Analysis', icon: '📈', href: '/analysis' },
    { id: 'reflection', name: 'Reflect', icon: '🧘', href: '/reflection' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  // Mobile-first layout - no header navigation needed since each page has its own mobile UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default DashboardLayout; 