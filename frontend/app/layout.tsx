import type { Metadata } from 'next';
import './globals.css';
import KioskResetButton from '@/components/KioskResetButton';

export const metadata: Metadata = {
  title: 'Dell AI Factory Kiosk',
  description: 'Event Kiosk App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-brand-background text-white antialiased">
        <KioskResetButton />
        <div className="w-full min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
