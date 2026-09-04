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
  ShieldAlert,
  Cpu,
  Lock,
  Zap,
  Server,
  Activity,
  Network,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Flame,
  Layers,
  TrendingUp,
  FileCheck,
  Building2,
  Cloud,
  RotateCcw,
  Sparkles,
  Send,
  Download,
  X,
  MessageSquare,
  HelpCircle,
  ArrowLeft,
  Briefcase,
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
type ActiveMetric = 'CYBER_RESILIENCE' | 'PERF_SCALABILITY';
type PresetProfile = 'TIER1_ENTERPRISE' | 'MID_MARKET' | 'CUSTOM';

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
  phone: string;
}

/* ── preset configurations ────────────────────────────────────────── */
const PRESETS = {
  TIER1_ENTERPRISE: {
    label: 'Tier-1 Enterprise / SaaS Unicorn',
    icon: Building2,
    resilience: { dataEstatePb: 8.5, drSlaHours: 48, costPerHourLakhs: 120, blastRadius: 65 },
    perf: { nodeClusters: 128, gpuUtilization: 45, interNodeLatencyUs: 60, annualCloudSpendCr: 45 },
  },
  MID_MARKET: {
    label: 'Mid-Market Tech / Growth SaaS',
    icon: Cloud,
    resilience: { dataEstatePb: 2.0, drSlaHours: 24, costPerHourLakhs: 40, blastRadius: 35 },
    perf: { nodeClusters: 32, gpuUtilization: 32, interNodeLatencyUs: 35, annualCloudSpendCr: 12 },
  },
  CUSTOM: {
    label: 'Reset Baseline',
    icon: RotateCcw,
    resilience: { dataEstatePb: 4.5, drSlaHours: 36, costPerHourLakhs: 65, blastRadius: 42 },
    perf: { nodeClusters: 64, gpuUtilization: 38, interNodeLatencyUs: 45, annualCloudSpendCr: 24 },
  },
} as const;

