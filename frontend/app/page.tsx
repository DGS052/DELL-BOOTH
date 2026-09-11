'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBoothStore } from '@/store/useBoothStore';
import { Landmark, Factory, HeartPulse, ShieldCheck, Grid } from 'lucide-react';

const INDUSTRIES = [
  { id: 'BFSI', title: 'BFSI', icon: Landmark },
  { id: 'Manufacturing', title: 'Manufacturing', icon: Factory },
  { id: 'Healthcare', title: 'Healthcare / Pharma', icon: HeartPulse },
  { id: 'Security', title: 'IT & Security Core', icon: ShieldCheck },
  { id: 'Others', title: 'Others', icon: Grid },
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

    if (industryId === 'BFSI') {
      window.location.href = '/index3.html';
    } else if (industryId === 'Manufacturing') {
      window.location.href = '/index.html';
    } else if (industryId === 'Healthcare') {
      window.location.href = '/index2.html';
    } else if (industryId === 'Security') {
      window.location.href = '/index4.html';
    } else if (industryId === 'Others') {
      window.location.href = '/index5.html';
    } else {
      router.push('/dashboard');
    }
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
      <div className="fixed top-0 left-0 w-full flex justify-between items-center px-12 py-6 z-20 bg-white shadow-md pointer-events-auto">
        <div className="w-72 h-24 relative flex items-center justify-center">
          <Image src="/team-computers-logo.png" alt="Team Computers" fill className="object-contain" priority />
        </div>
        <div className="w-72 h-24 relative flex items-center justify-center">
          <Image src="/dell-logo.png" alt="Dell Technologies Titanium Partner" fill className="object-contain" priority />
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

          <div className="grid grid-cols-2 gap-10 w-full max-w-[900px]">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              const isOthers = industry.id === 'Others';
              return (
                <button
                  key={industry.id}
                  onClick={() => handleSelect(industry.id)}
                  className={`group flex flex-col items-center justify-center gap-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:ring-4 hover:ring-[#0076CE] hover:shadow-[0_0_50px_rgba(0,118,206,0.5)] active:ring-4 active:ring-[#0076CE] active:shadow-[0_0_50px_rgba(0,118,206,0.6)] active:scale-95 ${
                    isOthers ? 'col-span-2 aspect-[2.1/1]' : 'aspect-square'
                  }`}
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

          {/* Dell AI Factory Info Section */}
          <div className="w-full max-w-[1200px] mt-32 mb-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">Your way to AI</h2>
            <p className="text-gray-300 text-center max-w-[900px] text-sm md:text-base leading-relaxed mb-16">
              Welcome to the Dell AI Factory with NVIDIA, where two trusted infrastructure leaders unite to deliver a secure, sovereign-ready, full-stack AI foundation that keeps AI on your terms for any organisation. As the broadest end-to-end AI portfolio, it takes agentic AI from pilot to production with data control, governance, and compliance-readiness built in, so you move from idea to impact with one provider.
            </p>

            <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-stretch gap-8 pt-8 border-t border-white/10">
              {/* Stat 1 */}
              <div className="flex flex-col items-center flex-1 px-4 text-center">
                <span className="text-lg text-white font-medium mb-4">Reduce Spend</span>
                <span className="text-sm text-gray-300 mb-2">up to</span>
                <span className="text-6xl md:text-7xl font-light text-white tracking-tight mb-4">87%</span>
                <span className="text-xs text-gray-400">compared to cloud APIs over 2-years *</span>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px bg-white/10 my-4" />

              {/* Stat 2 */}
              <div className="flex flex-col items-center flex-1 px-4 text-center">
                <span className="text-lg text-white font-medium mb-4">Deploy</span>
                <span className="text-sm text-gray-300 mb-2">an average of</span>
                <span className="text-5xl md:text-6xl font-light text-white tracking-tight leading-tight mb-4">1 Week<br />Faster</span>
                <span className="text-xs text-gray-400">with Dell AI Factory Foundation *</span>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px bg-white/10 my-4" />

              {/* Stat 3 */}
              <div className="flex flex-col items-center flex-1 px-4 text-center">
                <span className="text-lg text-white font-medium mb-4">Trusted by</span>
                <span className="text-sm text-gray-300 mb-2">over</span>
                <span className="text-6xl md:text-7xl font-light text-white tracking-tight mb-4">5,000</span>
                <span className="text-xs text-gray-400">customers worldwide use Dell AI Factory *</span>
              </div>
            </div>

            <div className="w-full flex justify-center mt-20">
              <a href="https://www.dell.com/en-in/lp/nvidia-ai#usecases" target="_blank" rel="noopener noreferrer" className="block relative w-[32rem] h-40 opacity-95 hover:opacity-100 transition-all hover:-translate-y-1 duration-300 drop-shadow-xl">
                <Image src="/dell-ai-factory-nvidia-logo.png" alt="Dell AI Factory with Nvidia" fill className="object-contain" priority />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
