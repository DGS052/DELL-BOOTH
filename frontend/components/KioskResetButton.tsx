'use client';
import { useKioskReset } from '@/hooks/useKioskReset';

export default function KioskResetButton() {
  const handleReset = useKioskReset();
  
  return (
    <div
      onClick={handleReset}
      className="absolute top-0 right-0 w-16 h-16 opacity-0 z-50 cursor-pointer"
      title="Secret Reset Button"
    />
  );
}
