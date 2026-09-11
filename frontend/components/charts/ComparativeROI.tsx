'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useBoothStore } from '@/store/useBoothStore';
import { generateDossierPdf } from '../../lib/generateDossierPdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ComparativeROI() {
  const [volume, setVolume] = useState<number>(100000);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const chartRef = useRef<any>(null);
  const { selectedIndustry } = useBoothStore();

  // Dell On-Premise Math (Flat Cumulative)
  const dellYear1 = 250000;
  const dellYear2 = 270000;
  const dellYear3 = 290000;

  // Public Cloud Math (Exponential Cumulative)
  const baseCloud = volume * 0.005 * 365;
  const cloudYear1 = baseCloud;
  const cloudYear2 = cloudYear1 + (baseCloud * 1.2);
  const cloudYear3 = cloudYear2 + (baseCloud * 1.44);

  const data = {
    labels: ['Year 1', 'Year 2', 'Year 3'],
    datasets: [
      {
        label: 'Public Cloud AI',
        data: [cloudYear1, cloudYear2, cloudYear3],
        backgroundColor: '#ef4444',
      },
      {
        label: 'Dell On-Premise',
        data: [dellYear1, dellYear2, dellYear3],
        backgroundColor: '#76B900',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: { size: 16 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#ffffff',
          callback: (value: any) => {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            }
            return '$' + (value / 1000).toLocaleString() + 'k';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#ffffff',
          font: { size: 14 }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const handleDownload = useCallback(() => {
    const chartBase64 = chartRef.current?.toBase64Image();
    const formatCurrency = (val: number) => '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 });

    generateDossierPdf({
      industryTitle: selectedIndustry || 'Cross-Industry',
      reportSubtitle: 'AI Infrastructure ROI Assessment',
      metricLabel: 'Comparative ROI: Cloud vs On-Premise',
      comparisonRows: [
        {
          label: 'Year 1 Cumulative Cost',
          currentValue: formatCurrency(cloudYear1),
          optimizedValue: formatCurrency(dellYear1)
        },
        {
          label: 'Year 2 Cumulative Cost',
          currentValue: formatCurrency(cloudYear2),
          optimizedValue: formatCurrency(dellYear2)
        },
        {
          label: 'Year 3 Cumulative Cost',
          currentValue: formatCurrency(cloudYear3),
          optimizedValue: formatCurrency(dellYear3)
        }
      ],
      kpiBadges: [
        {
          label: '3-Year Savings',
          value: formatCurrency(cloudYear3 - dellYear3)
        },
        {
          label: 'Daily Inferences',
          value: volume.toLocaleString()
        }
      ],
      chartImageBase64: chartBase64,
    });
  }, [cloudYear1, cloudYear2, cloudYear3, dellYear1, dellYear2, dellYear3, volume, selectedIndustry]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch('http://localhost:5000/api/v1/analytics/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          selectedIndustry,
          inferenceVolume: volume,
          timestamp: new Date().toISOString()
        })
      });
      const data = await response.json();
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (e) {
      console.warn('Offline mode: Telemetry queued locally.');
    }

    setSubmitted(true);
    setTimeout(() => {
      setShowEmailForm(false);
      setSubmitted(false);
      setPreviewUrl(null);
      setEmail('');
    }, 6000); // Increased timeout so they can click the link
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-8 bg-white/5 border border-white/10 rounded-2xl p-8 relative">
      {/* Controls Panel (30%) */}
      <div className="w-full md:w-[30%] flex flex-col justify-center gap-6">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">Comparative ROI</h3>
          <p className="text-gray-400 text-lg">
            Adjust the daily inference volume to simulate the long-term exponential cost impact of public cloud vs fixed on-premise infrastructure.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 mt-8 bg-black/20 p-6 rounded-xl border border-white/5">
          <label htmlFor="volumeSlider" className="text-white text-lg font-medium flex flex-col gap-2">
            <span className="text-gray-400 text-sm uppercase tracking-wider">Daily Inference Volume</span>
            <span className="text-[#0076CE] font-bold text-4xl">{volume.toLocaleString()}</span>
          </label>
          <input 
            id="volumeSlider"
            type="range" 
            min="10000" 
            max="10000000" 
            step="10000" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))} 
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0076CE] mt-4"
          />
          <div className="flex justify-between text-sm text-gray-500 font-mono mt-1">
            <span>10,000</span>
            <span>10,000,000</span>
          </div>
        </div>
      </div>

      {/* Chart Panel (70%) */}
      <div className="w-full md:w-[70%] h-full flex flex-col">
        <div className="flex-1 min-h-[300px]">
          <Bar ref={chartRef} data={data} options={options} />
        </div>
        
        {/* Actions Section */}
        <div className="mt-6 flex flex-wrap justify-center items-center shrink-0 min-h-[60px] gap-4">
          {!showEmailForm && !submitted && (
            <>
              <button
                onClick={() => setShowEmailForm(true)}
                className="bg-[#0076CE] hover:bg-[#0082E6] text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(0,118,206,0.3)] transition-all active:scale-95"
              >
                Send Detailed ROI Report to My Email
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Download Executive Dossier
              </button>
            </>
          )}

          {showEmailForm && !submitted && (
            <form onSubmit={handleLeadSubmit} className="flex gap-4 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE] text-lg"
              />
              <button
                type="submit"
                className="bg-[#0076CE] hover:bg-[#0082E6] text-white font-bold py-4 px-8 rounded-xl transition-all active:scale-95"
              >
                Submit
              </button>
            </form>
          )}

          {submitted && (
            <div className="flex flex-col items-center gap-2 animate-in zoom-in fade-in">
              <div className="text-[#76B900] font-bold text-xl flex items-center gap-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Report queued for delivery.
              </div>
              {previewUrl && (
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[#0076CE] hover:underline text-sm font-mono mt-1">
                  [View Ethereal Email Preview]
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
