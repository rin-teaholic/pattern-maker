import React from "react";
import type { RefObject } from "react";
import type { PatternData } from "../types/doll";

type Props = {
  patternData: PatternData;
  svgRef: RefObject<SVGSVGElement | null>;
};

export const PatternPreview: React.FC<Props> = ({ patternData, svgRef }) => {
  const { basePath, seamPath, bounds, labels, grainline, notches, guideLines, waPath } = patternData;

  return (
    <div style={{ border: "1px solid #ccc", display: "inline-block", width: "100%", maxWidth: "500px", background: "#fff" }}>
      <svg
        ref={svgRef}
        width="100%"
        height="500px"
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        style={{ display: "block" }}
      >
        <defs>
          <marker id="arrow-start" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M 6 0 L 0 3 L 6 6 Z" fill="black" />
          </marker>
          <marker id="arrow-end" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="black" />
          </marker>
        </defs>

        {/* ガイド線 (グレー点線) */}
        {guideLines?.map((line, idx) => (
          <line key={idx} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="gray" strokeWidth="0.2" strokeDasharray="1, 1" />
        ))}

        {/* 🔴 わ裁断の記号 (◎の半分 / 二重半円) */}
        {waPath && (
          <path d={waPath} fill="none" stroke="black" strokeWidth="0.25" />
        )}

        {/* できあがり線 */}
        <path d={basePath} fill="none" stroke="black" strokeWidth="0.25" />

        {/* 縫い代線 */}
        <path d={seamPath} fill="none" stroke="red" strokeWidth="0.25" strokeDasharray="1, 1" />

        {/* 地の目線 */}
        {grainline && (
          <line
            x1={grainline.x1}
            y1={grainline.y1}
            x2={grainline.x2}
            y2={grainline.y2}
            stroke="blue"
            strokeWidth="0.2"
            markerStart="url(#arrow-start)"
            markerEnd="url(#arrow-end)"
          />
        )}

        {/* 合印 / ノッチ */}
        {notches?.map((notch, idx) => (
          <line key={idx} x1={notch.x1} y1={notch.y1} x2={notch.x2} y2={notch.y2} stroke="blue" strokeWidth="0.25" />
        ))}

        {/* テキストラベル */}
        {labels.map((lbl, idx) => (
          <text
            key={idx}
            x={lbl.x}
            y={lbl.y}
            fontSize={lbl.fontSize || 3}
            fill="black"
            textAnchor={lbl.anchor || "middle"}
            transform={lbl.rotate ? `rotate(${lbl.rotate} ${lbl.x} ${lbl.y})` : undefined}
          >
            {lbl.text}
          </text>
        ))}
      </svg>
    </div>
  );
};