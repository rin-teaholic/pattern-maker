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
  
  export type PatternType = "front" | "back" | "sleeve" | "pants";
  
  export type PatternData = {
    basePath: string;
    seamPath: string;
    bounds: {
      minX: number;
      minY: number;
      width: number;
      height: number;
    };
    labelText?: string;
    labelY?: number;
  };