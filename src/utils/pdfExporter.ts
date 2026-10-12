import { jsPDF } from "jspdf";
import "svg2pdf.js";

export async function exportPatternToPDF(
  svgElement: SVGSVGElement,
  filename: string
): Promise<void> {
  const pdfSvg = svgElement.cloneNode(true) as SVGSVGElement;
  pdfSvg.setAttribute("width", "210mm");
  pdfSvg.setAttribute("height", "297mm");
  pdfSvg.setAttribute("viewBox", `-20 -20 210 297`);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  await pdf.svg(pdfSvg, {
    x: 0,
    y: 0,
    width: 210,
    height: 297,
  });

  pdf.save(filename);
}