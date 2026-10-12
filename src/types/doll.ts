export type DollSize = {
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

export type PatternType = "front" | "back_left" | "back_right" | "sleeve" | "pants";

export type TextLabel = {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  rotate?: number;
  anchor?: "start" | "middle" | "end";
};

export type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type PatternData = {
  basePath: string;
  seamPath: string;
  bounds: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
  labels: TextLabel[];
  grainline?: LineSegment;     // 地の目線
  notches?: LineSegment[];     // 合印
  guideLines?: LineSegment[];  // ガイド線 (後中心基準線など)
  waPath?: string;             // わ裁断の記号 (二重の半円)
};