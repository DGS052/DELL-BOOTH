'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Clock, ShieldCheck, Lock, FileCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AuditComplianceChart() {
  const data: ChartData<'bar' | 'line'> = {
    labels: ['Legacy Tape & Cold Cloud', 'Dell Object Storage (WORM)'],
    datasets: [
      {
        type: 'line' as const,
        label: 'Regulatory Compliance Index (%)',
        data: [40, 100],
        borderColor: '#76B900',
        backgroundColor: '#76B900',
        borderWidth: 4,
        pointRadius: 9,
        pointHoverRadius: 12,
        pointBackgroundColor: '#76B900',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        yAxisID: 'y1',
        tension: 0.2,
        order: 1,
      },
      {
        type: 'bar' as const,
        label: 'Audit Retrieval SLA (Minutes)',
        data: [360, 10], // 6 hours = 360 mins vs 10 mins
        backgroundColor: ['#ef4444', '#0076CE'],
        borderColor: ['#f87171', '#38bdf8'],
        borderWidth: 1,
        borderRadius: 12,
        barPercentage: 0.45,
        yAxisID: 'y',
        order: 2,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 14, weight: 600 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11, 15, 25, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 14,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (context.dataset.yAxisID === 'y1') {
              return ` ${label}: ${context.parsed.y}% (${context.dataIndex === 1 ? 'Full Sovereign Compliance' : 'Audit Gaps'})`;
            }
            if (context.dataIndex === 0) {
              return ` ${label}: ${context.parsed.y} mins (6.0 Hours - SLA Risk)`;
            }
            return ` ${label}: ${context.parsed.y} mins (36X Faster Retrieval)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          font: { size: 14, weight: 'bold' },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Retrieval SLA (Minutes — Lower is Better)',
          color: '#ef4444',
          font: { size: 12, weight: 'bold' },
        },
        min: 0,
        max: 400,
        ticks: {
          color: '#cbd5e1',
          font: { size: 12 },
          stepSize: 80,
          callback: (value) => `${value}m`,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'RBI / IRDAI Compliance (%)',
          color: '#76B900',
          font: { size: 12, weight: 'bold' },
        },
        min: 0,
        max: 120,
        ticks: {
          color: '#76B900',
          font: { size: 12, weight: 600 },
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative backdrop-blur-md">
      {/* Header & Bold Executive Summary */}
      <div className="mb-4 space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Insurance & Regulatory Case Study
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0076CE]/20 text-[#38bdf8] border border-[#0076CE]/40">
            <Lock className="w-3.5 h-3.5" />
            WORM Policy Immutability
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
          Life Insurance Case Study: Audit Retrieval SLA Slashed from 6 Hours to 10 Minutes with 100% Compliance.
        </h3>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
          Modernizing legacy archive storage with Dell On-Premise Object Storage (ECS/PowerScale) and Write-Once-Read-Many (WORM) policies drops regulatory audit search times by 97.2% while assuring zero data sovereignty exposure under RBI & IRDAI mandates.
        </p>

        {/* Metric Highlight Badges */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Audit Search SLA</p>
              <p className="text-base md:text-lg font-bold text-white">
                6h <span className="text-[#76B900]">➔ 10 mins</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5">
            <div className="p-2 rounded-lg bg-[#0076CE]/20 text-[#38bdf8] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Archival Lock</p>
              <p className="text-base md:text-lg font-bold text-[#0076CE]">WORM Certified</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5">
            <div className="p-2 rounded-lg bg-[#76B900]/20 text-[#76B900] shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Data Sovereignty</p>
              <p className="text-base md:text-lg font-bold text-[#76B900]">100% Domestic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-[360px] md:h-[420px] relative mt-2">
        <Chart type="bar" data={data} options={options} />
      </div>
    </div>
  );
}
