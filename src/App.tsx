import { useEffect, useRef } from "react";
import paper from "paper";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Paper.jsの初期化（キャンバスをセット）
    paper.setup(canvasRef.current);

    // 画面の中心を取得
    const center = paper.view.center;

    // --- ここから描画ロジック ---

    // 1cm を 37.8ピクセル（96dpiの場合）として計算
    const cm = 37.8;
    const width = 10 * cm;  // 10cm
    const height = 10 * cm; // 10cm
    const seamAllowance = 0.5 * cm; // 縫い代 5mm

    // ①できあがり線（実線）の四角形を作成
    const baseRect = new paper.Path.Rectangle({
      point: [center.x - width / 2, center.y - height / 2],
      size: [width, height],
      strokeColor: new paper.Color("black"),
      strokeWidth: 2,
    });

    // ②縫い代線（点線）を作成
    const seamRect = baseRect.clone() as paper.Path;
    seamRect.scale(
      (width + seamAllowance * 2) / width,
      (height + seamAllowance * 2) / height
    );
    seamRect.strokeColor = new paper.Color("red");
    seamRect.strokeWidth = 1;
    seamRect.dashArray = [5, 5]; // 5px引いて5px空ける点線

    // 描画を更新（update() を使用）
    paper.view?.update();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>型紙メーカー（試作）</h1>
      <p>黒の実線ができあがり線(10cm)、赤の点線が縫い代(5mm)</p>
      
      {/* 描画エリア */}
      <div style={{ border: "1px solid #ccc", display: "inline-block", marginTop: "10px" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          style={{ width: "600px", height: "600px", backgroundColor: "#fafafa" }}
        />
      </div>
    </div>
  );
}