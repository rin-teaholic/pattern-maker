import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { DollSize, PatternData } from "../types/doll";
import { generatePatternData } from "./patternGenerator";

function createSvgElement(svgString: string): SVGSVGElement {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = svgString.trim();
  return wrapper.firstChild as SVGSVGElement;
}

type PlacedPattern = {
  pattern: PatternData;
  x: number;
  y: number;
};

export async function exportFullPatternToPDF(
  size: DollSize,
  isTops: boolean,
  filename: string
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pages: PlacedPattern[][] = [];

  // 🔴 ページ全体の左基準線 (14mm)
  const leftMargin = 14;

  if (isTops) {
    const front = generatePatternData(size, "front");
    const backLeft = generatePatternData(size, "back_left");
    const backRight = generatePatternData(size, "back_right");
    const sleeve1 = generatePatternData(size, "sleeve");
    const sleeve2 = generatePatternData(size, "sleeve");

    const page1Placed: PlacedPattern[] = [];

    // --- 1段目（身頃3種）の配置 ---
    const row1Y = 42;
    let currentX = leftMargin;
    let maxRow1Height = 0;

    const row1Patterns = [front, backLeft, backRight];
    for (const p of row1Patterns) {
      const x = currentX - p.bounds.minX;
      const y = row1Y - p.bounds.minY;
      page1Placed.push({ pattern: p, x, y });
      currentX += p.bounds.width + 6;
      maxRow1Height = Math.max(maxRow1Height, p.bounds.height);
    }

    // --- 2段目（袖2種）の配置 ---
    const row2Y = row1Y + maxRow1Height + 15;
    currentX = leftMargin; // 🔴 1段目と同じ14mmから揃えて開始

    const row2Patterns = [sleeve1, sleeve2];
    for (const p of row2Patterns) {
      const x = currentX - p.bounds.minX;
      const y = row2Y - p.bounds.minY;
      page1Placed.push({ pattern: p, x, y });
      currentX += p.bounds.width + 10;
    }

    pages.push(page1Placed);

  } else {
    const pants1 = generatePatternData(size, "pants");
    const pants2 = generatePatternData(size, "pants");

    const rowY = 45;
    let currentX = leftMargin;
    const page1Placed: PlacedPattern[] = [];

    for (const p of [pants1, pants2]) {
      const x = currentX - p.bounds.minX;
      const y = rowY - p.bounds.minY;
      page1Placed.push({ pattern: p, x, y });
      currentX += p.bounds.width + 12;
    }

    pages.push(page1Placed);
  }

  const cleanSizeName = size.name.replace(/\s+/g, "");
  const titleText = `型紙：${cleanSizeName}-${isTops ? "トップス全パーツ" : "パンツ"}`;

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const pagePatterns = pages[i];
    const isFirstPage = i === 0;

    const scaleY = isFirstPage ? 25 : 15;
    const titleY = isFirstPage ? 15 : 0;

    const mmToPx = 3.779527;
    const containerWidthPx = 210 * mmToPx;
    const containerHeightPx = 297 * mmToPx;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = `${containerWidthPx}px`;
    container.style.height = `${containerHeightPx}px`;
    container.style.backgroundColor = "#ffffff";
    container.style.fontFamily = "sans-serif";

    const svgString = `
      <svg width="100%" height="100%" viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-start" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M 6 0 L 0 3 L 6 6 Z" fill="black" />
          </marker>
          <marker id="arrow-end" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="black" />
          </marker>
        </defs>
        
        ${isFirstPage ? `<text x="105" y="${titleY}" font-size="6" font-weight="bold" text-anchor="middle">${titleText}</text>` : ""}
        
        <g>
          <line x1="15" y1="${scaleY}" x2="65" y2="${scaleY}" stroke="black" stroke-width="0.5" />
          ${[0,1,2,3,4,5].map(cm => `<line x1="${15+cm*10}" y1="${scaleY - 2}" x2="${15+cm*10}" y2="${scaleY + 2}" stroke="black" stroke-width="0.3" />`).join("")}
          <text x="40" y="${scaleY - 4}" font-size="3" text-anchor="middle">スケール確認用 (5cm)</text>
          <text x="195" y="${scaleY}" font-size="3.5" text-anchor="end" fill="red">※赤点線は縫い代(5mm)です。実線ができあがり線です。</text>
        </g>

        ${pagePatterns.map(({ pattern, x, y }) => `
          <svg x="${x}" y="${y}" overflow="visible">
            ${pattern.guideLines ? pattern.guideLines.map(line => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="gray" stroke-width="0.2" stroke-dasharray="1 1" />`).join("") : ""}
            ${pattern.waPath ? `<path d="${pattern.waPath}" fill="none" stroke="black" stroke-width="0.25" />` : ""}
            ${pattern.basePath ? `<path d="${pattern.basePath}" fill="none" stroke="black" stroke-width="0.25" />` : ""}
            ${pattern.seamPath ? `<path d="${pattern.seamPath}" fill="none" stroke="red" stroke-width="0.25" stroke-dasharray="1 1" />` : ""}
            ${pattern.grainline ? `<line x1="${pattern.grainline.x1}" y1="${pattern.grainline.y1}" x2="${pattern.grainline.x2}" y2="${pattern.grainline.y2}" stroke="blue" stroke-width="0.2" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />` : ""}
            ${pattern.notches ? pattern.notches.map(notch => `<line x1="${notch.x1}" y1="${notch.y1}" x2="${notch.x2}" y2="${notch.y2}" stroke="blue" stroke-width="0.25" />`).join("") : ""}
            ${pattern.labels.map(lbl => `<text x="${lbl.x}" y="${lbl.y}" font-size="${lbl.fontSize || 3}" fill="black" text-anchor="${lbl.anchor || "middle"}" ${lbl.rotate ? `transform="rotate(${lbl.rotate} ${lbl.x}${lbl.y})"` : ""}>${lbl.text}</text>`).join("")}
          </svg>
        `).join("")}
      </svg>
    `;

    const svgElement = createSvgElement(svgString);
    container.appendChild(svgElement);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    } catch (e) {
      console.error("html2canvas生成エラー", e);
    } finally {
      document.body.removeChild(container);
    }
  }

  pdf.save(filename);
}