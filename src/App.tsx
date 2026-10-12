import { useState, useRef } from "react";
import type { PatternType } from "./types/doll";
import { DOLL_PRESETS } from "./constants/dollPresets";
import { generatePatternData } from "./utils/patternGenerator";
import { exportPatternToPDF } from "./utils/pdfExporter";
import { PatternPreview } from "./components/PatternPreview";

export default function App() {
  const [selectedDollKey, setSelectedDollKey] = useState<string>("dollA");
  const [patternType, setPatternType] = useState<PatternType>("front");
  const svgRef = useRef<SVGSVGElement>(null);

  const size = DOLL_PRESETS[selectedDollKey];
  const patternData = generatePatternData(size, patternType);

  const handleDownloadPDF = async () => {
    if (!svgRef.current) return;
    await exportPatternToPDF(svgRef.current, `pattern-${selectedDollKey}-${patternType}.pdf`);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>型紙メーカー (複数パーツ対応)</h1>

      {/* コントロールエリア */}
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
        onClick={handleDownloadPDF}
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

      {/* プレビューコンポーネント */}
      <PatternPreview patternData={patternData} svgRef={svgRef} />
    </div>
  );
}