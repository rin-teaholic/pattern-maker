import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import "svg2pdf.js";

// 1. ぬいぐるみの寸法データ定義 (単位: mm)
type DollSize = {
  name: string;
  length: number;      // 着丈
  chestWidth: number;  // 胴囲一周
  neckW: number;       // 衿幅 (半身)
  neckDFront: number;  // 前衿下がり
  neckDBack: number;   // 後衿下がり
  shoulderW: number;   // 肩幅 (半身)
  armholeD: number;    // 袖ぐり下がり (深さ)
  sleeveLength: number;// 袖丈
  cuffWidth: number;   // 袖口幅 (半身)
  crotchDepth: number; // 股上
  inseam: number;      // 股下
  pantsHemWidth: number;// パンツ裾幅 (半身)
};

const DOLL_PRESETS: Record<string, DollSize> = {
  dollA: {
    name: "プライズぬい(約16cmサイズ)",
    length: 30,
    chestWidth: 95,
    neckW: 15,
    neckDFront: 5,
    neckDBack: 2,
    shoulderW: 20,
    armholeD: 35,
    sleeveLength: 20,
    cuffWidth: 25,
    crotchDepth: 25,
    inseam: 15,
    pantsHemWidth: 25,
  },
  dollB: {
    name: "いつぬい(約12cmサイズ)",
    length: 25,
    chestWidth: 115,
    neckW: 20,
    neckDFront: 5,
    neckDBack: 2,
    shoulderW: 20,
    armholeD: 55,
    sleeveLength: 15,
    cuffWidth: 30,
    crotchDepth: 20,
    inseam: 10,
    pantsHemWidth: 30,
  },
};

type PatternType = "front" | "back" | "sleeve" | "pants";

