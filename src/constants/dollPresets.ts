import type { DollSize } from "../types/doll";

export const DOLL_PRESETS: Record<string, DollSize> = {
  dollA: {
    name: "プライズぬい(約16cmサイズ)",
    length: 30,
    chestWidth: 100,
    neckW: 20,
    neckDFront: 0,
    neckDBack: 0,
    shoulderW: 20,
    armholeD: 18,
    sleeveLength: 39,
    cuffWidth: 18,
    crotchDepth: 15,
    inseam: 25,
    pantsHemWidth: 25,
  },
  dollB: {
    name: "いつぬい(約12cmサイズ)",
    length: 25,
    chestWidth: 115,
    neckW: 30,
    neckDFront: 0,
    neckDBack: 0,
    shoulderW: 20,
    armholeD: 30,
    sleeveLength: 35,
    cuffWidth: 26,
    crotchDepth: 15,
    inseam: 20,
    pantsHemWidth: 30,
  },
};