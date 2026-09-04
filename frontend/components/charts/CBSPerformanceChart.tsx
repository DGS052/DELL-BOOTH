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
import { TrendingDown, Zap, ShieldCheck } from 'lucide-react';

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

export default function CBSPerformanceChart() {
  const data: ChartData<'bar' | 'line'> = {
    labels: ['Legacy Public Cloud', 'Dell On-Premise'],
    datasets: [
      {
        type: 'line' as const,
        label: 'Core Banking Speed (Multiplier)',
        data: [1, 3],
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
        label: 'Annual OPEX (Relative)',
        data: [100, 60],
        backgroundColor: ['#ef4444', '#0076CE'],
        borderColor: ['#f87171', '#38bdf8'],
        borderWidth: 1,
        borderRadius: 12,
        barPercentage: 0.5,
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
          padding: 20,
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
              return ` ${label}: ${context.parsed.y}X`;
            }
            if (context.dataIndex === 1) {
              return ` ${label}: ${context.parsed.y}% (-40% Reduction)`;
            }
            return ` ${label}: ${context.parsed.y}% (Baseline)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          font: { size: 15, weight: 'bold' },
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
          text: 'Annual OPEX (Relative %)',
          color: '#0076CE',
          font: { size: 13, weight: 'bold' },
        },
        min: 0,
        max: 120,
        ticks: {
          color: '#cbd5e1',
          font: { size: 12 },
          stepSize: 20,
          callback: (value) => `${value}%`,
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
          text: 'Core Banking Speed (Multiplier)',
          color: '#76B900',
          font: { size: 13, weight: 'bold' },
        },
        min: 0,
        max: 4,
        ticks: {
          color: '#76B900',
          font: { size: 12, weight: 600 },
          stepSize: 1,
          callback: (value) => `${value}X`,
        },
        grid: {
          drawOnChartArea: false, // Don't clutter grid lines over left axis
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative backdrop-blur-md">
      {/* Header & Bold Executive Summary */}
      <div className="mb-4 md:mb-6 space-y-2.5 md:space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0076CE]/20 text-[#38bdf8] border border-[#0076CE]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            BFSI Architecture Benchmark
          </span>
        </div>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
          Private Bank Case Study: 40% OPEX Reduction alongside 3X Faster Core Banking.
        </h3>
        <p className="text-gray-400 text-xs md:text-sm">
          Comparative analysis benchmarking high-throughput CBS transactional workloads on legacy hyperscaler public cloud vs. turnkey Dell AI Factory on-premise infrastructure integrated by Team Computers.
        </p>

        {/* Metric Highlight Badges */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-1">
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
            <div className="p-2 md:p-2.5 rounded-lg bg-[#0076CE]/20 text-[#38bdf8]">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider">Annual OPEX</p>
              <p className="text-lg md:text-xl font-bold text-[#0076CE]">40% Savings</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
            <div className="p-2 md:p-2.5 rounded-lg bg-[#76B900]/20 text-[#76B900]">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider">Transaction Speed</p>
              <p className="text-lg md:text-xl font-bold text-[#76B900]">3X Multiplier</p>
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