/* ── reusable input component ─────────────────────────────────────── */
function InputField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  suffix?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">
        {label}
        {suffix && <span className="text-gray-500 ml-1">({suffix})</span>}
      </span>
      <input
        type="number"
        step={step || 'any'}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm tabular-nums focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
      />
    </label>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export default function ITSecurityDashboard() {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('CYBER_RESILIENCE');
  const [activePreset, setActivePreset] = useState<PresetProfile>('CUSTOM');

  /* ── UI state ── */
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormData>({ fullName: '', organization: '', email: '', phone: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  /* ── CYBER_RESILIENCE state ── */
  const [dataEstatePb, setDataEstatePb]         = useState(4.5);
  const [drSlaHours, setDrSlaHours]             = useState(36);
  const [costPerHourLakhs, setCostPerHourLakhs] = useState(65);
  const [blastRadius, setBlastRadius]           = useState(42);

  /* ── PERF_SCALABILITY state ── */
  const [nodeClusters, setNodeClusters]         = useState(64);
  const [gpuUtilization, setGpuUtilization]     = useState(38);
  const [interNodeLatencyUs, setInterNodeLatencyUs] = useState(45);
  const [annualCloudSpendCr, setAnnualCloudSpendCr] = useState(24);

  /* ── Preset applier ── */
  const applyPreset = useCallback((preset: PresetProfile) => {
    const cfg = PRESETS[preset];
    setActivePreset(preset);
    setDataEstatePb(cfg.resilience.dataEstatePb);
    setDrSlaHours(cfg.resilience.drSlaHours);
    setCostPerHourLakhs(cfg.resilience.costPerHourLakhs);
    setBlastRadius(cfg.resilience.blastRadius);
    setNodeClusters(cfg.perf.nodeClusters);
    setGpuUtilization(cfg.perf.gpuUtilization);
    setInterNodeLatencyUs(cfg.perf.interNodeLatencyUs);
    setAnnualCloudSpendCr(cfg.perf.annualCloudSpendCr);
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
          industry: 'IT_Security',
          activeMetric,
          activePreset,
          sliderConfig: {
            resilience: { dataEstatePb, drSlaHours, costPerHourLakhs, blastRadius },
            perf: { nodeClusters, gpuUtilization, interNodeLatencyUs, annualCloudSpendCr },
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.warn('Offline mode: Lead queued locally.');
    }
    setLeadSubmitting(false);
    setLeadSubmitted(true);
  }, [leadForm, activeMetric, activePreset, dataEstatePb, drSlaHours, costPerHourLakhs, blastRadius, nodeClusters, gpuUtilization, interNodeLatencyUs, annualCloudSpendCr]);

  /* ═══ Derived Calculations ═══ */
  const resilienceCalc = useMemo(() => {
    // Potential Downtime Capital Protected = Math.round(((DR SLA Hours - 0.25) * Cost Per Hour) / 100) in ₹ Cr
    const hoursSaved = Math.max(0, drSlaHours - 0.25);
    const rawProtectedCr = (hoursSaved * costPerHourLakhs) / 100;
    const capitalProtectedCr = Math.round(rawProtectedCr);

    return {
      rtoCleanRoom: '15 Minutes',
      rpoSnapshots: '< 5 Minutes',
      blastContainment: '< 0.5%',
      capitalProtectedCr,
    };
  }, [drSlaHours, costPerHourLakhs]);

  const perfCalc = useMemo(() => {
    // 3-Year Infrastructure TCO Savings = Math.round(Annual Cloud Spend * 0.58 * 3) in ₹ Cr
    const rawTcoSavingsCr = annualCloudSpendCr * 0.58 * 3;
    const tcoSavingsCr = Math.round(rawTcoSavingsCr);
    const efficiencyGain = Number((88 / Math.max(gpuUtilization, 1)).toFixed(1));

    return {
      tcoSavingsCr,
      efficiencyGain,
      spectrumSpeedup: '4.8X',
      latencyUs: '1.2 µs',
      idleWastePct: 12,
      sustainedPct: 88,
    };
  }, [annualCloudSpendCr, gpuUtilization]);

  /* ═══ Comparison Rows ═══ */
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (activeMetric === 'CYBER_RESILIENCE') {
      return [
        {
          icon: <HardDrive className="w-4 h-4" />,
          label: 'Vault Architecture',
          currentValue: 'Standard Connected Secondary DR',
          optimizedValue: 'Air-Gapped Isolated Cyber Vault (Dell PowerProtect)',
        },
        {
          icon: <RefreshCw className="w-4 h-4" />,
          label: 'Recovery Time Objective (RTO)',
          currentValue: `${drSlaHours} Hours`,
          optimizedValue: '15 Minutes (Automated Clean-Room Spin-up)',
          highlightCurrent: true,
        },
        {
          icon: <Lock className="w-4 h-4" />,
          label: 'Data Immutability',
          currentValue: 'Software Snapshots (Root Compromise Risk)',
          optimizedValue: 'Hardware WORM + Air-Gapped Retention Lock',
          highlightCurrent: true,
        },
        {
          icon: <ShieldAlert className="w-4 h-4" />,
          label: 'Threat Analysis Mode',
          currentValue: 'Manual Post-Mortem Forensic Log Audit',
          optimizedValue: 'Continuous AI-Powered CyberSense Anomaly Detection',
        },
        {
          icon: <Flame className="w-4 h-4" />,
          label: 'Ransomware Blast Radius',
          currentValue: `${blastRadius}%`,
          optimizedValue: '< 0.5% Containment (Zero Egress Isolation)',
          highlightCurrent: true,
        },
        {
          icon: <ShieldCheck className="w-4 h-4" />,
          label: 'Compliance & Cyber Insurance',
          currentValue: 'Increased Underwriting Audit Risk',
          optimizedValue: '100% Zero-Trust NIST & RBI Resiliency Framework',
          highlightCurrent: true,
        },
      ];
    }
    return [
      {
        icon: <Server className="w-4 h-4" />,
        label: 'Compute Infrastructure',
        currentValue: 'Virtualized Public Cloud GPU Nodes',
        optimizedValue: 'Dell PowerEdge XE9680 (8× NVIDIA H100/H200 SXM)',
      },
      {
        icon: <Network className="w-4 h-4" />,
        label: 'Fabric Interconnect',
        currentValue: 'Standard 100GbE Network (TCP Congestion)',
        optimizedValue: '800Gb/s NVIDIA Spectrum-X Ethernet Fabric',
        highlightCurrent: true,
      },
      {
        icon: <Cpu className="w-4 h-4" />,
        label: 'Average GPU Utilization',
        currentValue: `${gpuUtilization}%`,
        optimizedValue: '88% (Zero Thermal or I/O Throttling)',
        highlightCurrent: true,
      },
      {
        icon: <Zap className="w-4 h-4" />,
        label: 'Inter-Node Latency',
        currentValue: `${interNodeLatencyUs} µs`,
        optimizedValue: '1.2 µs (Sub-microsecond RoCE via Spectrum-X)',
      },
      {
        icon: <Layers className="w-4 h-4" />,
        label: 'Distributed Scale Efficiency',
        currentValue: '52% Drop at Multi-Node Scale',
        optimizedValue: '94% Linear Scaling Efficiency',
        highlightCurrent: true,
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        label: '3-Year TCO Predictability',
        currentValue: 'Unbounded Cloud Egress & Token Inflation',
        optimizedValue: 'Fixed Depreciable CapEx (40%+ TCO Savings)',
      },
    ];
  }, [activeMetric, drSlaHours, blastRadius, gpuUtilization, interNodeLatencyUs]);

  /* ═══ KPI Badges ═══ */
  const kpiBadges: KPIBadge[] = useMemo(() => {
    if (activeMetric === 'CYBER_RESILIENCE') {
      return [
        { value: '15-Min',                                          label: 'Rapid Clean Recovery',    color: '#0076CE' },
        { value: 'Zero-Trust',                                      label: 'Air-Gapped Vault',        color: '#0076CE' },
        { value: '< 5 Min',                                         label: 'RPO Immutability',        color: '#76B900' },
        { value: `₹${resilienceCalc.capitalProtectedCr.toLocaleString()} Cr`, label: 'Outage Cost Avoided', color: '#76B900' },
        { value: '99.5%',                                           label: 'Blast Radius Reduction',  color: '#0076CE' },
        { value: '100%',                                            label: 'CyberSense Integrity',    color: '#76B900' },
      ];
    }
    return [
      { value: '88%',                                        label: 'Sustained GPU Utilization', color: '#0076CE' },
      { value: '4.8X',                                       label: 'Distributed Speedup',       color: '#0076CE' },
      { value: '1.2µs',                                      label: 'Ultra-Low Fabric Latency',  color: '#76B900' },
      { value: `₹${perfCalc.tcoSavingsCr.toLocaleString()} Cr`, label: '3-Yr TCO Saved',            color: '#76B900' },
      { value: '800Gb/s',                                    label: 'Spectrum-X RoCE Fabric',    color: '#0076CE' },
      { value: 'Zero',                                       label: 'Public Cloud Lock-In',      color: '#76B900' },
    ];
  }, [activeMetric, resilienceCalc, perfCalc]);

  /* ═══ Chart — CYBER_RESILIENCE: Horizontal Bar Chart (PRESERVED) ═══ */
  const resilienceChartData: ChartData<'bar'> = useMemo(() => ({
    labels: ['Recovery Window / RTO (Hours)', 'Blast Radius Exposure (%)'],
    datasets: [
      {
        label: 'Legacy Connected DR',
        data: [drSlaHours, blastRadius],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#f87171',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Dell Isolated Cyber Vault',
        data: [0.25, 0.5],
        backgroundColor: 'rgba(118, 185, 0, 0.85)',
        borderColor: '#84cc16',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }), [drSlaHours, blastRadius]);

  const resilienceChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
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
            const v = ctx.parsed.x ?? 0;
            if (ctx.dataIndex === 0) {
              return v <= 0.25 ? ` ${l}: 15 Minutes (Clean-Room Spin-up)` : ` ${l}: ${v} Hours RTO`;
            }
            return ` ${l}: ${v}% Blast Radius Exposure`;
          },
          afterBody: () => {
            return `\n🛡️ Net Outage Capital Protected: ₹${resilienceCalc.capitalProtectedCr.toLocaleString()} Cr`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: '#fff', font: { size: 11, weight: 'bold' } },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  /* ═══ Chart — PERF_SCALABILITY: Doughnut Chart (NEW) ═══ */
  const perfDoughnutData: ChartData<'doughnut'> = useMemo(() => ({
    labels: ['Active Productive Compute (Dell + Spectrum-X)', 'Idle / Latency Bottleneck Overhead'],
    datasets: [
      {
        data: [perfCalc.sustainedPct, perfCalc.idleWastePct],
        backgroundColor: [
          'rgba(118, 185, 0, 0.9)',
          'rgba(0, 118, 206, 0.85)',
        ],
        borderColor: [
          '#76B900',
          '#0076CE',
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }), [perfCalc]);

  /* Center text plugin for PERF_SCALABILITY Doughnut */
  const perfDoughnutCenterPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'perfDoughnutCenterText',
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      ctx.save();

      // Primary value — 4.8X Speedup
      const primaryText = `${perfCalc.spectrumSpeedup} Speedup`;
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#76B900';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(primaryText, width / 2, height / 2 - 18);

      // Secondary label
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Distributed Training', width / 2, height / 2 + 6);

      // Tertiary — TCO
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0076CE';
      ctx.fillText(`₹${perfCalc.tcoSavingsCr.toLocaleString()} Cr TCO Saved`, width / 2, height / 2 + 24);

      ctx.restore();
    },
  }), [perfCalc]);

  const perfDoughnutOptions: ChartOptions<'doughnut'> = useMemo(() => ({
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
              return ` Dell AI Factory: ${v}% Sustained Density`;
            }
            return ` Legacy Cloud: ${v}% Idle Waste`;
          },
          afterBody: () => {
            return `\n💰 3-Year TCO Saved: ₹${perfCalc.tcoSavingsCr.toLocaleString()} Cr`;
          },
        },
      },
    },
  }), [perfCalc]);

  /* ═══ Render ═══ */
  return (
    <div className="w-full flex flex-col gap-5 relative min-h-screen pb-10">
      {/* ── Co-Branded Navbar ── */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-4 mb-2">
        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to Hub</span>
        </a>
        <div className="h-4 w-px bg-white/20 mx-2" />
        <div>
          <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-0.5">
            DELL AI FACTORY: <span className="text-[#0076CE]">IT &amp; SECURITY CORE ENVIRONMENT</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider">
            Zero-Trust Cyber Resilience &amp; Sovereign AI Compute Architected by Team Computers
          </p>
        </div>
      </div>

      {/* ═══ Dell Cybersecurity & Innovation Banner ═══ */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0076CE] to-[#76B900]" />
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              Creating a Secure Environment for Innovation | Zero Trust &amp; Cyber Resilience
            </h3>
          </div>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed ml-3 max-w-4xl">
            Transform cybersecurity from a defensive barrier into an engine for business agility—leveraging Dell PowerProtect Cyber Recovery, isolated air-gapped vaults, and automated ransomware mitigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#0076CE]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0076CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#0076CE]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Maturity Level</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#0076CE' }}>
                Level 5
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                Zero Trust Maturity — Aligned with Dell&apos;s Advanced Cybersecurity Checklist &amp; NIST Framework
              </p>
            </div>
          </div>

          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#76B900]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#76B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-[#76B900]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Recovery SLA</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#76B900' }}>
                &lt;15 Min
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                Rapid Clean-Room RTO — Automated isolated recovery under Dell&apos;s Ransomware Survival Blueprint
              </p>
            </div>
          </div>

          <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 hover:border-[#06B6D4]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[#06B6D4]/60" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Compute Density</span>
              </div>
              <p className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: '#06B6D4' }}>
                4.8X
              </p>
              <p className="text-[11px] text-gray-400 leading-snug mt-1.5">
                AI Compute Scalability — Uninterrupted workload density without security throttle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Switcher Tabs & CISO Trust Badges ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveMetric('CYBER_RESILIENCE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'CYBER_RESILIENCE'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Cyber Resilience &amp; Air-Gapped Vault Recovery
          </button>
          <button
            onClick={() => setActiveMetric('PERF_SCALABILITY')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
              activeMetric === 'PERF_SCALABILITY'
                ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Compute Performance &amp; Density Scalability
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0076CE]" />
            <span className="text-[10px] font-semibold text-[#0076CE]">NIST SP 800-207 Zero-Trust Architecture Certified</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-[#76B900]" />
            <span className="text-[10px] font-semibold text-[#76B900]">Hardware-Enforced Air-Gapped Cyber Recovery Vault</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <FileCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-[10px] font-semibold text-[#06B6D4]">Automated CyberSense Forensics &amp; WORM Immutability</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ═══ 3-Column Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-5">

        {/* ── Left: CIO / CISO Discovery Inputs ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          
          {/* Presets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Enterprise Scale</p>
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

          <h3 className="text-base font-bold text-white tracking-wide">CIO / CISO Discovery</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0076CE]">
            {activeMetric === 'CYBER_RESILIENCE'
              ? 'Zero-Trust & Vault Parameters'
              : 'AI Compute & Fabric Parameters'}
          </p>

          {activeMetric === 'CYBER_RESILIENCE' ? (
            <>
              <InputField
                label="Total Enterprise Data Estate"
                suffix="PB"
                value={dataEstatePb}
                onChange={(v) => { setDataEstatePb(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 4.5"
                step="0.1"
              />
              <InputField
                label="Current DR Recovery SLA (RTO)"
                suffix="Hours"
                value={drSlaHours}
                onChange={(v) => { setDrSlaHours(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 36"
              />
              <InputField
                label="Enterprise Outage Cost / Hour"
                suffix="₹ Lakhs"
                value={costPerHourLakhs}
                onChange={(v) => { setCostPerHourLakhs(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 65"
              />
              <InputField
                label="Ransomware Attack Blast Radius"
                suffix="%"
                value={blastRadius}
                onChange={(v) => { setBlastRadius(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 42"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell PowerProtect Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Isolated Vault RTO</span>
                  <span className="font-bold text-[#76B900]">15 Minutes (Clean-Room)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">RPO Immutability</span>
                  <span className="font-bold text-[#76B900]">&lt; 5 Minutes</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Blast Radius Containment</span>
                  <span className="font-bold text-[#76B900]">&lt; 0.5% (Isolated Air-Gap)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Outage Capital Protected</span>
                  <span className="font-bold text-[#76B900]">₹{resilienceCalc.capitalProtectedCr.toLocaleString()} Cr</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <InputField
                label="AI Model Node Clusters"
                value={nodeClusters}
                onChange={(v) => { setNodeClusters(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 64"
              />
              <InputField
                label="Current Average GPU Utilization"
                suffix="%"
                value={gpuUtilization}
                onChange={(v) => { setGpuUtilization(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 38"
              />
              <InputField
                label="Inter-Node Network Latency"
                suffix="µs"
                value={interNodeLatencyUs}
                onChange={(v) => { setInterNodeLatencyUs(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 45"
              />
              <InputField
                label="Annual Public Cloud Compute Spend"
                suffix="₹ Cr"
                value={annualCloudSpendCr}
                onChange={(v) => { setAnnualCloudSpendCr(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 24"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell XE9680 + Spectrum-X Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Sustained GPU Utilization</span>
                  <span className="font-bold text-[#76B900]">88% ({perfCalc.efficiencyGain}X Efficiency)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Fabric RoCE Latency</span>
                  <span className="font-bold text-[#76B900]">1.2 µs (Sub-Microsecond)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Epoch Speedup</span>
                  <span className="font-bold text-[#76B900]">4.8X Distributed Speed</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">3-Yr TCO Savings</span>
                  <span className="font-bold text-[#76B900]">₹{perfCalc.tcoSavingsCr.toLocaleString()} Cr</span>
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
              Turnkey Air-Gapped Staging, Zero-Trust Hardening &amp; 24/7 Managed NOC/SOC by{' '}
              <span className="text-white font-semibold">Team Computers</span>
            </p>
          </div>
        </div>

        {/* ── Right: Dynamic Chart ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {activeMetric === 'CYBER_RESILIENCE'
              ? 'Disaster Recovery SLA & Attack Blast Radius'
              : 'Sustained AI Workload Utilization & Density'}
          </h4>
          <div className="flex-1 min-h-[340px] relative flex items-center justify-center">
            {activeMetric === 'CYBER_RESILIENCE' ? (
              <Bar key="bar-cyber-resilience" data={resilienceChartData} options={resilienceChartOptions} />
            ) : (
              <Doughnut
                key="doughnut-perf-scalability"
                data={perfDoughnutData}
                options={perfDoughnutOptions}
                plugins={[perfDoughnutCenterPlugin]}
              />
            )}
          </div>
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

      {/* ═══ Lead Capture CTA Strip ═══ */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3">
        <Sparkles className="w-5 h-5 text-[#0076CE] shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Ready to secure your enterprise with an isolated Dell Cyber Vault?</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowLeadModal(true); setLeadSubmitted(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0076CE] text-white text-sm font-bold shadow-[0_0_24px_rgba(0,118,206,0.35)] hover:shadow-[0_0_32px_rgba(0,118,206,0.55)] hover:bg-[#0068b5] transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Schedule 1-Day Cyber Vault &amp; Zero-Trust PoC
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all duration-200">
            <Download className="w-3.5 h-3.5" />
            Download Executive Dossier
          </button>
        </div>
      </div>

      {/* ═══ Lead Capture Modal ═══ */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLeadModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0f1523] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => setShowLeadModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#0076CE]/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#0076CE]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Stage a Dell PowerProtect Isolated Cyber Vault with Team Computers
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Simulate a live ransomware attack and validate a 15-minute clean-room recovery in your sandbox.
              </p>
            </div>

            <div className="w-full h-px bg-white/[0.06]" />

            <div className="px-6 py-5">
              {leadSubmitted ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#76B900]/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#76B900]" />
                  </div>
                  <p className="text-base font-bold text-white">PoC Request Confirmed</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Our Team Computers NOC/SOC engineers will contact you within 24 hours to coordinate your zero-trust sandbox simulation.
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
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Company / Organization *</span>
                    <input
                      type="text"
                      value={leadForm.organization}
                      onChange={(e) => setLeadForm((f) => ({ ...f, organization: e.target.value }))}
                      placeholder="e.g. HDFC Life"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Work Email *</span>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. rahul@hdfclife.com"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Phone / WhatsApp</span>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Configuration Snapshot</p>
                    <p className="text-[10px] text-gray-400">
                      Profile: <span className="text-white font-semibold">{PRESETS[activePreset].label}</span>
                      {' · '}
                      Mode: <span className="text-white font-semibold">{activeMetric === 'CYBER_RESILIENCE' ? 'Cyber Resilience' : 'Compute Density'}</span>
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
              {activeMetric === 'CYBER_RESILIENCE' ? (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Hook</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Reference Dell&apos;s &apos;Cybersecurity Tapes&apos; and Dr. Tony Bryson CISO discussion: &ldquo;Ransomware is no longer an IF, but a WHEN. Traditional secondary backups get encrypted in 82% of sophisticated attacks.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;Dell PowerProtect creates a physically air-gapped vault with machine-learning threat forensics, dropping RTO from{' '}
                      <span className="text-[#76B900] font-bold">{drSlaHours} hours</span> to{' '}
                      <span className="text-[#76B900] font-bold">15 minutes</span> — and protecting{' '}
                      <span className="text-[#76B900] font-bold">₹{resilienceCalc.capitalProtectedCr.toLocaleString()} Cr</span> in outage costs.&rdquo;
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;How much of your GPU spend is wasted waiting on network latency between cloud nodes?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;NVIDIA Spectrum-X on Dell PowerEdge XE9680 reduces inter-node latency to{' '}
                      <span className="text-[#76B900] font-bold">1.2 microseconds</span>, driving sustained utilization to{' '}
                      <span className="text-[#76B900] font-bold">88%</span> and cutting 3-year TCO by{' '}
                      <span className="text-[#76B900] font-bold">over 40% (₹{perfCalc.tcoSavingsCr.toLocaleString()} Cr)</span>.&rdquo;
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
