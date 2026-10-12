import type { DollSize, PatternType, PatternData, TextLabel, LineSegment } from "../types/doll";

const clean = (pathStr: string): string => pathStr.replace(/\s+/g, " ").trim();

export function generatePatternData(size: DollSize, patternType: PatternType): PatternData {
  const sa = 5; // 縫い代 5mm
  const halfChest = size.chestWidth / 4 + 2;

  let basePath = "";
  let seamPath = "";
  let bounds = { minX: 0, minY: 0, width: 100, height: 100 };
  const labels: TextLabel[] = [];
  const notches: LineSegment[] = [];
  const guideLines: LineSegment[] = [];
  let grainline: LineSegment | undefined;
  let waPath: string | undefined;

  // ==========================================
  // 前身頃 / 後身頃 (左・右)
  // ==========================================
  if (patternType === "front" || patternType === "back_left" || patternType === "back_right") {
    const isFront = patternType === "front";
    const neckD = isFront ? size.neckDFront : size.neckDBack;
    const overlap = patternType === "back_left" ? 5 : 0;

    basePath = clean(`
      M ${-overlap} ${size.length}
      L ${-overlap} ${neckD}
      C ${size.neckW * 0.5} ${neckD}, ${size.neckW} ${neckD * 0.3}, ${size.neckW} 0
      L ${size.shoulderW} 5
      C ${size.shoulderW + 2} ${size.armholeD * 0.5}, ${halfChest - 2} ${size.armholeD * 0.8}, ${halfChest} ${size.armholeD}
      L ${halfChest} ${size.length}
      Z
    `);

    seamPath = clean(`
      M ${-overlap - (isFront ? 0 : sa)} ${size.length + sa}
      L ${-overlap - (isFront ? 0 : sa)} ${neckD - sa}
      C ${size.neckW * 0.5} ${neckD - sa}, ${size.neckW} ${-sa}, ${size.neckW} ${-sa}
      L ${size.shoulderW + 3} ${5 - 3}
      C ${size.shoulderW + 5} ${size.armholeD * 0.5}, ${halfChest + 3} ${size.armholeD * 0.8}, ${halfChest + sa} ${size.armholeD}
      L ${halfChest + sa} ${size.length + sa}
      L ${-overlap - (isFront ? 0 : sa)} ${size.length + sa}
      Z
    `);

    let partName = "前身頃";
    let countText = "× 1枚 (わ裁断)";
    if (patternType === "back_left") {
      partName = "後身頃 (左)";
      countText = "× 1枚 (持ち出しあり)";
    } else if (patternType === "back_right") {
      partName = "後身頃 (右)";
      countText = "× 1枚 (持ち出しなし)";
    }

    // 🔴 中央テキストを少し右寄りにして「わ」テキストとの被りを防止
    const textCenterX = isFront ? halfChest * 0.58 : (halfChest - overlap) / 2;

    labels.push(
      { text: partName, x: textCenterX, y: size.length / 2 - 3, fontSize: 3.2, anchor: "middle" },
      { text: countText, x: textCenterX, y: size.length / 2 + 1, fontSize: 2.2, anchor: "middle" },
      { text: "※周囲 縫い代5mm", x: textCenterX, y: size.length / 2 + 4.5, fontSize: 1.8, anchor: "middle" }
    );

    if (isFront) {
      const centerY = (neckD + size.length) / 2;
      waPath = clean(`
        M 0 ${centerY - 3} A 3 3 0 0 1 0 ${centerY + 3}
        M 0 ${centerY - 1.8} A 1.8 1.8 0 0 1 0 ${centerY + 1.8}
      `);
      // 🔴 「わ」テキストをコンパクトにして被りを解消
      labels.push({ text: "わ (前中心)", x: 3.5, y: centerY, fontSize: 2.0, rotate: 90, anchor: "middle" });
      
      notches.push(
        { x1: 0, y1: neckD, x2: 0, y2: neckD - sa },
        { x1: 0, y1: size.length, x2: 0, y2: size.length + sa }
      );
    } else {
      guideLines.push({ x1: 0, y1: neckD, x2: 0, y2: size.length });
      labels.push({ text: "後中心", x: 2, y: (size.length + neckD) / 2, fontSize: 2.2, rotate: -90, anchor: "middle" });
      if (patternType === "back_left") {
        labels.push({ text: "持ち出し 5mm", x: -overlap / 2, y: (size.length + neckD) / 2, fontSize: 2.0, rotate: -90, anchor: "middle" });
      }
    }

    grainline = {
      x1: halfChest * 0.8,
      y1: 10,
      x2: halfChest * 0.8,
      y2: size.length - 5,
    };

    // 🔴 赤点線（縫い代）の最外郭にピッタリ合わせた境界定義
    const minXVal = isFront ? 0 : (patternType === "back_left" ? -overlap - sa : -sa);
    const maxXVal = halfChest + sa;

    bounds = {
      minX: minXVal,
      minY: -sa,
      width: maxXVal - minXVal,
      height: size.length + sa * 2,
    };

  } 
  // ==========================================
  // 袖 (Sleeve)
  // ==========================================
  else if (patternType === "sleeve") {
    const sleeveW = size.armholeD * 0.8;
    const sLen = size.sleeveLength;
    const cuff = size.cuffWidth;

    basePath = clean(`
      M 0 0
      C ${sleeveW * 0.5} 0, ${sleeveW} ${size.armholeD * 0.2}, ${sleeveW} ${size.armholeD * 0.5}
      L ${cuff / 2} ${sLen}
      L ${-cuff / 2} ${sLen}
      L ${-sleeveW} ${size.armholeD * 0.5}
      C ${-sleeveW} ${size.armholeD * 0.2}, ${-sleeveW * 0.5} 0, 0 0
      Z
    `);

    seamPath = clean(`
      M 0 ${-sa}
      C ${sleeveW * 0.5 + 3} ${-sa}, ${sleeveW + sa} ${size.armholeD * 0.2}, ${sleeveW + sa} ${size.armholeD * 0.5}
      L ${cuff / 2 + sa} ${sLen + sa}
      L ${-cuff / 2 - sa} ${sLen + sa}
      L ${-sleeveW - sa} ${size.armholeD * 0.5}
      C ${-sleeveW - sa} ${size.armholeD * 0.2}, ${-sleeveW * 0.5 - 3} ${-sa}, 0 ${-sa}
      Z
    `);

    labels.push(
      { text: "袖", x: 0, y: sLen / 2 - 3, fontSize: 3.2, anchor: "middle" },
      { text: "× 2枚 (左右対称)", x: 0, y: sLen / 2 + 1, fontSize: 2.2, anchor: "middle" },
      { text: "※周囲 縫い代5mm", x: 0, y: sLen / 2 + 4.5, fontSize: 1.8, anchor: "middle" },
      { text: "肩線へ", x: 4, y: -2, fontSize: 2, anchor: "start" }
    );

    grainline = { x1: sleeveW * 0.4, y1: size.armholeD * 0.2, x2: sleeveW * 0.4, y2: sLen - 3 };
    notches.push({ x1: 0, y1: 0, x2: 0, y2: -sa });

    const maxHalfW = Math.max(sleeveW, cuff / 2);
    const minXVal = -maxHalfW - sa;
    const maxXVal = maxHalfW + sa;

    bounds = {
      minX: minXVal,
      minY: -sa,
      width: maxXVal - minXVal,
      height: sLen + sa * 2,
    };

  } 
  // ==========================================
  // パンツ (Pants)
  // ==========================================
  else if (patternType === "pants") {
    const waist = size.chestWidth / 4;
    const crotch = size.crotchDepth;
    const totalLen = size.crotchDepth + size.inseam;
    const hem = size.pantsHemWidth;

    basePath = clean(`
      M 0 0
      L ${waist} 0
      L ${waist + 5} ${crotch}
      L ${hem} ${totalLen}
      L ${-hem + waist} ${totalLen}
      Q 0 ${crotch}, 0 0
      Z
    `);

    seamPath = clean(`
      M 0 ${-sa}
      L ${waist + sa} ${-sa}
      L ${waist + 5 + sa} ${crotch}
      L ${hem + sa} ${totalLen + sa}
      L ${-hem + waist - sa} ${totalLen + sa}
      Q ${-sa} ${crotch}, 0 ${-sa}
      Z
    `);

    labels.push(
      { text: "パンツ", x: waist / 2, y: totalLen / 2 - 4, fontSize: 3.2, anchor: "middle" },
      { text: "× 2枚 (左右対称)", x: waist / 2, y: totalLen / 2, fontSize: 2.2, anchor: "middle" },
      { text: "(前後同型)", x: waist / 2, y: totalLen / 2 + 3, fontSize: 2, anchor: "middle" },
      { text: "※周囲 縫い代5mm", x: waist / 2, y: totalLen / 2 + 6, fontSize: 1.8, anchor: "middle" }
    );

    grainline = { x1: waist / 2, y1: 8, x2: waist / 2, y2: totalLen - 5 };
    notches.push({ x1: 0, y1: 0, x2: 0, y2: -sa });

    const minXVal = Math.min(-hem + waist, 0) - sa;
    const maxXVal = Math.max(waist + 5, hem) + sa;

    bounds = {
      minX: minXVal,
      minY: -sa,
      width: maxXVal - minXVal,
      height: totalLen + sa * 2,
    };
  }

  return { basePath, seamPath, bounds, labels, grainline, notches, guideLines, waPath };
}