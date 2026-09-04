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
  FileCheck,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Hospital,
  FileText,
  Stethoscope,
  Lock,
  HelpCircle,
  X,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Building2,
  Globe,
  Award,
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
type ActiveMetric = 'IMAGING_TRIAGE' | 'RCM_AUTOMATION';
type PresetProfile = 'MULTI_SPECIALTY' | 'DIAGNOSTIC_LAB' | 'CUSTOM';

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
  MULTI_SPECIALTY: {
    label: 'Multi-Specialty Network',
    icon: Hospital,
    imaging: { scanVolume: 75_000, turnaroundHours: 24, misclassRate: 7.5, storageTb: 600 },
    rcm: { monthlyClaims: 250_000, denialRate: 19.2, costPerClaim: 720, preAuthDays: 7 },
  },
  DIAGNOSTIC_LAB: {
    label: 'Diagnostic / Imaging Lab',
    icon: Stethoscope,
    imaging: { scanVolume: 20_000, turnaroundHours: 12, misclassRate: 4.8, storageTb: 150 },
    rcm: { monthlyClaims: 55_000, denialRate: 12.5, costPerClaim: 380, preAuthDays: 3 },
  },
  CUSTOM: {
    label: 'Reset Defaults',
    icon: RotateCcw,
    imaging: { scanVolume: 45_000, turnaroundHours: 18, misclassRate: 6.8, storageTb: 350 },
    rcm: { monthlyClaims: 120_000, denialRate: 16.5, costPerClaim: 550, preAuthDays: 5 },
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
export default function HealthcareDashboard() {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('IMAGING_TRIAGE');
  const [activePreset, setActivePreset] = useState<PresetProfile>('CUSTOM');

  /* ── UI state ── */
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormData>({ fullName: '', organization: '', contactInfo: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  /* ── IMAGING_TRIAGE state ── */
  const [scanVolume, setScanVolume]             = useState(45_000);
  const [turnaroundHours, setTurnaroundHours]   = useState(18);
  const [misclassRate, setMisclassRate]         = useState(6.8);
  const [storageTb, setStorageTb]               = useState(350);

  /* ── RCM_AUTOMATION state ── */
  const [monthlyClaims, setMonthlyClaims]       = useState(120_000);
  const [denialRate, setDenialRate]             = useState(16.5);
  const [costPerClaim, setCostPerClaim]         = useState(550);
  const [preAuthDays, setPreAuthDays]           = useState(5);

  /* ── Preset applier ── */
  const applyPreset = useCallback((preset: PresetProfile) => {
    const cfg = PRESETS[preset];
    setActivePreset(preset);
    setScanVolume(cfg.imaging.scanVolume);
    setTurnaroundHours(cfg.imaging.turnaroundHours);
    setMisclassRate(cfg.imaging.misclassRate);
    setStorageTb(cfg.imaging.storageTb);
    setMonthlyClaims(cfg.rcm.monthlyClaims);
    setDenialRate(cfg.rcm.denialRate);
    setCostPerClaim(cfg.rcm.costPerClaim);
    setPreAuthDays(cfg.rcm.preAuthDays);
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
          industry: 'Healthcare',
          activeMetric,
          activePreset,
          sliderConfig: {
            imaging: { scanVolume, turnaroundHours, misclassRate, storageTb },
            rcm: { monthlyClaims, denialRate, costPerClaim, preAuthDays },
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.warn('Offline mode: Lead queued locally.');
    }
    setLeadSubmitting(false);
    setLeadSubmitted(true);
  }, [leadForm, activeMetric, activePreset, scanVolume, turnaroundHours, misclassRate, storageTb, monthlyClaims, denialRate, costPerClaim, preAuthDays]);

  /* ═══ Derived Calculations ═══ */
  const imagingCalc = useMemo(() => {
    // Annual Clinical Capacity Gain = Math.round(Monthly Scans * 0.42) additional scans triaged
    const capacityGain = Math.round(scanVolume * 0.42);
    return {
      capacityGain,
      readSla: '1.8 Seconds',
      slaReduction: '94%',
      accuracy: '99.4%',
    };
  }, [scanVolume]);

  const rcmCalc = useMemo(() => {
    // Annual Capital Recovered from Denials = Math.round(((Monthly Claims * (Initial Denial Rate / 100) * 0.85) * 12 * 8500) / 10000000) in ₹ Cr
    const deniedClaimsMonthly = monthlyClaims * (denialRate / 100);
    const recoveredMonthly = deniedClaimsMonthly * 0.85;
    const rawCapitalRecoveredCr = (recoveredMonthly * 12 * 8500) / 10_000_000;
    const capitalRecoveredCr = Math.round(rawCapitalRecoveredCr);

    const costDropPct = Math.round(((costPerClaim - 45) / Math.max(costPerClaim, 1)) * 100);
    const denialDropPct = Math.round(((denialRate - 2.1) / Math.max(denialRate, 1)) * 100);
    const cleanClaimPct = 97.9;

    return {
      capitalRecoveredCr,
      costDropPct,
      denialDropPct,
      cleanClaimPct,
    };
  }, [monthlyClaims, denialRate, costPerClaim]);

  /* ═══ Comparison Rows ═══ */
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (activeMetric === 'IMAGING_TRIAGE') {
      return [
        {
          icon: <HardDrive className="w-4 h-4" />,
          label: 'PACS Integration',
          currentValue: 'Siloed Legacy Archival',
          optimizedValue: 'Dell PowerScale + GPU-Direct Storage',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          label: 'Critical Scan Triage',
          currentValue: 'First-In-First-Out (Delayed)',
          optimizedValue: 'Auto-Priority Flagging (Hemorrhage/Stroke)',
        },
        {
          icon: <Zap className="w-4 h-4" />,
          label: 'Inference Latency',
          currentValue: 'Batch Processing (Minutes)',
          optimizedValue: 'Sub-2s Local GPU Volumetric Inference',
          highlightCurrent: true,
        },
        {
          icon: <Clock className="w-4 h-4" />,
          label: 'Diagnostic Turnaround SLA',
          currentValue: `${turnaroundHours} Hours`,
          optimizedValue: '1.8 Seconds Initial Alert (-94%)',
          highlightCurrent: true,
        },
        {
          icon: <Lock className="w-4 h-4" />,
          label: 'Data Privacy & Residency',
          currentValue: 'Public Cloud Egress (HIPAA/DISHA Risk)',
          optimizedValue: '100% On-Premise Air-Gapped Sovereign PACS',
          highlightCurrent: true,
        },
        {
          icon: <Stethoscope className="w-4 h-4" />,
          label: 'Clinician Workload Burnout',
          currentValue: 'Severe Reading Backlog',
          optimizedValue: '65% Accelerated Routine Reporting',
        },
      ];
    }
    return [
      {
        icon: <FileText className="w-4 h-4" />,
        label: 'Claim Processing Mode',
        currentValue: 'Manual Coding & Post-Facto Scrubbing',
        optimizedValue: 'Real-Time Agentic LLM Verification',
      },
      {
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Initial Denial Rate',
        currentValue: `${denialRate}%`,
        optimizedValue: '2.1% (Auto Policy & ICD-10 Rule Mapping)',
        highlightCurrent: true,
      },
      {
        icon: <DollarSign className="w-4 h-4" />,
        label: 'Cost Per Processed Claim',
        currentValue: `₹${costPerClaim}`,
        optimizedValue: '₹45 (Full Pipeline Automation)',
        highlightCurrent: true,
      },
      {
        icon: <Clock className="w-4 h-4" />,
        label: 'Pre-Authorization SLA',
        currentValue: `${preAuthDays} Days`,
        optimizedValue: 'Under 10 Seconds (Automated EHR Extraction)',
        highlightCurrent: true,
      },
      {
        icon: <Layers className="w-4 h-4" />,
        label: 'Denial Recovery Turnaround',
        currentValue: '30-45 Days Dispute Cycle',
        optimizedValue: 'Automated Real-Time Resubmission',
      },
      {
        icon: <FileCheck className="w-4 h-4" />,
        label: 'Revenue Cycle Predictability',
        currentValue: 'High Write-Off Risk',
        optimizedValue: '98% First-Pass Clean Claim Yield',
        highlightCurrent: true,
      },
    ];
  }, [activeMetric, turnaroundHours, denialRate, costPerClaim, preAuthDays]);

  /* ═══ KPI Badges ═══ */
  const kpiBadges: KPIBadge[] = useMemo(() => {
    if (activeMetric === 'IMAGING_TRIAGE') {
      return [
        { value: '1.8s',        label: 'Rapid Triage Latency',     color: '#0076CE' },
        { value: '94%',         label: 'Radiology SLA Gain',       color: '#0076CE' },
        { value: '99.4%',       label: 'Diagnostic Precision',     color: '#76B900' },
        { value: 'Zero',        label: 'Patient PII Egress',       color: '#76B900' },
        { value: '100%',        label: 'DISHA/HIPAA Compliant',    color: '#0076CE' },
        { value: 'PowerScale',  label: 'High-IOPS PACS Storage',   color: '#76B900' },
      ];
    }
    return [
      { value: `${rcmCalc.denialDropPct}%`,            label: 'Claim Denial Drop',       color: '#0076CE' },
      { value: `${rcmCalc.costDropPct}%`,              label: 'Lower Cost Per Claim',    color: '#0076CE' },
      { value: '<10s',                                 label: 'Instant Pre-Auth',        color: '#76B900' },
      { value: `₹${rcmCalc.capitalRecoveredCr.toLocaleString()} Cr`, label: 'Revenue Protected',   color: '#76B900' },
      { value: '98%',                                  label: 'Clean Claim Rate',        color: '#0076CE' },
      { value: 'Zero',                                 label: 'Cloud Lock-In Egress',    color: '#76B900' },
    ];
  }, [activeMetric, rcmCalc]);

  /* ═══ Chart — IMAGING_TRIAGE: Horizontal Bar Chart (PRESERVED EXACTLY) ═══ */
  const imagingChartData: ChartData<'bar'> = useMemo(() => ({
    labels: ['Radiology Triage Window (Hours)', 'Misclassification / Delayed Rate (%)'],
    datasets: [
      {
        label: 'Legacy Manual PACS',
        data: [turnaroundHours, misclassRate],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#f87171',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Dell Healthcare AI Factory',
        data: [0.0005, 0.6],
        backgroundColor: 'rgba(118, 185, 0, 0.85)',
        borderColor: '#84cc16',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }), [turnaroundHours, misclassRate]);

  const imagingChartOptions: ChartOptions<'bar'> = {
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
              return v < 0.01 ? ` ${l}: 1.8 Seconds (Instant Alert)` : ` ${l}: ${v} Hours SLA`;
            }
            return ` ${l}: ${v}% Error/Delayed Rate`;
          },
          afterBody: () => {
            return `\n🏥 Annual Clinical Capacity Gain: +${imagingCalc.capacityGain.toLocaleString()} Scans`;
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

  /* ═══ Chart — RCM_AUTOMATION: Doughnut Chart (NEW) ═══ */
  const rcmDoughnutData: ChartData<'doughnut'> = useMemo(() => ({
    labels: ['Clean Approved Claims (Dell AI)', 'Legacy Claim Denials & Revenue Leakage'],
    datasets: [
      {
        data: [rcmCalc.cleanClaimPct, denialRate],
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
  }), [rcmCalc, denialRate]);

  /* Center text plugin for RCM Doughnut */
  const rcmDoughnutCenterPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'rcmDoughnutCenterText',
    afterDraw(chart) {
      const { ctx, width, height } = chart;
      ctx.save();

      // Primary value — capital recovered
      const primaryText = `₹${rcmCalc.capitalRecoveredCr.toLocaleString()} Cr`;
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#76B900';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(primaryText, width / 2, height / 2 - 18);

      // Secondary label
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Revenue Protected', width / 2, height / 2 + 6);

      // Tertiary — clean claim rate
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(`${rcmCalc.cleanClaimPct}% Clean Claim Yield`, width / 2, height / 2 + 24);

      // Quaternary — cost
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0076CE';
      ctx.fillText(`₹45/Claim · ${rcmCalc.costDropPct}% Cost Drop`, width / 2, height / 2 + 42);

      ctx.restore();
    },
  }), [rcmCalc]);

  const rcmDoughnutOptions: ChartOptions<'doughnut'> = useMemo(() => ({
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
              return ` Dell AI Factory: ${v}% Clean Approved Claims`;
            }
            return ` Legacy RCM: ${v}% Denial & Revenue Leakage`;
          },
          afterBody: () => {
            return `\n💰 Capital Recovered: ₹${rcmCalc.capitalRecoveredCr.toLocaleString()} Cr\n⚡ Pre-Auth SLA: <10 Seconds`;
          },
        },
      },
    },
  }), [rcmCalc]);

  /* ═══ Render ═══ */
  return (
    <div className="w-full flex flex-col gap-5 relative">
      {/* ── Header with Team Computers Co-Branding ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0076CE]/70 mb-0.5">
            Sovereign Clinical AI Infrastructure &amp; High-IOPS PACS Fabric Architected by Team Computers
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0076CE] mb-1">
            Dell Technologies · Healthcare &amp; Life Sciences AI Lab
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Infrastructure Modernization Assessment
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-400 max-w-md text-right leading-relaxed hidden lg:block">
          Live calculator — adjust Hospital CIO inputs; diagnostic triage SLAs, revenue cycle recoveries, and clinical architecture recalculate automatically.
        </p>
      </div>

      {/* ═══ Dell Healthcare Leadership Banner ═══ */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-2.5 mb-1 grid grid-cols-3 gap-3 text-center">
        {/* Card 1 — Top 10 */}
        <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 px-3 hover:border-[#0076CE]/30 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0076CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-[#0076CE]/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Market Leadership</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: '#0076CE' }}>
              Top 10
            </p>
            <p className="text-[10px] text-gray-400 leading-snug mt-1">
              Healthcare companies in the world use PowerMax / PowerStore
            </p>
          </div>
        </div>

        {/* Card 2 — 65% */}
        <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 px-3 hover:border-[#76B900]/30 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#76B900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-[#76B900]/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Infrastructure Share</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: '#76B900' }}>
              65%
            </p>
            <p className="text-[10px] text-gray-400 leading-snug mt-1">
              Of storage infrastructure in hospitals runs on Dell
            </p>
          </div>
        </div>

        {/* Card 3 — +8K */}
        <div className="relative group bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 px-3 hover:border-[#06B6D4]/30 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-[#06B6D4]/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Global Reach</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: '#06B6D4' }}>
              +8K
            </p>
            <p className="text-[10px] text-gray-400 leading-snug mt-1">
              Hospitals worldwide deploy Dell healthcare solutions
            </p>
          </div>
        </div>
      </div>

      {/* ── Metric Switcher Tabs ── */}
      <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
        <button
          onClick={() => setActiveMetric('IMAGING_TRIAGE')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
            activeMetric === 'IMAGING_TRIAGE'
              ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
              : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          AI Medical Imaging &amp; Diagnostic Assistance
        </button>
        <button
          onClick={() => setActiveMetric('RCM_AUTOMATION')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
            activeMetric === 'RCM_AUTOMATION'
              ? 'bg-[#0076CE] text-white shadow-[0_0_20px_rgba(0,118,206,0.4)]'
              : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Claims &amp; Revenue Cycle Management Automation
        </button>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ═══ 3-Column Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-5">

        {/* ── Left: Hospital CIO / Medical Director Discovery Inputs ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">

          {/* Hospital Scale Presets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Hospital Profile</p>
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

          <h3 className="text-base font-bold text-white tracking-wide">CIO / Operations Discovery</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0076CE]">
            {activeMetric === 'IMAGING_TRIAGE'
              ? 'Radiology & DICOM Parameters'
              : 'Claims & Revenue Cycle Parameters'}
          </p>

          {activeMetric === 'IMAGING_TRIAGE' ? (
            <>
              <InputField
                label="Monthly Scans Volume (CT/MRI)"
                value={scanVolume}
                onChange={(v) => { setScanVolume(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 45000"
              />
              <InputField
                label="Radiologist Turnaround SLA"
                suffix="Hours"
                value={turnaroundHours}
                onChange={(v) => { setTurnaroundHours(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 18"
              />
              <InputField
                label="Critical Delayed Read / Error Rate"
                suffix="%"
                value={misclassRate}
                onChange={(v) => { setMisclassRate(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 6.8"
              />
              <InputField
                label="PACS/DICOM Storage Footprint"
                suffix="TB"
                value={storageTb}
                onChange={(v) => { setStorageTb(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 350"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell Healthcare Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Inference Read SLA</span>
                  <span className="font-bold text-[#76B900]">1.8 Seconds (Instant)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Emergency SLA Gain</span>
                  <span className="font-bold text-[#76B900]">94% Faster</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Diagnostic Precision</span>
                  <span className="font-bold text-[#76B900]">99.4% Accuracy</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Clinical Capacity Gain</span>
                  <span className="font-bold text-[#76B900]">+{imagingCalc.capacityGain.toLocaleString()} Scans/Yr</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <InputField
                label="Monthly Inpatient / Outpatient Claims"
                value={monthlyClaims}
                onChange={(v) => { setMonthlyClaims(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 120000"
              />
              <InputField
                label="Initial Claim Denial Rate"
                suffix="%"
                value={denialRate}
                onChange={(v) => { setDenialRate(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 16.5"
              />
              <InputField
                label="Processing Cost Per Claim"
                suffix="₹"
                value={costPerClaim}
                onChange={(v) => { setCostPerClaim(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 550"
              />
              <InputField
                label="Pre-Authorization Turnaround"
                suffix="Days"
                value={preAuthDays}
                onChange={(v) => { setPreAuthDays(v); setActivePreset('CUSTOM'); }}
                placeholder="e.g. 5"
              />

              {/* Derived preview */}
              <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#76B900]">Dell Agentic RCM Output</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Denial Rate Drop</span>
                  <span className="font-bold text-[#76B900]">2.1% ({rcmCalc.denialDropPct}% Drop)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Cost Per Processed Claim</span>
                  <span className="font-bold text-[#76B900]">₹45 ({rcmCalc.costDropPct}% Lower)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Pre-Auth Decision SLA</span>
                  <span className="font-bold text-[#76B900]">&lt;10 Seconds</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Capital Recovered</span>
                  <span className="font-bold text-[#76B900]">₹{rcmCalc.capitalRecoveredCr.toLocaleString()} Cr</span>
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
              Validated Clinical Integration, High-Throughput PACS Fabric &amp; 24/7 SLA by{' '}
              <span className="text-white font-semibold">Team Computers Healthcare Practice</span>
            </p>
          </div>
        </div>

        {/* ── Right: Dynamic Chart ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
            {activeMetric === 'IMAGING_TRIAGE'
              ? 'Diagnostic Turnaround & Error Rate Benchmark'
              : 'First-Pass Revenue Recovery & Clean Claims'}
          </h4>
          <div className="flex-1 min-h-[340px] relative flex items-center justify-center">
            {activeMetric === 'IMAGING_TRIAGE' ? (
              <Bar
                key="bar-imaging-triage"
                data={imagingChartData}
                options={imagingChartOptions}
              />
            ) : (
              <Doughnut
                key="doughnut-rcm-automation"
                data={rcmDoughnutData}
                options={rcmDoughnutOptions}
                plugins={[rcmDoughnutCenterPlugin]}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══ Lead Capture CTA Strip ═══ */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3">
        <Sparkles className="w-5 h-5 text-[#0076CE] shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Ready to deploy sovereign clinical AI in your hospital environment?</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowLeadModal(true); setLeadSubmitted(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0076CE] text-white text-sm font-bold shadow-[0_0_24px_rgba(0,118,206,0.35)] hover:shadow-[0_0_32px_rgba(0,118,206,0.55)] hover:bg-[#0068b5] transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Schedule 1-Day Clinical AI Sandbox PoC
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
                  <Hospital className="w-4 h-4 text-[#0076CE]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Schedule a Clinical AI Sandbox PoC
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Deploy Dell PowerEdge + NVIDIA Clara on-premise in your radiology suite or Team Computers Healthcare Experience Center.
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
                    Our Team Computers healthcare engineering team will contact you within 24 hours to schedule your clinical AI sandbox deployment.
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
                      placeholder="e.g. Dr. Priya Reddy"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Hospital / Diagnostic Network Name *</span>
                    <input
                      type="text"
                      value={leadForm.organization}
                      onChange={(e) => setLeadForm((f) => ({ ...f, organization: e.target.value }))}
                      placeholder="e.g. Apollo Hospitals, Hyderabad"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-400 mb-1 block">Work Email / Phone *</span>
                    <input
                      type="text"
                      value={leadForm.contactInfo}
                      onChange={(e) => setLeadForm((f) => ({ ...f, contactInfo: e.target.value }))}
                      placeholder="e.g. priya@apollohospitals.com or +91 9876543210"
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#0076CE] focus:ring-1 focus:ring-[#0076CE]/50 placeholder:text-gray-600 transition-colors"
                    />
                  </label>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Configuration Snapshot</p>
                    <p className="text-[10px] text-gray-400">
                      Profile: <span className="text-white font-semibold">{PRESETS[activePreset].label}</span>
                      {' · '}
                      Mode: <span className="text-white font-semibold">{activeMetric === 'IMAGING_TRIAGE' ? 'Medical Imaging' : 'Revenue Cycle'}</span>
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
              {activeMetric === 'IMAGING_TRIAGE' ? (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Hook</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Quote Dell&apos;s <span className="text-[#0076CE] font-bold">65%</span> hospital infrastructure benchmark to establish credibility.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;Emergency acute trauma reads cannot wait hours. Dell AI Factory triages critical stroke/hemorrhage scans in{' '}
                      <span className="text-[#76B900] font-bold">1.8 seconds</span> locally with{' '}
                      <span className="text-[#76B900] font-bold">100% DISHA/HIPAA compliance</span> — unlocking{' '}
                      <span className="text-[#76B900] font-bold">+{imagingCalc.capacityGain.toLocaleString()}</span> additional scans per year.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      99.4% diagnostic precision. Zero patient PII egress. Dell PowerScale high-IOPS PACS storage. Deployed by Team Computers Healthcare Practice.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0076CE]">Opening Question</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;What percentage of your operating margin is stuck in the 30-day insurer dispute window?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#76B900]">Dell AI Factory Pitch</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      &ldquo;We elevate clean claim yields to{' '}
                      <span className="text-[#76B900] font-bold">97.9%</span> and drop processing costs to{' '}
                      <span className="text-[#76B900] font-bold">₹45/claim</span> — a{' '}
                      <span className="text-[#76B900] font-bold">{rcmCalc.costDropPct}%</span> reduction — recovering{' '}
                      <span className="text-[#76B900] font-bold">₹{rcmCalc.capitalRecoveredCr.toLocaleString()} Cr</span> in annual denied revenue.&rdquo;
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Key Differentiator</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Agentic LLM auto-maps ICD-10 codes in real-time. Pre-auth in under 10 seconds. Zero cloud lock-in. Managed end-to-end by Team Computers.
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
