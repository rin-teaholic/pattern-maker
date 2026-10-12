import type { DollSize, PatternType, PatternData } from "../types/doll";

export function generatePatternData(size: DollSize, patternType: PatternType): PatternData {
  const sa = 5; // 縫い代 5mm
  const halfChest = size.chestWidth / 4 + 2;

  let basePath = "";
  let seamPath = "";
  let labelText: string | undefined;
  let labelY: number | undefined;
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

    labelText = `← わ (${patternType === "front" ? "前中心" : "後中心"})`;
    labelY = size.length / 2;

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

  return { basePath, seamPath, bounds, labelText, labelY };
}