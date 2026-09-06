/**
 * KARMİS SVG Chart Generator v2.5.0
 * Renders minimalist white-background uniform light blue horizontal SVG bar charts.
 * 260px height, non-truncated unclipped labels, strictly company metrics.
 */

function generateSvgChart(companyName, metrics = []) {
  const width = 680;
  const height = 260;
  const backgroundColor = '#ffffff';
  const barFill = '#bfdbfe';
  const barBorder = '#2563eb';

  // Format horizontal bars
  const startY = 72;
  const barHeight = 22;
  const gapY = 35;
  const labelX = 135;
  const barStartX = 145;
  const maxBarWidth = 360;

  let barsSvg = '';
  let gridSvg = '';

  const displayMetrics = metrics && metrics.length > 0 ? metrics.slice(0, 5) : [
    { label: "Kurumsal İstihdam", value: "1.000+ Çalışan", unit: "Operasyonel İş Gücü", heightRatio: 0.9 },
    { label: "Operasyon Coğrafyası", value: "10+ Lokasyon", unit: "Faaliyet Ağı & Tesisler", heightRatio: 0.85 },
    { label: "Kurumsal Portföy", value: "B2B / Kurumsal", unit: "Sektörel Müşteri Ağı", heightRatio: 0.95 },
    { label: "Yıllık Gelir Hacmi", value: "Kurumsal Ciro", unit: "Faaliyet Gelir Göstergesi", heightRatio: 0.8 }
  ];

  displayMetrics.forEach((m, idx) => {
    const y = startY + idx * gapY;
    const ratio = m.heightRatio || (0.95 - idx * 0.1);
    const barWidth = Math.max(80, Math.round(ratio * maxBarWidth));

    gridSvg += `<line x1='${barStartX}' y1='${y}' x2='${barStartX + maxBarWidth + 140}' y2='${y}' stroke='#f1f5f9' stroke-width='1'/>`;

    barsSvg += `
      <!-- Bar ${idx + 1}: ${m.label} -->
      <text x='${labelX}' y='${y + 15}' text-anchor='end' fill='#334155' font-size='11' font-weight='600'>${m.label}</text>
      <rect x='${barStartX}' y='${y}' width='${barWidth}' height='${barHeight}' rx='4' fill='${barFill}' stroke='${barBorder}' stroke-width='1.5'/>
      <text x='${barStartX + barWidth + 10}' y='${y + 15}' fill='#1e3a8a' font-size='11' font-weight='700'>${m.value}</text>
    `;
  });

  return `<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; margin: 0 auto;">
    <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
    
    <!-- Title -->
    <text x="${width / 2}" y="28" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="700" letter-spacing="0.5">${companyName.toUpperCase()} — OPERASYONEL ÖLÇEK METRİKLERİ</text>
    <text x="${width / 2}" y="46" text-anchor="middle" fill="#64748b" font-size="11">Ciro, İş Gücü, Tesis ve Yatırım Göstergeleri</text>

    <!-- Grid Lines -->
    ${gridSvg}

    <!-- Bars -->
    ${barsSvg}
  </svg>
</div>`;
}

module.exports = { generateSvgChart };
