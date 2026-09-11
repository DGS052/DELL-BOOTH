import { jsPDF } from 'jspdf';
import { TEAM_COMPUTERS_LOGO_B64, DELL_LOGO_B64 } from './logoBase64';

export interface ComparisonRow {
  label: string;
  currentValue: string;
  optimizedValue: string;
}

export interface KPIBadge {
  value: string;
  label: string;
}

export interface DossierData {
  industryTitle: string;
  reportSubtitle: string;
  metricLabel: string;
  comparisonRows: ComparisonRow[];
  kpiBadges: KPIBadge[];
  chartImageBase64?: string;
}

export function generateDossierPdf(data: DossierData) {
  // Create an A4 portrait PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background color (dark theme to match dashboard)
  doc.setFillColor(11, 15, 25); // #0B0F19
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // --- Header Band ---
  // White glassmorphic-like header bar
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 10, pageWidth - 20, 25, 'F');

  // Add logos to header
  // Team Computers Logo (Left)
  doc.addImage(TEAM_COMPUTERS_LOGO_B64, 'PNG', 15, 12, 46, 20);

  // Dell Logo (Right)
  doc.addImage(DELL_LOGO_B64, 'PNG', pageWidth - 15 - 60, 15, 60, 17);

  // --- Title Section ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Dell AI Factory: ${data.industryTitle}`, 15, 45);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // text-gray-400
  doc.text(`${data.reportSubtitle} | Metric: ${data.metricLabel}`, 15, 52);

  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - 15, 45, { align: 'right' });

  let currentY = 60;
  const colWidth = pageWidth - 30; // 180mm

  // --- Chart Image ---
  if (data.chartImageBase64) {
    let chartW = colWidth;
    let chartH = 75; // max height
    
    try {
      const imgProps = doc.getImageProperties(data.chartImageBase64);
      const aspectRatio = imgProps.width / imgProps.height;
      
      const calculatedHeight = chartW / aspectRatio;
      if (calculatedHeight <= 75) {
        chartH = calculatedHeight;
      } else {
        chartH = 75;
        chartW = chartH * aspectRatio;
      }
    } catch (e) {
      console.warn('Could not calculate chart image properties', e);
    }

    const chartX = 15 + (colWidth - chartW) / 2; // Center horizontally
    
    // Background for chart
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.setFillColor(255, 255, 255, 0.02);
    doc.rect(15, currentY, colWidth, chartH + 10, 'FD');

    try {
      doc.addImage(data.chartImageBase64, 'PNG', chartX, currentY + 5, chartW, chartH);
    } catch (e) {
      console.error('Error adding chart image to PDF:', e);
      doc.setTextColor(255, 0, 0);
      doc.text('Error rendering chart image', chartX, currentY + 20);
    }
    
    currentY += chartH + 15;
  } else {
    currentY += 10;
  }

  // --- Comparison Table ---
  doc.setFillColor(26, 35, 50); // Header dark bg
  doc.rect(15, currentY, colWidth, 9, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Columns X positions
  const labelX = 18;
  const currentValX = 15 + colWidth * 0.4;
  const optimizedValX = 15 + colWidth * 0.7;

  doc.text('Current State (AS-IS)', currentValX, currentY + 6);
  doc.setTextColor(118, 185, 0); // Dell Green
  doc.text('Dell Optimized', optimizedValX, currentY + 6);

  currentY += 11;
  
  doc.setFontSize(9);
  data.comparisonRows.forEach((row, idx) => {
    // Zebra striping
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255, 0.02);
      doc.rect(15, currentY - 3, colWidth, 9, 'F');
    }

    doc.setTextColor(156, 163, 175); // Gray for label
    doc.setFont('helvetica', 'normal');
    // Limit width of label
    const maxLabelW = colWidth * 0.4 - 5;
    doc.text(row.label, labelX, currentY + 3, { maxWidth: maxLabelW });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    const maxCurrentW = colWidth * 0.3 - 5;
    doc.text(row.currentValue, currentValX, currentY + 3, { maxWidth: maxCurrentW });
    
    doc.setTextColor(118, 185, 0); // Dell Green for optimized
    const maxOptW = colWidth * 0.3 - 5;
    doc.text(row.optimizedValue, optimizedValX, currentY + 3, { maxWidth: maxOptW });
    
    // A single row can take multiple lines if it wraps. Let's add standard height, or more if wrapping.
    // 9mm height comfortably fits 2 lines of 9pt text if wrapped
    currentY += 10;
  });

  currentY += 5;

  // --- KPI Badges Strip ---
  const badgeCols = 3;
  const badgeGap = 4;
  const badgeWidth = (colWidth - (badgeCols - 1) * badgeGap) / badgeCols;
  const badgeHeight = 18;

  data.kpiBadges.forEach((badge, idx) => {
    const r = Math.floor(idx / badgeCols);
    const c = idx % badgeCols;
    const badgeX = 15 + c * (badgeWidth + badgeGap);
    const badgeY = currentY + r * (badgeHeight + badgeGap);
    
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.setFillColor(255, 255, 255, 0.05);
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'FD');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    // Center the value horizontally and vertically slightly above middle
    doc.text(badge.value, badgeX + badgeWidth/2, badgeY + 8, { align: 'center' });

    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    // Center label below value
    doc.text(badge.label, badgeX + badgeWidth/2, badgeY + 13.5, { align: 'center', maxWidth: badgeWidth - 2 });
  });

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'End-to-end Architecture, Turnkey Deployment & 24/7 SLA Managed by Team Computers Enterprise Services',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Download the PDF
  doc.save(`Executive_Dossier_${data.industryTitle.replace(/\s+/g, '_')}.pdf`);
}
