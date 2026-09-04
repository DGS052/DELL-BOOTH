'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBoothStore } from '@/store/useBoothStore';

export const useKioskReset = () => {
  const router = useRouter();
  const clickTimes = useRef<number[]>([]);

  const handleKioskResetClick = () => {
    const now = Date.now();
    clickTimes.current.push(now);

    // Keep only clicks within the last 2000ms
    clickTimes.current = clickTimes.current.filter((time) => now - time <= 2000);

    if (clickTimes.current.length >= 3) {
      console.log('Kiosk Reset Triggered!');
      
      // Clear localStorage and session storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Reset Zustand store
      useBoothStore.getState().resetStore();
      
      
      router.push('/');
      clickTimes.current = [];
    }
  };

  return handleKioskResetClick;
};
