import { useState, useRef } from "react";
import type { PatternType } from "./types/doll";
import { DOLL_PRESETS } from "./constants/dollPresets";
import { generatePatternData } from "./utils/patternGenerator";
import { exportFullPatternToPDF } from "./utils/pdfExporter";
import { PatternPreview } from "./components/PatternPreview";

export default function App() {
  const [selectedDollKey, setSelectedDollKey] = useState<string>("dollA");
  const [patternType, setPatternType] = useState<PatternType>("front");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const size = DOLL_PRESETS[selectedDollKey];
  const patternData = generatePatternData(size, patternType);
  
  const isTops = patternType !== "pants";

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await exportFullPatternToPDF(
        size, 
        isTops, 
        `pattern-${selectedDollKey}-${isTops ? "tops-all" : "pants"}.pdf`
      );
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDFの生成中にエラーが発生しました。");
    } finally {
      setIsDownloading(false);
    }
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
          <label style={{ fontWeight: "bold", marginRight: "5px" }}>パーツ(プレビュー用):</label>
          <select
            value={patternType}
            onChange={(e) => setPatternType(e.target.value as PatternType)}
            style={{ padding: "8px", fontSize: "15px" }}
          >
            <option value="front">前身頃 (トップス)</option>
            <option value="back_left">後身頃・左 (持ち出しあり)</option>
            <option value="back_right">後身頃・右 (持ち出しなし)</option>
            <option value="sleeve">袖 (トップス)</option>
            <option value="pants">パンツ (ボトムス)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: isDownloading ? "#6c757d" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isDownloading ? "not-allowed" : "pointer",
          marginBottom: "15px",
          fontWeight: "bold",
          transition: "background-color 0.3s"
        }}
      >
        {isDownloading 
          ? "PDF生成中..." 
          : isTops ? "トップスの全パーツ(A4)をダウンロード" : "パンツの型紙(A4)をダウンロード"}
      </button>

      <br />
      <PatternPreview patternData={patternData} svgRef={svgRef} />
    </div>
  );
}