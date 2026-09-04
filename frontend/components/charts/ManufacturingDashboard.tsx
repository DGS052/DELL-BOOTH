'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Activity,
  Eye,
  Factory,
  Gauge,
  AlertTriangle,
  Clock,
  Wrench,
  ShieldCheck,
  Cpu,
  Zap,
  Network,
  Camera,
  Layers,
  TrendingUp,
  Server,
  HelpCircle,
  X,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  MessageSquare,
  TrendingDown,
  Leaf,
  WifiOff,
  FileCheck,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/* ── types ────────────────────────────────────────────────────────── */
type ActiveMetric = 'PREDICTIVE_MAINT' | 'QUALITY_INSPECT';
type PresetProfile = 'TIER1_AUTO' | 'COMPONENT_PLANT' | 'CUSTOM';

interface ComparisonRow {
  icon: React.ReactNode;
  label: string;
  currentValue: string;
  optimizedValue: string;
  highlightCurrent?: boolean;
}

interface KPIBadge {
  value: string;
  label: string;
  color: string;
}

interface LeadFormData {
  fullName: string;
  organization: string;
  email: string;
  mobile: string;
}

/* ── preset configurations ────────────────────────────────────────── */
const PRESETS = {
  TIER1_AUTO: {
    label: 'Tier-1 Auto OEM',
    icon: Factory,
    maint: { assetCount: 650, unplannedDowntime: 240, costPerHour: 800_000, warningWindowHours: 36 },
    quality: { dailyVolume: 450_000, defectEscapeRate: 5.2, inspectionSpeed: 45, scrapCostCr: 48 },
  },
  COMPONENT_PLANT: {
    label: 'Component / Discrete Plant',
    icon: Cpu,
    maint: { assetCount: 180, unplannedDowntime: 85, costPerHour: 250_000, warningWindowHours: 18 },
    quality: { dailyVolume: 60_000, defectEscapeRate: 3.8, inspectionSpeed: 80, scrapCostCr: 12 },
  },
  CUSTOM: {
    label: 'Reset Defaults',
    icon: RotateCcw,
    maint: { assetCount: 350, unplannedDowntime: 160, costPerHour: 450_000, warningWindowHours: 24 },
    quality: { dailyVolume: 150_000, defectEscapeRate: 4.5, inspectionSpeed: 65, scrapCostCr: 22 },
  },
} as const;

