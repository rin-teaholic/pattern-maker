import React from "react";
import type { RefObject } from "react";
import type { PatternData } from "../types/doll";

type Props = {
  patternData: PatternData;
  svgRef: RefObject<SVGSVGElement | null>;
};

export const PatternPreview: React.FC<Props> = ({ patternData, svgRef }) => {
  const { basePath, seamPath, bounds, labelText, labelY } = patternData;

  return (
    <div style={{ border: "1px solid #ccc", display: "inline-block", width: "100%", maxWidth: "500px", background: "#fff" }}>
      <svg
        ref={svgRef}
        width="100%"
        height="500px"
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        style={{ display: "block" }}
      >
        {/* できあがり線 */}
        <path d={basePath} fill="none" stroke="black" strokeWidth="0.25" />
        {/* 縫い代 */}
        <path d={seamPath} fill="none" stroke="red" strokeWidth="0.25" strokeDasharray="1, 1" />
        {/* 注記テキスト */}
        {labelText && labelY !== undefined && (
          <text
            x="-10"
            y={labelY}
            fontSize="3.5"
            fill="black"
            textAnchor="middle"
            transform={`rotate(-90 -10 ${labelY})`}
          >
            {labelText}
          </text>
        )}
      </svg>
    </div>
  );
};