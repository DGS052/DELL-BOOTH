'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Lottie } from 'lottie-react';
import { useBoothStore } from '@/store/useBoothStore';

interface ActionPipelineProps {
  title: string;
  buttonText: string;
  resolutionText: string;
  animationData: any;
}

export default function ActionPipeline({ title, buttonText, resolutionText, animationData }: ActionPipelineProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'resolved'>('idle');
  const { selectedIndustry } = useBoothStore();

  const handleClick = async () => {
    if (status === 'processing') return;
    setStatus('processing');
    
    // Track analytics silently
    try {
      await fetch('http://localhost:5000/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedIndustry || 'Unknown',
          action: 'pipeline_triggered',
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Offline mode: Telemetry queued locally.');
    }

    setTimeout(() => {
      setStatus('resolved');
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 gap-6">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-bold text-white tracking-wide">{title}</h2>
      </div>

      {/* Animation Container (Top 60%) */}
      <div className="flex-[0.6] min-h-0 border border-white/10 rounded-xl bg-black/40 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-[#0076CE]/50 transition-all duration-700 z-10 pointer-events-none"></div>
        
        {/* Lottie Player */}
        {status === 'idle' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {animationData ? (
              <Lottie src={animationData} loop={true} className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-500 font-mono text-lg uppercase tracking-widest">
                [ Animation Placeholder ]
              </div>
            )}
          </div>
        )}
        
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4 text-[#0076CE]">
            <Loader2 className="w-16 h-16 animate-spin" />
            <span className="font-mono uppercase tracking-widest animate-pulse">Processing...</span>
          </div>
        )}
        
        {status === 'resolved' && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-[#76B900]/20 border border-[#76B900] mx-auto flex items-center justify-center">
              <svg className="w-12 h-12 text-[#76B900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* CTA Container (Bottom 40%) */}
      <div className="flex-[0.4] min-h-0 flex flex-col items-center justify-center gap-6">
        {status === 'resolved' ? (
          <div className="text-center flex flex-col items-center gap-4">
            <h3 className="text-3xl md:text-4xl font-bold text-[#76B900] tracking-wide">
              {resolutionText}
            </h3>
            <button 
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Reset Simulation
            </button>
          </div>
        ) : (
          <button 
            onClick={handleClick}
            disabled={status === 'processing'}
            className="w-full max-w-2xl h-24 bg-gradient-to-r from-[#0076CE] to-[#005B9F] hover:from-[#0082E6] hover:to-[#0066B3] active:scale-[0.98] text-white text-3xl font-bold rounded-2xl shadow-[0_0_30px_rgba(0,118,206,0.4)] transition-all duration-200 flex items-center justify-center gap-4 disabled:opacity-80 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin" />
                Executing...
              </>
            ) : (
              buttonText
            )}
          </button>
        )}
      </div>
    </div>
  );
}
