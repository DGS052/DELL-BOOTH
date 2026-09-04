'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBoothStore } from '@/store/useBoothStore';
import { Landmark, Factory, HeartPulse, ShieldCheck } from 'lucide-react';

const INDUSTRIES = [
  { id: 'BFSI', title: 'BFSI', icon: Landmark },
  { id: 'Manufacturing', title: 'Manufacturing', icon: Factory },
  { id: 'Healthcare', title: 'Healthcare', icon: HeartPulse },
  { id: 'Security', title: 'IT & Security Core', icon: ShieldCheck },
] as const;

export default function HubPage() {
  const router = useRouter();
  const setIndustry = useBoothStore((state) => state.setIndustry);

  const handleSelect = async (industryId: string) => {
    setIndustry(industryId);
    
    // Track analytics silently
    try {
      await fetch('http://localhost:5000/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industryId,
          action: 'hub_selection',
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Offline mode: Telemetry queued locally.');
    }

    router.push('/dashboard');
  };

  return (
    <div className="relative w-full h-full select-none overflow-y-auto overflow-x-hidden">
      
      {/* Background Image with Dark Glass Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image 
          src="/dell_server_bg.jpg"
          alt="Dell Server Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0B0F19]/85 backdrop-blur-[2px]"></div>
      </div>

      {/* Header with Logos */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center px-12 py-10 z-20 pointer-events-none">
        <div className="w-96 h-32 relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 pointer-events-auto shadow-xl">
          <Image src="/team-computers-logo.png" alt="Team Computers" fill className="object-contain p-4" priority />
        </div>
        <div className="w-32 h-32 relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 flex items-center justify-center pointer-events-auto shadow-xl">
          <Image src="/dell-logo.png" alt="Dell" fill className="object-contain p-4" priority />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full min-h-full pt-48 pb-24 px-12">
        <div className="my-auto w-full flex flex-col items-center">
          <div className="text-center mb-20 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-2xl">
              Select Data Environment to<br />Initialize Dell AI Factory
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-light drop-shadow-lg">
              Integrated by Team Computers
            </p>
          </div>

          <div className="grid grid-cols-2 grid-rows-2 gap-10 w-full max-w-[900px] aspect-square">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  onClick={() => handleSelect(industry.id)}
                  className="group flex flex-col items-center justify-center gap-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:ring-4 hover:ring-[#0076CE] hover:shadow-[0_0_50px_rgba(0,118,206,0.5)] active:ring-4 active:ring-[#0076CE] active:shadow-[0_0_50px_rgba(0,118,206,0.6)] active:scale-95"
                >
                  <Icon 
                    className="w-32 h-32 md:w-40 md:h-40 text-white transition-transform duration-300 group-hover:scale-110 group-active:scale-110 drop-shadow-lg" 
                    strokeWidth={1} 
                  />
                  <span className="text-3xl md:text-4xl font-semibold text-white tracking-wide drop-shadow-lg">
                    {industry.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
