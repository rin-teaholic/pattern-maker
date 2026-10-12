import { useEffect, useRef } from "react";
import paper from "paper";
import { jsPDF } from "jspdf";
import "svg2pdf.js";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    paper.setup(canvasRef.current);
    
    // 1cmを 28.346px とする（画面表示用の基準）
    const cm = 28.346; 
    const width = 10 * cm;
    const height = 10 * cm;
    const seamAllowance = 0.5 * cm;

    const center = new paper.Point(width / 2 + 2 * cm, height / 2 + 2 * cm);

    // ★ 修正点1: 線の太さを極細（0.25）にする。
    // ※PDF化した際に約0.1mm以下の「細線」になり、中心＝線の実態になります。
    const hairline = 0.25;

    // ①できあがり線（実線）の四角形
    const baseRect = new paper.Path.Rectangle({
      point: [center.x - width / 2, center.y - height / 2],
      size: [width, height],
      strokeColor: new paper.Color("black"),
      strokeWidth: hairline, 
    });

    // ②縫い代線（点線）
    const seamRect = baseRect.clone() as paper.Path;
    seamRect.scale(
      (width + seamAllowance * 2) / width,
      (height + seamAllowance * 2) / height
    );
    seamRect.strokeColor = new paper.Color("red");
    seamRect.strokeWidth = hairline;
    // ★ 修正点2: 点線の間隔も細線に合わせて微調整
    seamRect.dashArray = [3, 3]; // 例: 3px引いて3px空ける

    paper.view?.update();
  }, []);

  const downloadPDF = async () => {
    const svgString = paper.project.exportSVG({ asString: true }) as string;
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(svgString, "image/svg+xml").documentElement;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const scaleFactor = 10 / 28.346; 
    const canvasWidth = paper.view.bounds.width;
    const canvasHeight = paper.view.bounds.height;

    await pdf.svg(svgElement, {
      x: 0,
      y: 0,
      width: canvasWidth * scaleFactor,
      height: canvasHeight * scaleFactor,
    });

    pdf.save("pattern-test-center.pdf");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>型紙メーカー（試作）</h1>
      <p>黒の実線ができあがり線(10cm)、赤の点線が縫い代(5mm)</p>
      
      <button
        onClick={downloadPDF}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#28a745", // ボタンの色を緑に変更（見分けやすく）
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "bold"
        }}
      >
        A4実寸PDFをダウンロード (細線版)
      </button>
      
      <br />

      <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          style={{ width: "600px", height: "600px", backgroundColor: "#fff" }}
        />
      </div>
    </div>
  );
}