export default function App() {
  const [selectedDollKey, setSelectedDollKey] = useState<string>("dollA");
  const [patternType, setPatternType] = useState<PatternType>("front");
  const svgRef = useRef<SVGSVGElement>(null);

  const size = DOLL_PRESETS[selectedDollKey];
  const sa = 5; // 縫い代 5mm
  const halfChest = size.chestWidth / 4 + 2;

  // --- 純粋な幾何学データ（SVGパス）の動的計算 (全て mm 単位) ---
  let basePath = "";
  let seamPath = "";
  let textElement = null;
  let bounds = { minX: -20, minY: -20, width: 100, height: 100 };

  if (patternType === "front" || patternType === "back") {
    const neckD = patternType === "front" ? size.neckDFront : size.neckDBack;

    basePath = `
      M 0 ${size.length}
      L 0 ${neckD}
      C ${size.neckW * 0.5} ${neckD}, ${size.neckW} ${neckD * 0.3}, ${size.neckW} 0
      L ${size.shoulderW} 5
      C ${size.shoulderW + 2} ${size.armholeD * 0.5}, ${halfChest - 2} ${size.armholeD * 0.8}, ${halfChest} ${size.armholeD}
      L ${halfChest} ${size.length}
      Z
    `;

    seamPath = `
      M 0 ${size.length + sa}
      L 0 ${neckD - sa}
      C ${size.neckW * 0.5} ${neckD - sa}, ${size.neckW} ${-sa}, ${size.neckW} ${-sa}
      L ${size.shoulderW + 3} ${5 - 3}
      C ${size.shoulderW + 5} ${size.armholeD * 0.5}, ${halfChest + 3} ${size.armholeD * 0.8}, ${halfChest + sa} ${size.armholeD}
      L ${halfChest + sa} ${size.length + sa}
      L 0 ${size.length + sa}
    `;

    textElement = (
      <text
        x="-10"
        y={size.length / 2}
        fontSize="3.5"
        fill="black"
        textAnchor="middle"
        transform={`rotate(-90 -10 ${size.length / 2})`}
      >
        ← わ ({patternType === "front" ? "前中心" : "後中心"})
      </text>
    );

    bounds = {
      minX: -25,
      minY: -sa - 5,
      width: halfChest + sa + 35,
      height: size.length + sa + 15,
    };
  } else if (patternType === "sleeve") {
    const sleeveW = size.armholeD * 0.8;
    const sLen = size.sleeveLength;
    const cuff = size.cuffWidth;

    basePath = `
      M 0 0
      C ${sleeveW * 0.5} 0, ${sleeveW} ${size.armholeD * 0.2}, ${sleeveW} ${size.armholeD * 0.5}
      L ${cuff / 2} ${sLen}
      L ${-cuff / 2} ${sLen}
      L ${-sleeveW} ${size.armholeD * 0.5}
      C ${-sleeveW} ${size.armholeD * 0.2}, ${-sleeveW * 0.5} 0, 0 0
      Z
    `;

    seamPath = `
      M 0 ${-sa}
      C ${sleeveW * 0.5 + 3} ${-sa}, ${sleeveW + sa} ${size.armholeD * 0.2}, ${sleeveW + sa} ${size.armholeD * 0.5}
      L ${cuff / 2 + sa} ${sLen + sa}
      L ${-cuff / 2 - sa} ${sLen + sa}
      L ${-sleeveW - sa} ${size.armholeD * 0.5}
      C ${-sleeveW - sa} ${size.armholeD * 0.2}, ${-sleeveW * 0.5 - 3} ${-sa}, 0 ${-sa}
      Z
    `;

    const maxW = Math.max(sleeveW, cuff / 2) + sa + 10;
    bounds = {
      minX: -maxW,
      minY: -sa - 5,
      width: maxW * 2,
      height: sLen + sa + 15,
    };
  } else if (patternType === "pants") {
    const waist = size.chestWidth / 4;
    const crotch = size.crotchDepth;
    const totalLen = size.crotchDepth + size.inseam;
    const hem = size.pantsHemWidth;

    basePath = `
      M 0 0
      L ${waist} 0
      L ${waist + 5} ${crotch}
      L ${hem} ${totalLen}
      L ${-hem + waist} ${totalLen}
      Q 0 ${crotch}, 0 0
      Z
    `;

    seamPath = `
      M 0 ${-sa}
      L ${waist + sa} ${-sa}
      L ${waist + 5 + sa} ${crotch}
      L ${hem + sa} ${totalLen + sa}
      L ${-hem + waist - sa} ${totalLen + sa}
      Q ${-sa} ${crotch}, 0 ${-sa}
      Z
    `;

    const minXVal = Math.min(-hem + waist, -sa) - 10;
    const maxXVal = Math.max(waist + 5 + sa, hem + sa) + 10;
    bounds = {
      minX: minXVal,
      minY: -sa - 5,
      width: maxXVal - minXVal,
      height: totalLen + sa + 15,
    };
  }

  // --- 実寸A4 PDFの生成処理 ---
  const downloadPDF = async () => {
    if (!svgRef.current) return;

    // A4の実寸(210mm x 297mm)設定を持つ一時SVGクローンを生成
    const pdfSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
    pdfSvg.setAttribute("width", "210mm");
    pdfSvg.setAttribute("height", "297mm");
    // 左上余白 20mm の位置に型紙の原点(0,0)が配置されるよう viewBox を指定
    pdfSvg.setAttribute("viewBox", `-20 -20 210 297`);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    await pdf.svg(pdfSvg, {
      x: 0,
      y: 0,
      width: 210,
      height: 297,
    });

    pdf.save(`pattern-${selectedDollKey}-${patternType}.pdf`);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>型紙メーカー (複数パーツ対応)</h1>

      <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontWeight: "bold", marginRight: "5px" }}>サイズ:</label>
          <select
            value={selectedDollKey}
            onChange={(e) => setSelectedDollKey(e.target.value)}
            style={{ padding: "8px", fontSize: "15px" }}
          >
            {Object.entries(DOLL_PRESETS).map(([key, doll]) => (
              <option key={key} value={key}>{doll.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "bold", marginRight: "5px" }}>パーツ:</label>
          <select
            value={patternType}
            onChange={(e) => setPatternType(e.target.value as PatternType)}
            style={{ padding: "8px", fontSize: "15px" }}
          >
            <option value="front">前身頃 (トップス)</option>
            <option value="back">後身頃 (トップス)</option>
            <option value="sleeve">袖 (トップス)</option>
            <option value="pants">パンツ (ボトムス)</option>
          </select>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "bold"
        }}
      >
        A4実寸PDFをダウンロード
      </button>

      <br />

      {/* 🔴 Reactで直接描写するSVGプレビュー枠 */}
      <div style={{ border: "1px solid #ccc", display: "inline-block", width: "100%", maxWidth: "500px", background: "#fff" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="500px"
          // viewBox によりどんなパーツも自動的にプレビュー中央にピッタリ拡大・縮小配置される
          viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
          style={{ display: "block" }}
        >
          {/* できあがり線 (実線) */}
          <path d={basePath} fill="none" stroke="black" strokeWidth="0.25" />
          {/* 縫い代 (点線) */}
          <path d={seamPath} fill="none" stroke="red" strokeWidth="0.25" strokeDasharray="1, 1" />
          {/* 注記テキスト */}
          {textElement}
        </svg>
      </div>
    </div>
  );
}