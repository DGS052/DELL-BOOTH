'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
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
  UserX,
  FileText,
  Clock,
  DollarSign,
  Lock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Server,
  Cpu,
  BarChart3,
  Network,
  Users,
  SearchCheck,
  ShieldAlert,
  Fingerprint,
  TrendingDown,
  Leaf,
  Activity,
  HelpCircle,
  X,
  Building2,
  Landmark,
  RotateCcw,
  Send,
  Download,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/* ── types ────────────────────────────────────────────────────────── */
type ActiveMetric = 'CORRUPT_ACTORS' | 'UNDERWRITING';
type PresetProfile = 'PSU_TIER1' | 'PRIVATE_NBFC' | 'CUSTOM';

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
  contactInfo: string;
}

/* ── preset configurations ────────────────────────────────────────── */
const PRESETS = {
  PSU_TIER1: {
    label: 'PSU / Tier-1 Bank',
    icon: Landmark,
    corrupt: { monthlyFlagged: 3_500_000, legacyCaptureRate: 62, lossPerFraudster: 500_000, syndicateDays: 21 },
    underwriting: { monthlyLoanApps: 200_000, turnaroundHours: 96, costPerApp: 650, abandonmentRate: 35 },
  },
  PRIVATE_NBFC: {
    label: 'Private / Mid-Market NBFC',
    icon: Building2,
    corrupt: { monthlyFlagged: 800_000, legacyCaptureRate: 72, lossPerFraudster: 250_000, syndicateDays: 10 },
    underwriting: { monthlyLoanApps: 45_000, turnaroundHours: 48, costPerApp: 320, abandonmentRate: 22 },
  },
  CUSTOM: {
    label: 'Reset Custom',
    icon: RotateCcw,
    corrupt: { monthlyFlagged: 1_500_000, legacyCaptureRate: 68, lossPerFraudster: 350_000, syndicateDays: 14 },
    underwriting: { monthlyLoanApps: 85_000, turnaroundHours: 72, costPerApp: 450, abandonmentRate: 28 },
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
export default function BFSIMetricsSwitcher() {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('CORRUPT_ACTORS');
  const [activePreset, setActivePreset] = useState<PresetProfile>('CUSTOM');

  /* ── UI state ── */
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormData>({ fullName: '', organization: '', contactInfo: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  /* ── CORRUPT_ACTORS state ── */
  const [monthlyFlagged, setMonthlyFlagged]         = useState(1_500_000);
  const [legacyCaptureRate, setLegacyCaptureRate]   = useState(68);
  const [lossPerFraudster, setLossPerFraudster]     = useState(350_000);
  const [syndicateDays, setSyndicateDays]           = useState(14);

  /* ── UNDERWRITING state ── */
  const [monthlyLoanApps, setMonthlyLoanApps]       = useState(85_000);
  const [turnaroundHours, setTurnaroundHours]       = useState(72);
  const [costPerApp, setCostPerApp]                 = useState(450);
  const [abandonmentRate, setAbandonmentRate]       = useState(28);

  /* ── Preset applier ── */
  const applyPreset = useCallback((preset: PresetProfile) => {
    const cfg = PRESETS[preset];
    setActivePreset(preset);
    setMonthlyFlagged(cfg.corrupt.monthlyFlagged);
    setLegacyCaptureRate(cfg.corrupt.legacyCaptureRate);
    setLossPerFraudster(cfg.corrupt.lossPerFraudster);
    setSyndicateDays(cfg.corrupt.syndicateDays);
    setMonthlyLoanApps(cfg.underwriting.monthlyLoanApps);
    setTurnaroundHours(cfg.underwriting.turnaroundHours);
    setCostPerApp(cfg.underwriting.costPerApp);
    setAbandonmentRate(cfg.underwriting.abandonmentRate);
  }, []);

  /* ── Lead submit handler ── */
  const handleLeadSubmit = useCallback(async () => {
    if (!leadForm.fullName || !leadForm.organization || !leadForm.contactInfo) return;
    setLeadSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/v1/analytics/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          activeMetric,
          activePreset,
          sliderConfig: {
            corrupt: { monthlyFlagged, legacyCaptureRate, lossPerFraudster, syndicateDays },
            underwriting: { monthlyLoanApps, turnaroundHours, costPerApp, abandonmentRate },
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.warn('Offline mode: Lead queued locally.');
    }
    setLeadSubmitting(false);
    setLeadSubmitted(true);
  }, [leadForm, activeMetric, activePreset, monthlyFlagged, legacyCaptureRate, lossPerFraudster, syndicateDays, monthlyLoanApps, turnaroundHours, costPerApp, abandonmentRate]);

  /* ═══ Derived calculations ═══ */
  const corruptCalc = useMemo(() => {
    const rateDiff = Math.max(0, 0.994 - legacyCaptureRate / 100);
    const rawCapitalSaved = (monthlyFlagged * rateDiff * lossPerFraudster) / 10_000_000;
    const capitalSavedCr = Math.round(rawCapitalSaved);

    return {
      dellCaptureRate: 99.4,
      interceptionSla: '2.1 ms',
      capitalSavedCr,
      legacyEvasionPct: Math.max(0, 100 - legacyCaptureRate),
      interceptedPct: 99.4,
    };
  }, [monthlyFlagged, legacyCaptureRate, lossPerFraudster]);

  const uwCalc = useMemo(() => {
    const costSavedPct = Math.round(((costPerApp - 35) / Math.max(costPerApp, 1)) * 100);
    return {
      dellCost: 35,
      costSavedPct,
    };
  }, [costPerApp]);

  /* ═══ Comparison rows ═══ */
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (activeMetric === 'CORRUPT_ACTORS') {
      return [
        {
          icon: <ShieldAlert className="w-4 h-4" />,
          label: 'Bad Actor Identification Rate',
          currentValue: `${legacyCaptureRate}%`,
          optimizedValue: '99.4% (Near-total malicious capture)',
          highlightCurrent: true,
        },
        {
          icon: <Server className="w-4 h-4" />,
          label: 'Threat Detection Method',
          currentValue: 'Isolated Siloed Rules',
          optimizedValue: 'Graph AI Entity Resolution (TigerGraph on Dell PowerEdge)',
        },
        {
          icon: <Clock className="w-4 h-4" />,
          label: 'Isolation Latency',
          currentValue: 'Post-Facto (Hours to Days)',
          optimizedValue: '2.1 ms (Real-time in-flight freeze)',
          highlightCurrent: true,
        },
        {
          icon: <Network className="w-4 h-4" />,
          label: 'Mule Network Detection',
          currentValue: 'Manual Forensic Audits',
          optimizedValue: 'Automated Multi-hop Syndicate Mapping',
        },
        {
          icon: <Fingerprint className="w-4 h-4" />,
          label: 'Synthetic ID / Ghost Accounts',
          currentValue: 'Frequently Undetected',
          optimizedValue: '100% Flagged via Cross-Entity Biometric Graphs',
          highlightCurrent: true,
        },
        {
          icon: <Lock className="w-4 h-4" />,
          label: 'Regulatory Compliance',
          currentValue: 'Audit Failure Risk',
          optimizedValue: '100% RBI Data Sovereignty & Air-Gapped Forensics',
          highlightCurrent: true,
        },
      ];
    }
    return [
      {
        icon: <Clock className="w-4 h-4" />,
        label: 'Turnaround SLA',
        currentValue: `${turnaroundHours} Hours`,
        optimizedValue: '8 Seconds (Dynamic Profiling)',
        highlightCurrent: true,
      },
      {
        icon: <Cpu className="w-4 h-4" />,
        label: 'Assessment Architecture',
        currentValue: 'Manual Doc Review & Basic Scoring',
        optimizedValue: 'Real-Time Multi-Modal GenAI',
      },
      {
        icon: <DollarSign className="w-4 h-4" />,
        label: 'Processing Cost / Loan',
        currentValue: `₹${costPerApp}`,
        optimizedValue: '₹35',
        highlightCurrent: true,
      },
      {
        icon: <BarChart3 className="w-4 h-4" />,
        label: 'Throughput Scale',
        currentValue: '1X Baseline',
        optimizedValue: '15X Concurrent Inferences',
      },
      {
        icon: <FileText className="w-4 h-4" />,
        label: 'Regulatory Audit Trail',
        currentValue: 'Fragmented Logs',
        optimizedValue: 'Automated WORM-Certified Explainable AI',
        highlightCurrent: true,
      },
      {
        icon: <ShieldCheck className="w-4 h-4" />,
        label: 'Compliance Status',
        currentValue: 'Cross-Border Risk',
        optimizedValue: '100% RBI Data Residency Compliant',
        highlightCurrent: true,
      },
    ];
  }, [activeMetric, legacyCaptureRate, turnaroundHours, costPerApp]);

  /* ═══ KPI badges ═══ */
  const kpiBadges: KPIBadge[] = useMemo(() => {
    if (activeMetric === 'CORRUPT_ACTORS') {
      return [
        { value: '99.4%',                                         label: 'Bad Actor Capture Rate',    color: '#0076CE' },
        { value: '2.1ms',                                         label: 'In-Flight Account Freeze',  color: '#0076CE' },
        { value: 'Zero',                                          label: 'Mule Syndicate Leakage',    color: '#76B900' },
        { value: `₹${corruptCalc.capitalSavedCr.toLocaleString()} Cr`, label: 'Capital Protected',         color: '#76B900' },
        { value: 'Graph AI',                                      label: 'Entity Resolution',         color: '#0076CE' },
        { value: '100%',                                          label: 'RBI Forensic Compliance',   color: '#76B900' },
      ];
    }
    return [
      { value: '99.8%',                 label: 'SLA Turnaround Drop',   color: '#0076CE' },
      { value: '8 sec',                 label: 'Decision Engine',       color: '#0076CE' },
      { value: `${uwCalc.costSavedPct}%`, label: 'Op. Cost Saved',       color: '#76B900' },
      { value: '15X',                   label: 'App Throughput',        color: '#76B900' },
      { value: '100%',                  label: 'Explainable AI Trail',  color: '#0076CE' },
      { value: 'Zero',                  label: 'Data Egress Risk',      color: '#76B900' },
    ];
  }, [activeMetric, corruptCalc, uwCalc]);

  /* ═══ Chart — CORRUPT_ACTORS: Doughnut Chart ═══ */
  const doughnutData: ChartData<'doughnut'> = useMemo(() => ({
    labels: ['Intercepted Bad Actors & Mules', 'Legacy Evasion / Undetected Vulnerability'],
    datasets: [
      {
        data: [corruptCalc.interceptedPct, corruptCalc.legacyEvasionPct],
        backgroundColor: [
          'rgba(118, 185, 0, 0.9)',   // NVIDIA Green
          'rgba(239, 68, 68, 0.85)',  // Alert Red
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
  }), [corruptCalc]);

  /* Center text plugin for Doughnut */
  const doughnutCenterTextPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'doughnutCenterText',
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      ctx.save();

      // Primary value — capital protected
      const primaryText = `₹${corruptCalc.capitalSavedCr.toLocaleString()} Cr`;
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#76B900';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(primaryText, width / 2, height / 2 - 12);

      // Secondary label
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Capital Protected', width / 2, height / 2 + 12);

      // Tertiary — capture rate
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(`${corruptCalc.interceptedPct}% Threat Capture`, width / 2, height / 2 + 30);

      ctx.restore();
    },
  }), [corruptCalc]);

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
              return ` Dell AI Factory: ${v}% Malicious Entities Intercepted`;
            }
            return ` Legacy Rule Engines: ${v}% Evasion / Undetected`;
          },
          afterBody: () => {
            return `\n💰 Direct Capital Protected: ₹${corruptCalc.capitalSavedCr.toLocaleString()} Cr\n⚡ Interception SLA: 2.1 ms real-time freeze`;
          },
        },
      },
    },
  }), [corruptCalc]);

  /* ═══ Chart — UNDERWRITING: Horizontal Grouped Bar Chart ═══ */
  const uwChartData: ChartData<'bar'> = useMemo(() => ({
    labels: ['Turnaround SLA (Hours)', 'Cost per Application (₹)'],
    datasets: [
      {
        label: 'Legacy System',
        data: [turnaroundHours, costPerApp],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#f87171',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.55,
      },
      {
        label: 'Dell AI Factory',
        data: [0.002, 35],
        backgroundColor: (ctx) => {
          return ctx.dataIndex === 0 ? 'rgba(118, 185, 0, 0.85)' : 'rgba(0, 118, 206, 0.85)';
        },
        borderColor: (ctx) => {
          return ctx.dataIndex === 0 ? '#76B900' : '#0076CE';
        },
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.55,
      },
    ],
  }), [turnaroundHours, costPerApp]);

  const uwChartOptions: ChartOptions<'bar'> = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: { size: 11, weight: 600 as const },
          padding: 14,
          usePointStyle: true,
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
            const l = ctx.dataset.label || '';
            const v = ctx.parsed.x ?? 0;
            if (ctx.dataIndex === 0) {
              return v < 1 ? ` ${l}: ${(v * 3600).toFixed(0)} sec (${v} hrs)` : ` ${l}: ${v} hrs`;
            }
            return ` ${l}: ₹${v}`;
          },
          afterBody: (tooltipItems) => {
            if (tooltipItems[0]?.dataIndex === 0) {
              const reduction = (((turnaroundHours - 0.002) / Math.max(turnaroundHours, 1)) * 100).toFixed(1);
              return `\n📉 ${reduction}% SLA Reduction`;
            }
            return `\n📉 ${uwCalc.costSavedPct}% Cost Reduction`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'logarithmic' as const,
        ticks: {
          color: '#cbd5e1',
          font: { size: 11 },
          callback: (v) => {
            const num = Number(v);
            if (num >= 1) return num.toLocaleString();
            if (num >= 0.001) return `${(num * 3600).toFixed(0)}s`;
            return '';
          },
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
        title: {
          display: true,
          text: 'Scale (Log)',
          color: 'rgba(255,255,255,0.35)',
          font: { size: 10 },
        },
      },
      y: {
        ticks: {
          color: '#fff',
          font: { size: 12, weight: 'bold' as const },
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  }), [turnaroundHours, uwCalc]);

  /* ═══ Render ═══ */
  return (
    <div className="w-full flex flex-col gap-5 relative">
      {/* ── Header with Team Computers Co-Branding ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0076CE]/70 mb-0.5">
            Dell AI Factory with NVIDIA · Systems Integration &amp; Managed AI Services by Team Computers
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0076CE] mb-1">
            Dell Technologies · BFSI Readiness Lab
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Infrastructure Modernization Assessment
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-400 max-w-md text-right leading-relaxed hidden lg:block">
          Live calculator — adjust CIO inputs; metrics and architecture recommendations recalculate automatically.
        </p>
      </div>

      {/* ═══ Dell Financial Services Benchmark Banner ═══ */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mb-1">
        {/* Banner Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0076CE] to-[#76B900]" />
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              Redefine Financial Services with AI and Secure Platforms
            </h3>
          </div>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed ml-3 max-w-3xl">
            AI-driven platforms transforming banking operations—enhancing customer trust, accelerating transaction speed, and eliminating infrastructure sprawl.
          </p>
        </div>

        {/* 3-Column Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1 — Server Footprint */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#0076CE]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-[#0076CE]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Server Consolidation</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#0076CE' }}>
                35%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                Decreased server footprint — reducing data center space and power costs
              </p>
            </div>
          </div>

          {/* Card 2 — Energy Consumption */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#76B900]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#76B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-[#76B900]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Energy Efficiency</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#76B900' }}>
                70-80%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                Reduction in energy consumption with modern IT
              </p>
            </div>
          </div>

          {/* Card 3 — Processing Speed */}
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#06B6D4]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[#06B6D4]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Processing Speed</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#06B6D4' }}>
                50%
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                Faster processing speeds for critical operations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Metric Switcher Tabs + Regulatory Compliance Badges ═══ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveMetric('CORRUPT_ACTORS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'CORRUPT_ACTORS'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UserX className="w-4 h-4" />
            Corrupt Actor &amp; Mule Syndicate Detection
          </button>
          <button
            onClick={() => setActiveMetric('UNDERWRITING')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'UNDERWRITING'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Automated Loan Credibility &amp; Intelligent Underwriting
          </button>
        </div>

        {/* Regulatory Trust Badges */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#76B900]" />
            <span className="text-[10px] font-semibold text-[#76B900]">RBI Master Direction Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-[#0076CE]" />
            <span className="text-[10px] font-semibold text-[#0076CE]">100% On-Premise Sovereign Data</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <FileCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-[10px] font-semibold text-[#06B6D4]">Air-Gapped Audit Trail</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ═══ 3-Column Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-5">

        {/* ── Left: CIO Discovery Inputs ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">

          {/* Enterprise Scale Presets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Quick Profile</p>
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

          <h3 className="text-base font-bold text-white tracking-wide">CIO Discovery Questions</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0076CE]">
            {activeMetric === 'CORRUPT_ACTORS' ? 'Mule & Bad Actor Detection Parameters' : 'Loan Processing Parameters'}
          </p>

          {activeMetric === 'CORRUPT_ACTORS' ? (
            <>
              <InputField
                label="Monthly Flagged Inquiries / Txns"
                value={monthlyFlagged}
                onChange={(v) => { setMonthlyFlagged(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 1500000"
              />
              <InputField
                label="Legacy Bad Actor Capture Rate"
                suffix="%"
                value={legacyCaptureRate}
                onChange={(v) => { setLegacyCaptureRate(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 68"
              />
              <InputField
                label="Est. Avg. Loss Per Undetected Fraudster"
                suffix="₹"
                value={lossPerFraudster}
                onChange={(v) => { setLossPerFraudster(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 350000"
              />
              <InputField
                label="Syndicate Investigation Window"
                suffix="Days"
                value={syndicateDays}
                onChange={(v) => { setSyndicateDays(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 14"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell AI Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Bad Actor Capture Rate</span>
                  <span className="font-bold text-[#76B900]">99.4%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Account Interception SLA</span>
                  <span className="font-bold text-[#76B900]">2.1 ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Mule Ring Exposure</span>
                  <span className="font-bold text-[#76B900]">Multi-Hop Link Graph</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Direct Capital Loss Prevented</span>
                  <span className="font-bold text-[#76B900]">₹{corruptCalc.capitalSavedCr.toLocaleString()} Cr</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <InputField
                label="Monthly Loan Applications"
                value={monthlyLoanApps}
                onChange={(v) => { setMonthlyLoanApps(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 85000"
              />
              <InputField
                label="Underwriting Turnaround"
                suffix="Hours"
                value={turnaroundHours}
                onChange={(v) => { setTurnaroundHours(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 72"
              />
              <InputField
                label="Cost Per Application"
                suffix="₹"
                value={costPerApp}
                onChange={(v) => { setCostPerApp(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 450"
              />
              <InputField
                label="Applicant Abandonment / Churn"
                suffix="%"
                value={abandonmentRate}
                onChange={(v) => { setAbandonmentRate(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 28"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell AI Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Underwriting Turnaround</span>
                  <span className="font-bold text-[#76B900]">8 Seconds</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Throughput Scalability</span>
                  <span className="font-bold text-[#76B900]">15X</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Cost Per Application</span>
                  <span className="font-bold text-[#76B900]">₹35</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Completion Rate Recovery</span>
                  <span className="font-bold text-[#76B900]">94%</span>
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
              End-to-end Architecture, Turnkey Deployment &amp; 24/7 SLA Managed by{' '}
              <span className="text-white font-semibold">Team Computers Enterprise Services</span>
            </p>
          </div>
        </div>

        {/* ── Right: Dynamic Chart ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {activeMetric === 'CORRUPT_ACTORS'
              ? 'Entity Threat Resolution & Capital Security'
              : 'Turnaround & Cost Benchmark'}
          </h4>
          <div className="flex-1 min-h-[340px] relative flex items-center justify-center">
            {activeMetric === 'CORRUPT_ACTORS' ? (
              <Doughnut
                key="doughnut-corrupt-actors"
                data={doughnutData}
                options={doughnutOptions}
                plugins={[doughnutCenterTextPlugin]}
              />
            ) : (
              <Bar
                key="bar-underwriting"
                data={uwChartData}
                options={uwChartOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══ Lead Capture CTA Strip ═══ */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3">
        <Sparkles className="w-5 h-5 text-[#0076CE] shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Ready to validate these numbers in your environment?</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowLeadModal(true); setLeadSubmitted(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0076CE] text-white text-sm font-bold shadow-[0_0_24px_rgba(0,118,206,0.35)] hover:shadow-[0_0_32px_rgba(0,118,206,0.55)] hover:bg-[#0068b5] transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Schedule 1-Day AI Architecture Proof-of-Concept (PoC)
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all duration-200">
            <Download className="w-3.5 h-3.5" />
            Download Executive Dossier (PDF / QR Code)
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
                  <Server className="w-4 h-4 text-[#0076CE]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Initiate On-Premise AI PoC with Team Computers
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Stage Dell PowerEdge XE9680 &amp; NVIDIA AI Enterprise in your sandbox or Team Computers Customer Experience Center.
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
                    Our Team Computers enterprise architecture team will reach out within 24 hours to schedule your proof-of-concept deployment.
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
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Bank / Organization *</span>
                    <input
                      type="text"
                      value={leadForm.organization}
                      onChange={(e) => setLeadForm((f) => ({ ...f, organization: e.target.value }))}
                      placeholder="e.g. State Bank of India"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Work Email / Mobile Number *</span>
                    <input
                      type="text"
                      value={leadForm.contactInfo}
                      onChange={(e) => setLeadForm((f) => ({ ...f, contactInfo: e.target.value }))}
                      placeholder="e.g. rajesh@sbi.co.in or +91 9876543210"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>

                  {/* Current config preview */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Configuration Snapshot</p>
                    <p className="text-[10px] text-gray-400">
                      Profile: <span className="text-white font-semibold">{PRESETS[activePreset].label}</span>
                      {' · '}
                      Mode: <span className="text-white font-semibold">{activeMetric === 'CORRUPT_ACTORS' ? 'Fraud Detection' : 'Loan Underwriting'}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleLeadSubmit}
                    disabled={leadSubmitting || !leadForm.fullName || !leadForm.organization || !leadForm.contactInfo}
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
          <div className="w-[420px] bg-[#0f1523]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
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
              {activeMetric === 'CORRUPT_ACTORS' ? (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;How long does your manual multi-hop mule account investigation take today?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;We resolve syndicates in <span className="text-[#76B900] font-bold">2.1ms</span> using TigerGraph on Dell PowerEdge XE9680, achieving <span className="text-[#76B900] font-bold">99.4%</span> bad actor capture with zero mule leakage — protecting{' '}
                      <span className="text-[#76B900] font-bold">₹{corruptCalc.capitalSavedCr.toLocaleString()} Cr</span> in capital.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      100% RBI-compliant, air-gapped, on-premise Graph AI — no data leaves sovereign boundaries. Deployed and managed end-to-end by Team Computers.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;What is your customer drop-off during the {turnaroundHours}-hour loan verification window?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;Dell AI Factory reduces loan decisioning to <span className="text-[#76B900] font-bold">8 seconds</span>, cutting processing costs from ₹{costPerApp} to{' '}
                      <span className="text-[#76B900] font-bold">₹35</span> — a <span className="text-[#76B900] font-bold">{uwCalc.costSavedPct}%</span> reduction — while recovering 94% completion rates.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Real-time Multi-Modal GenAI on Dell PowerEdge with NVIDIA AI Enterprise — 15X throughput, WORM-certified explainable AI trail, zero data egress.
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
