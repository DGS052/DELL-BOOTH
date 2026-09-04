'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoothStore } from '@/store/useBoothStore';
import { ArrowLeft } from 'lucide-react';
import ComparativeROI from '@/components/charts/ComparativeROI';
import BFSIMetricsSwitcher from '@/components/charts/BFSIMetricsSwitcher';
import ManufacturingDashboard from '@/components/charts/ManufacturingDashboard';
import HealthcareDashboard from '@/components/charts/HealthcareDashboard';
import ITSecurityDashboard from '@/components/charts/ITSecurityDashboard';
import ActionPipeline from '@/components/animations/ActionPipeline';

export default function DashboardPage() {
  const router = useRouter();
  const { selectedIndustry, resetStore } = useBoothStore();

  useEffect(() => {
    if (!selectedIndustry) {
      router.replace('/');
    }
  }, [selectedIndustry, router]);

  if (!selectedIndustry) {
    return null; // Return null while redirecting to prevent hydration errors or flashes
  }

  const handleBack = () => {
    resetStore();
    router.push('/');
  };

  // Determine Dynamic Props based on industry
  let pipelineProps = {
    title: 'Simulation',
    buttonText: 'Execute',
    resolutionText: 'Resolved.',
    animationData: null,
  };

  switch (selectedIndustry) {
    case 'BFSI':
      pipelineProps = {
        title: 'Real-Time Fraud Detection',
        buttonText: 'Inject Synthetic ID Threat',
        resolutionText: 'Threat Isolated in 2ms. NeMo Guardrails Engaged.',
        animationData: null,
      };
      break;
    case 'Manufacturing':
      pipelineProps = {
        title: 'Predictive Maintenance',
        buttonText: 'Run Edge Digital Twin',
        resolutionText: 'Telemetry Processed in 4ms at the Edge.',
        animationData: null,
      };
      break;
    case 'Healthcare':
      pipelineProps = {
        title: 'Genomics & Privacy',
        buttonText: 'Process Genomic Sequence',
        resolutionText: 'Sequence Encrypted & Processed Locally.',
        animationData: null,
      };
      break;
    case 'Security':
      pipelineProps = {
        title: 'Zero-Trust Operations',
        buttonText: 'Trigger Zero-Trust Audit',
        resolutionText: 'Audit Trail Generated & Locked.',
        animationData: null,
      };
      break;
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-brand-background text-white overflow-x-hidden overflow-y-auto">
      {/* Top Navigation Bar - Sticky */}
      <header className="w-full h-20 md:h-24 border-b border-white/10 flex items-center justify-between px-8 shrink-0 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-30">
        <button 
          onClick={handleBack}
          className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors py-2 pr-4 z-10"
        >
          <ArrowLeft className="w-7 h-7 md:w-8 md:h-8" />
          <span className="text-lg md:text-xl font-medium tracking-wide">Back to Hub</span>
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase">
            Dell AI Factory: <span className="text-[#0076CE]">{selectedIndustry}</span> Environment
          </h1>
        </div>
      </header>

      {/* Main Layout - Smooth Vertical Flow */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-8 pb-24">

        {selectedIndustry === 'BFSI' ? (
          /* BFSI: Full-height metrics dashboard */
          <section className="w-full shrink-0">
            <BFSIMetricsSwitcher />
          </section>
        ) : selectedIndustry === 'Manufacturing' ? (
          /* Manufacturing: Full-height industrial metrics dashboard */
          <section className="w-full shrink-0">
            <ManufacturingDashboard />
          </section>
        ) : selectedIndustry === 'Healthcare' ? (
          /* Healthcare: Full-height clinical & RCM metrics dashboard */
          <section className="w-full shrink-0">
            <HealthcareDashboard />
          </section>
        ) : selectedIndustry === 'Security' ? (
          /* IT & Security Core: Full-height zero-trust & compute scaling dashboard */
          <section className="w-full shrink-0">
            <ITSecurityDashboard />
          </section>
        ) : (
          <>
            {/* Other Industries fallback */}
            <section className="w-full shrink-0">
              <ComparativeROI />
            </section>
          </>
        )}

      </main>
    </div>
  );
}
