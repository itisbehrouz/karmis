/**
 * KariyerMimari SVG Chart Generator
 * Renders minimalist white-background uniform light blue SVG bar charts.
 */

function generateSvgChart(companyName, metrics) {
  // metrics: [{ label: 'Global Ciro', value: '45 Milyar USD', unit: 'USD / Yıllık', heightRatio: 0.8 }]
  const width = 800;
  const height = 420;
  const backgroundColor = '#ffffff';
  const barFill = '#bfdbfe';
  const barBorder = '#2563eb';

  let barsSvg = '';
  const barWidth = 80;
  const startX = 130;
  const gap = 140;

  metrics.forEach((metric, index) => {
    const x = startX + index * gap;
    const barHeight = Math.max(10, Math.min(260, metric.heightRatio * 260));
    const y = 355 - barHeight;

    barsSvg += `
      <!-- Bar ${index + 1}: ${metric.label} -->
      <rect x='${x}' y='${y}' width='${barWidth}' height='${barHeight}' rx='8' fill='${barFill}' stroke='${barBorder}' stroke-width='2'/>
      <text x='${x + barWidth / 2}' y='${y - 12}' fill='#1e40af' font-size='13' font-weight='700' text-anchor='middle'>${metric.value}</text>
      <text x='${x + barWidth / 2}' y='378' fill='#1e293b' font-size='12' font-weight='600' text-anchor='middle'>${metric.label}</text>
      <text x='${x + barWidth / 2}' y='394' fill='#64748b' font-size='11' text-anchor='middle'>(${metric.unit})</text>
    `;
  });

  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}' height='${height}' style='background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'>
  <!-- Title -->
  <text x='400' y='38' fill='#0f172a' font-size='19' font-weight='700' text-anchor='middle'>${companyName} Operasyonel &amp; Finansal Rakamlar</text>
  <text x='400' y='60' fill='#64748b' font-size='13' text-anchor='middle'>Ciro, İş Gücü, Tesis ve Yatırım Göstergeleri</text>
  
  <!-- Grid Lines -->
  <line x1='90' y1='95' x2='740' y2='95' stroke='#f1f5f9' stroke-width='1.5'/>
  <line x1='90' y1='165' x2='740' y2='165' stroke='#f1f5f9' stroke-width='1.5'/>
  <line x1='90' y1='235' x2='740' y2='235' stroke='#f1f5f9' stroke-width='1.5'/>
  <line x1='90' y1='305' x2='740' y2='305' stroke='#f1f5f9' stroke-width='1.5'/>
  <line x1='90' y1='355' x2='740' y2='355' stroke='#cbd5e1' stroke-width='2'/>
  
  ${barsSvg}
</svg>`;
}

module.exports = { generateSvgChart };