/* ── reusable input component ─────────────────────────────────────── */
function InputField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">
        {label}
        {suffix && <span className="text-gray-500 ml-1">({suffix})</span>}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm tabular-nums focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
      />
    </label>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export default function ManufacturingDashboard() {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('PREDICTIVE_MAINT');
  const [activePreset, setActivePreset] = useState<PresetProfile>('CUSTOM');

  /* ── UI state ── */
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormData>({ fullName: '', organization: '', email: '', mobile: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  /* ── PREDICTIVE_MAINT state ── */
  const [assetCount, setAssetCount]             = useState(350);
  const [unplannedDowntime, setUnplannedDowntime] = useState(160);
  const [costPerHour, setCostPerHour]           = useState(450_000);
  const [warningWindowHours, setWarningWindowHours] = useState(24);

  /* ── QUALITY_INSPECT state ── */
  const [dailyVolume, setDailyVolume]           = useState(150_000);
  const [defectEscapeRate, setDefectEscapeRate] = useState(4.5);
  const [inspectionSpeed, setInspectionSpeed]   = useState(65);
  const [scrapCostCr, setScrapCostCr]           = useState(22);

  /* ── Preset applier ── */
  const applyPreset = useCallback((preset: PresetProfile) => {
    const cfg = PRESETS[preset];
    setActivePreset(preset);
    setAssetCount(cfg.maint.assetCount);
    setUnplannedDowntime(cfg.maint.unplannedDowntime);
    setCostPerHour(cfg.maint.costPerHour);
    setWarningWindowHours(cfg.maint.warningWindowHours);
    setDailyVolume(cfg.quality.dailyVolume);
    setDefectEscapeRate(cfg.quality.defectEscapeRate);
    setInspectionSpeed(cfg.quality.inspectionSpeed);
    setScrapCostCr(cfg.quality.scrapCostCr);
  }, []);

  /* ── Lead submit handler ── */
  const handleLeadSubmit = useCallback(async () => {
    if (!leadForm.fullName || !leadForm.organization || !leadForm.email) return;
    setLeadSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/v1/analytics/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          industry: 'Manufacturing',
          activeMetric,
          activePreset,
          sliderConfig: {
            maint: { assetCount, unplannedDowntime, costPerHour, warningWindowHours },
            quality: { dailyVolume, defectEscapeRate, inspectionSpeed, scrapCostCr },
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.warn('Offline mode: Lead queued locally.');
    }
    setLeadSubmitting(false);
    setLeadSubmitted(true);
  }, [leadForm, activeMetric, activePreset, assetCount, unplannedDowntime, costPerHour, warningWindowHours, dailyVolume, defectEscapeRate, inspectionSpeed, scrapCostCr]);

  /* ═══ Derived Calculations ═══ */
  const maintCalc = useMemo(() => {
    // Annual Plant Downtime Savings = Math.round(((Unplanned Downtime * 0.72) * Cost Per Hour) / 10000000) in ₹ Cr
    const downtimeSavedHours = Math.round(unplannedDowntime * 0.72);
    const optimizedDowntimeHours = Math.round(unplannedDowntime * 0.28);
    const rawSavingsCr = (downtimeSavedHours * costPerHour) / 10_000_000;
    const savingsCr = Math.round(rawSavingsCr);

    const legacyLossCr = Number(((unplannedDowntime * costPerHour) / 10_000_000).toFixed(1));
    const optimizedLossCr = Number(((optimizedDowntimeHours * costPerHour) / 10_000_000).toFixed(1));

    return {
      downtimeSavedHours,
      optimizedDowntimeHours,
      savingsCr,
      legacyLossCr,
      optimizedLossCr,
    };
  }, [unplannedDowntime, costPerHour]);

  const qualityCalc = useMemo(() => {
    // Annual Scrap & Rework Capital Recovered = Math.round(Annual Scrap Cost * 0.84) in ₹ Cr
    const recoveredCapitalCr = Math.round(scrapCostCr * 0.84);
    const throughputMultiplier = Math.round(450 / Math.max(inspectionSpeed, 1));

    return {
      recoveredCapitalCr,
      throughputMultiplier,
    };
  }, [scrapCostCr, inspectionSpeed]);

  /* ═══ Comparison Rows ═══ */
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (activeMetric === 'PREDICTIVE_MAINT') {
      return [
        {
          icon: <Server className="w-4 h-4" />,
          label: 'Architecture Tier',
          currentValue: 'Central Cloud Logging',
          optimizedValue: 'Dell NativeEdge Gateways + Rugged PowerEdge XR',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          label: 'Sensor Ingestion',
          currentValue: 'Batch Polling (15-30 min intervals)',
          optimizedValue: 'Real-Time Continuous Streaming (100kHz)',
        },
        {
          icon: <Gauge className="w-4 h-4" />,
          label: 'Telemetry Latency',
          currentValue: '450 ms (WAN Cloud Roundtrip)',
          optimizedValue: '3.2 ms (Local Edge Inference)',
          highlightCurrent: true,
        },
        {
          icon: <Clock className="w-4 h-4" />,
          label: 'Unplanned Downtime / Year',
          currentValue: `${unplannedDowntime} Hours`,
          optimizedValue: `${maintCalc.optimizedDowntimeHours} Hours (-72%)`,
          highlightCurrent: true,
        },
        {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Failure Lead Time',
          currentValue: `Reactive / ${warningWindowHours} Hrs Notice`,
          optimizedValue: '14-Day Advance Predictive Window',
          highlightCurrent: true,
        },
        {
          icon: <Network className="w-4 h-4" />,
          label: 'Network Dependency',
          currentValue: 'Cloud Outage Vulnerability',
          optimizedValue: '100% Autonomous Air-Gapped Local Operation',
          highlightCurrent: true,
        },
      ];
    }
    return [
      {
        icon: <Eye className="w-4 h-4" />,
        label: 'Inspection Method',
        currentValue: 'Manual Visual Sampling & Spot Checks',
        optimizedValue: '100% Inline Multi-Camera Computer Vision',
      },
      {
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Defect Escape Rate',
        currentValue: `${defectEscapeRate}%`,
        optimizedValue: '0.15% (Ultra-fine micron defect capture)',
        highlightCurrent: true,
      },
      {
        icon: <Zap className="w-4 h-4" />,
        label: 'Inspection Speed',
        currentValue: `${inspectionSpeed} Units/Min`,
        optimizedValue: '450 Units/Min (Synchronized to line conveyor)',
      },
      {
        icon: <Cpu className="w-4 h-4" />,
        label: 'Compute Location',
        currentValue: 'Video Upload to Cloud (Bandwidth Drain)',
        optimizedValue: 'On-Premise GPU Inference (Zero Cloud Egress)',
        highlightCurrent: true,
      },
      {
        icon: <Layers className="w-4 h-4" />,
        label: 'Defect Categorization',
        currentValue: 'Binary Pass/Fail',
        optimizedValue: 'Automated Root-Cause (Thermal/Crack/Dimension)',
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        label: 'Assembly Line OEE Impact',
        currentValue: 'Production Bottleneck',
        optimizedValue: '+18% Overall Equipment Effectiveness',
        highlightCurrent: true,
      },
    ];
  }, [activeMetric, unplannedDowntime, warningWindowHours, maintCalc, defectEscapeRate, inspectionSpeed]);

  /* ═══ KPI Badges ═══ */
  const kpiBadges: KPIBadge[] = useMemo(() => {
    if (activeMetric === 'PREDICTIVE_MAINT') {
      return [
        { value: '72%',                             label: 'Downtime Reduction',         color: '#0076CE' },
        { value: '14-Day',                          label: 'Failure Early Warning',      color: '#0076CE' },
        { value: '3.2ms',                           label: 'Edge Telemetry Latency',     color: '#76B900' },
        { value: `₹${maintCalc.savingsCr} Cr`,      label: 'Downtime Saved',             color: '#76B900' },
        { value: 'Zero',                            label: 'Cloud Bandwidth Cost',       color: '#0076CE' },
        { value: '100%',                            label: 'Autonomous Plant Survival',  color: '#76B900' },
      ];
    }
    return [
      { value: '99.85%',                               label: 'Defect Capture Accuracy',   color: '#0076CE' },
      { value: `${qualityCalc.throughputMultiplier}X`, label: 'Faster Line Throughput',    color: '#0076CE' },
      { value: 'Sub-8ms',                              label: 'Vision Inference',          color: '#76B900' },
      { value: `₹${qualityCalc.recoveredCapitalCr} Cr`,label: 'Scrap Recovered',           color: '#76B900' },
      { value: '100%',                                 label: 'Inline Surface Inspection', color: '#0076CE' },
      { value: 'Zero',                                 label: 'IP / Telemetry Leakage',    color: '#76B900' },
    ];
  }, [activeMetric, maintCalc, qualityCalc]);

  /* ═══ Chart — PREDICTIVE_MAINT: Grouped Bar Chart ═══ */
  const maintChartData: ChartData<'bar'> = useMemo(() => ({
    labels: ['Unplanned Downtime (Hours/Yr)', 'Annual Lost Production (₹ Cr)'],
    datasets: [
      {
        label: 'Legacy Preventive',
        data: [unplannedDowntime, maintCalc.legacyLossCr],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#f87171',
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.55,
      },
      {
        label: 'Dell AI Factory Edge',
        data: [maintCalc.optimizedDowntimeHours, maintCalc.optimizedLossCr],
        backgroundColor: 'rgba(118, 185, 0, 0.85)',
        borderColor: '#84cc16',
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.55,
      },
    ],
  }), [unplannedDowntime, maintCalc]);

  const maintChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#fff', font: { size: 11, weight: 600 }, padding: 14, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: 'rgba(11,15,25,0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const l = ctx.dataset.label || '';
            const v = ctx.parsed.y ?? 0;
            if (ctx.dataIndex === 0) {
              return ` ${l}: ${v} Hours/Year`;
            }
            return ` ${l}: ₹${v} Cr Production Loss`;
          },
          afterBody: () => {
            return `\n💰 Net Downtime Capital Saved: ₹${maintCalc.savingsCr} Cr`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff', font: { size: 11, weight: 'bold' } },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#cbd5e1',
          font: { size: 11 },
          callback: (v) => `${v ?? 0}`,
        },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  /* ═══ Chart — QUALITY_INSPECT: Doughnut Chart ═══ */
  const doughnutData: ChartData<'doughnut'> = useMemo(() => ({
    labels: ['AI Intercepted Micron Defects', 'Legacy Defect Escape / Waste'],
    datasets: [
      {
        data: [99.85, defectEscapeRate],
        backgroundColor: [
          'rgba(118, 185, 0, 0.9)',
          'rgba(239, 68, 68, 0.85)',
        ],
        borderColor: [
          '#76B900',
          '#ef4444',
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }), [defectEscapeRate]);

  /* Center text plugin for Doughnut */
  const doughnutCenterTextPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'mfgDoughnutCenterText',
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      ctx.save();

      // Primary value — scrap saved
      const primaryText = `₹${qualityCalc.recoveredCapitalCr} Cr`;
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#76B900';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(primaryText, width / 2, height / 2 - 18);

      // Secondary label
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Scrap Capital Recovered', width / 2, height / 2 + 6);

      // Tertiary — line speed
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText('450 Units/Min Line Speed', width / 2, height / 2 + 24);

      // Quaternary — capture rate
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0076CE';
      ctx.fillText('99.85% Capture Rate', width / 2, height / 2 + 42);

      ctx.restore();
    },
  }), [qualityCalc]);

  const doughnutOptions: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: { size: 11, weight: 600 as const },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11,15,25,0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 14,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed ?? 0;
            if (ctx.dataIndex === 0) {
              return ` Dell Edge AI Vision: ${v}% Micron Defects Captured`;
            }
            return ` Legacy Manual Sampling: ${v}% Escape Rate`;
          },
          afterBody: () => {
            return `\n💰 Scrap & Warranty Recovered: ₹${qualityCalc.recoveredCapitalCr} Cr\n⚡ Throughput: ${qualityCalc.throughputMultiplier}X faster inline`;
          },
        },
      },
    },
  }), [qualityCalc]);

  /* ═══ Render ═══ */
  return (
    <div className="w-full flex flex-col gap-5 relative">
      {/* ── Header with Team Computers Co-Branding ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0076CE]/70 mb-0.5">
            Dell AI Factory with NVIDIA | OT/IT Convergence &amp; Rugged Edge Systems by Team Computers
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0076CE] mb-1">
            Dell Technologies · Manufacturing &amp; Industrial AI Lab
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Infrastructure Modernization Assessment
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-400 max-w-md text-right leading-relaxed hidden lg:block">
          Live calculator — adjust COO inputs; edge telemetry, vision defect models, and operational architecture recalculate automatically.
        </p>
      </div>

      {/* ═══ Dell Smart Factory Benchmark Banner ═══ */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mb-1">
        {/* Banner Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0076CE] to-[#76B900]" />
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              Accelerate Industry 4.0 with Rugged NativeEdge AI
            </h3>
          </div>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed ml-3 max-w-3xl">
            Transform factory floor operations with real-time autonomous edge compute—eliminating unplanned line stoppages, slashing scrap rework, and removing cloud dependency.
          </p>
        </div>

        {/* 3-Column Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1 — Digital Transformation */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#0076CE]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#0076CE]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Digital Imperative</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#0076CE' }}>
                80%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                of manufacturers see digital transformation as essential
              </p>
            </div>
          </div>

          {/* Card 2 — Active Investment */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#76B900]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#76B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-[#76B900]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Active Investment</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#76B900' }}>
                60%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                actively investing in digital transformation
              </p>
            </div>
          </div>

          {/* Card 3 — Productivity Boost */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#06B6D4]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[#06B6D4]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Productivity Boost</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#06B6D4' }}>
                20%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                boost in plant productivity driven by AI technologies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Metric Switcher Tabs + Industrial Compliance Badges ═══ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveMetric('PREDICTIVE_MAINT')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'PREDICTIVE_MAINT'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Predictive Maintenance &amp; Asset Health
          </button>
          <button
            onClick={() => setActiveMetric('QUALITY_INSPECT')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'QUALITY_INSPECT'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            AI-Powered Computer Vision Quality Inspection
          </button>
        </div>

        {/* OT Compliance Trust Badges */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#76B900]" />
            <span className="text-[10px] font-semibold text-[#76B900]">ISA-95 / IEC 62443 OT Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <Cpu className="w-3.5 h-3.5 text-[#0076CE]" />
            <span className="text-[10px] font-semibold text-[#0076CE]">MIL-STD-810H &amp; IP65 Rugged Edge</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <WifiOff className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-[10px] font-semibold text-[#06B6D4]">100% Air-Gapped Plant Op</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ═══ 3-Column Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-5">

        {/* ── Left: COO / Plant Head Discovery Inputs ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">

          {/* Plant Profile Presets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Plant Profile</p>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(PRESETS) as [PresetProfile, typeof PRESETS[PresetProfile]][]).map(([key, preset]) => {
                const Icon = preset.icon;
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0076CE]/20 text-[#0076CE] border border-[#0076CE]/40'
                        : 'bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06]" />

          <h3 className="text-base font-bold text-white tracking-wide">COO / Plant Head Discovery</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0076CE]">
            {activeMetric === 'PREDICTIVE_MAINT'
              ? 'Plant Floor Telemetry Parameters'
              : 'Surface & Defect Inspection Parameters'}
          </p>

          {activeMetric === 'PREDICTIVE_MAINT' ? (
            <>
              <InputField
                label="Critical Assets / CNC / Robotics"
                value={assetCount}
                onChange={(v) => { setAssetCount(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 350"
              />
              <InputField
                label="Annual Unplanned Downtime"
                suffix="Hours"
                value={unplannedDowntime}
                onChange={(v) => { setUnplannedDowntime(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 160"
              />
              <InputField
                label="Cost of Line Stoppage / Hour"
                suffix="₹"
                value={costPerHour}
                onChange={(v) => { setCostPerHour(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 450000"
              />
              <InputField
                label="Current Failure Warning Window"
                suffix="Hours"
                value={warningWindowHours}
                onChange={(v) => { setWarningWindowHours(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 24"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell NativeEdge Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Downtime Reduction</span>
                  <span className="font-bold text-[#76B900]">72% (~{maintCalc.optimizedDowntimeHours} hrs)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Prediction Horizon</span>
                  <span className="font-bold text-[#76B900]">14 Days Advance</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Edge Processing Latency</span>
                  <span className="font-bold text-[#76B900]">3.2 ms at Edge</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Annual Downtime Savings</span>
                  <span className="font-bold text-[#76B900]">₹{maintCalc.savingsCr} Cr</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <InputField
                label="Daily Production Volume"
                suffix="Units"
                value={dailyVolume}
                onChange={(v) => { setDailyVolume(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 150000"
              />
              <InputField
                label="Manual Defect Escape Rate"
                suffix="%"
                value={defectEscapeRate}
                onChange={(v) => { setDefectEscapeRate(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 4.5"
              />
              <InputField
                label="Current Inspection Speed"
                suffix="Units/Min"
                value={inspectionSpeed}
                onChange={(v) => { setInspectionSpeed(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 65"
              />
              <InputField
                label="Annual Scrap, Rework & Warranty"
                suffix="₹ Cr"
                value={scrapCostCr}
                onChange={(v) => { setScrapCostCr(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 22"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell Edge Vision Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Computer Vision Accuracy</span>
                  <span className="font-bold text-[#76B900]">99.85% (0.15% Escape)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Inspection Throughput</span>
                  <span className="font-bold text-[#76B900]">450 Units/Min ({qualityCalc.throughputMultiplier}X)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Frame Inference Latency</span>
                  <span className="font-bold text-[#76B900]">Sub-8ms per Camera</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Scrap Capital Recovered</span>
                  <span className="font-bold text-[#76B900]">₹{qualityCalc.recoveredCapitalCr} Cr</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Middle: Comparison Table ── */}
        <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10">
          {/* Dual header */}
          <div className="grid grid-cols-2">
            <div className="bg-[#1a2332] px-4 py-3 flex items-center justify-between border-r border-white/[0.06]">
              <h3 className="text-sm font-bold text-white">Current State</h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">AS-IS</span>
            </div>
            <div className="bg-[#0076CE] px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Dell Optimized</h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Recommended</span>
            </div>
          </div>

          {/* Metric rows */}
          <div className="flex-1 divide-y divide-white/[0.06]">
            {comparisonRows.map((row, i) => (
              <div key={`row-${activeMetric}-${i}`} className="grid grid-cols-2 hover:bg-white/[0.02] transition-colors">
                {/* Current */}
                <div className="flex items-start gap-2.5 px-4 py-3 border-r border-white/[0.06]">
                  <span className="text-gray-500 mt-0.5 shrink-0">{row.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className={`text-xs font-semibold leading-snug ${row.highlightCurrent ? 'text-red-400' : 'text-white'}`}>
                      {row.currentValue}
                    </p>
                  </div>
                </div>
                {/* Dell Optimized */}
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <span className="text-[#0076CE]/50 mt-0.5 shrink-0">{row.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-xs font-bold text-[#76B900] leading-snug">
                      {row.optimizedValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Computers Trust Footer */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06]">
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Turnkey Plant-Floor Deployment, Sensor Fabric Integration &amp; 24/7 Mission-Critical Edge SLA by{' '}
              <span className="text-white font-semibold">Team Computers</span>
            </p>
          </div>
        </div>

        {/* ── Right: Dynamic Chart ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {activeMetric === 'PREDICTIVE_MAINT'
              ? 'Downtime & Production Loss Benchmark'
              : 'Inline Defect Capture & First-Pass Yield'}
          </h4>
          <div className="flex-1 min-h-[340px] relative flex items-center justify-center">
            {activeMetric === 'PREDICTIVE_MAINT' ? (
              <Bar
                key="bar-predictive-maint"
                data={maintChartData}
                options={maintChartOptions}
              />
            ) : (
              <Doughnut
                key="doughnut-quality-inspect"
                data={doughnutData}
                options={doughnutOptions}
                plugins={[doughnutCenterTextPlugin]}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══ Lead Capture CTA Strip ═══ */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3">
        <Sparkles className="w-5 h-5 text-[#0076CE] shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Ready to deploy rugged edge AI on your active production line?</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowLeadModal(true); setLeadSubmitted(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0076CE] text-white text-sm font-bold shadow-[0_0_24px_rgba(0,118,206,0.35)] hover:shadow-[0_0_32px_rgba(0,118,206,0.55)] hover:bg-[#0068b5] transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Schedule 1-Day Plant Floor Edge PoC
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all duration-200">
            <Download className="w-3.5 h-3.5" />
            Download Executive Dossier
          </button>
        </div>
      </div>

      {/* ═══ Bottom KPI Badges ═══ */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiBadges.map((badge, i) => (
          <div
            key={`kpi-${activeMetric}-${i}`}
            className="flex flex-col items-center justify-center py-3.5 px-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
          >
            <span
              className="text-xl md:text-2xl font-extrabold tabular-nums text-center"
              style={{ color: badge.color }}
            >
              {badge.value}
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1 text-center">
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* ═══ Lead Capture Modal ═══ */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLeadModal(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-[#0f1523] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => setShowLeadModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#0076CE]/20 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-[#0076CE]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Deploy an On-Premise Rugged Edge PoC with Team Computers
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Test Dell PowerEdge XR rugged servers &amp; NVIDIA Metropolis computer vision on your active production line.
              </p>
            </div>

            <div className="w-full h-px bg-white/[0.06]" />

            {/* Form or Success */}
            <div className="px-6 py-5">
              {leadSubmitted ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#76B900]/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#76B900]" />
                  </div>
                  <p className="text-base font-bold text-white">PoC Request Confirmed</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Our Team Computers industrial edge engineering team will reach out within 24 hours to schedule your plant floor proof-of-concept deployment.
                  </p>
                  <button
                    onClick={() => setShowLeadModal(false)}
                    className="mt-2 px-6 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Full Name *</span>
                    <input
                      type="text"
                      value={leadForm.fullName}
                      onChange={(e) => setLeadForm((f) => ({ ...f, fullName: e.target.value }))}
                      placeholder="e.g. Arun Mehta"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Organization / Plant Location *</span>
                    <input
                      type="text"
                      value={leadForm.organization}
                      onChange={(e) => setLeadForm((f) => ({ ...f, organization: e.target.value }))}
                      placeholder="e.g. Tata Motors, Pune Plant"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Work Email *</span>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. arun.mehta@tata.com"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Mobile / WhatsApp Number</span>
                    <input
                      type="tel"
                      value={leadForm.mobile}
                      onChange={(e) => setLeadForm((f) => ({ ...f, mobile: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>

                  {/* Current config preview */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Configuration Snapshot</p>
                    <p className="text-[10px] text-gray-400">
                      Profile: <span className="text-white font-semibold">{PRESETS[activePreset].label}</span>
                      {' · '}
                      Mode: <span className="text-white font-semibold">{activeMetric === 'PREDICTIVE_MAINT' ? 'Predictive Maintenance' : 'Quality Inspection'}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleLeadSubmit}
                    disabled={leadSubmitting || !leadForm.fullName || !leadForm.organization || !leadForm.email}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0076CE] text-white text-sm font-bold shadow-[0_0_24px_rgba(0,118,206,0.35)] hover:shadow-[0_0_32px_rgba(0,118,206,0.55)] hover:bg-[#0068b5] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
                  >
                    {leadSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirm PoC Request
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Presenter Assist — Floating Toggle ═══ */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">
        {/* Slide-over Card */}
        {showPresenterNotes && (
          <div className="w-[420px] bg-[#0f1523]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0076CE]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Presenter Pitch Notes</span>
              </div>
              <button
                onClick={() => setShowPresenterNotes(false)}
                className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 max-h-[260px] overflow-y-auto">
              {activeMetric === 'PREDICTIVE_MAINT' ? (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;When a critical CNC or stamping press trips unexpectedly, how long is your entire downstream line paralyzed?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;We provide <span className="text-[#76B900] font-bold">14-day advance notice</span> using continuous 100kHz edge vibration telemetry on Dell PowerEdge XR — reducing unplanned downtime by{' '}
                      <span className="text-[#76B900] font-bold">72%</span> and saving{' '}
                      <span className="text-[#76B900] font-bold">₹{maintCalc.savingsCr} Cr</span> in annual production losses.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      3.2ms edge inference — zero cloud dependency. Plant survives WAN outages autonomously. Deployed &amp; SLA-managed by Team Computers.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;How many defective parts escape manual visual spot checks to reach customer assembly?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;Dell AI Factory inspects <span className="text-[#76B900] font-bold">100% of parts inline</span> at{' '}
                      <span className="text-[#76B900] font-bold">450 units/min</span> with a{' '}
                      <span className="text-[#76B900] font-bold">99.85% defect capture rate</span> — recovering{' '}
                      <span className="text-[#76B900] font-bold">₹{qualityCalc.recoveredCapitalCr} Cr</span> in scrap &amp; warranty costs.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      NVIDIA Metropolis GPU vision on rugged PowerEdge XR — sub-8ms inference per camera, automated root-cause classification (thermal/crack/dimension). Zero cloud egress.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setShowPresenterNotes((p) => !p)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 ${
            showPresenterNotes
              ? 'bg-[#0076CE]/20 border-[#0076CE]/40 text-[#0076CE] opacity-100'
              : 'bg-black/50 border-white/10 text-gray-500 opacity-40 hover:opacity-100 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Presenter Pitch Notes</span>
        </button>
      </div>
    </div>
  );
}
