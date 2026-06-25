import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function loadLogoBase64() {
  try {
    const r   = await fetch("/logo.png");
    const buf = await r.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return "data:image/png;base64," + b64;
  } catch { return null; }
}

export async function exportPDF({ title, sessionLabel, columns, rows, filename }) {
  const doc  = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await loadLogoBase64();

  const W = 297;
  doc.setFillColor(9, 9, 14);
  doc.rect(0, 0, W, 28, "F");

  if (logo) {
    try { doc.addImage(logo, "PNG", 8, 4, 20, 20); } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(238, 238, 245);
  doc.text("Leaderboard GT3", logo ? 32 : 12, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(106, 106, 128);
  doc.text(sessionLabel, logo ? 32 : 12, 21);

  const now = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  doc.setFontSize(8);
  doc.text(now, W - 10, 13, { align: "right" });
  doc.text("classement-ten.vercel.app", W - 10, 21, { align: "right" });

  autoTable(doc, {
    startY:    32,
    head:      [columns],
    body:      rows,
    margin:    { left: 8, right: 8 },
    styles:    { fontSize: 9, cellPadding: 3, textColor: [30, 30, 40] },
    headStyles: {
      fillColor: [196, 18, 48], textColor: [255, 255, 255],
      fontStyle: "bold", fontSize: 9,
    },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: { 0: { halign: "center" } },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text(`Page ${i} / ${pageCount}`, W / 2, 205, { align: "center" });
  }

  doc.save(filename);
}

export function usePDFExport() {
  const [exporting, setExporting] = useState(false);
  async function doExport(config) {
    setExporting(true);
    try { await exportPDF(config); }
    finally { setExporting(false); }
  }
  return [exporting, doExport];
}
