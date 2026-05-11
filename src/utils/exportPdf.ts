import jsPDF from 'jspdf';

interface PdfImage {
  secureUrl: string;
}

interface Step {
  orderIndex: number;
  description: string;
  command?: string | null;
  commandOutput?: string | null;
  images: PdfImage[];
}

interface WriteupData {
  title: string;
  ctfName: string;
  category: string;
  difficulty: string;
  flag?: string | null;
  description?: string | null;
  steps: Step[];
}

const DIFF_COLOR: Record<string, [number, number, number]> = {
  EASY: [34, 197, 94],
  MEDIUM: [251, 191, 36],
  HARD: [251, 146, 60],
  INSANE: [248, 113, 113],
};

const CAT_ICON: Record<string, string> = {
  WEB: '[WEB]',
  PWN: '[PWN]',
  CRYPTO: '[CRYPTO]',
  FORENSICS: '[FOR]',
  MISC: '[MISC]',
  REV: '[REV]',
  OSINT: '[OSINT]',
};

export async function generatePdf(writeup: WriteupData, username: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210; // page width mm
  const H = 297; // page height mm
  const ML = 20; // margin left
  const MR = 20; // margin right
  const CW = W - ML - MR; // content width
  const MT = 16; // margin top
  const MB = 16; // margin bottom

  let y = MT;

  const diffColor = DIFF_COLOR[writeup.difficulty] ?? [34, 197, 94];
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function checkPage(needed = 10) {
    if (y + needed > H - MB) {
      pdf.addPage();
      pdf.setFillColor(17, 17, 17);
      pdf.rect(0, 0, W, H, 'F');
      y = MT;
    }
  }

  function gap(mm: number) {
    y += mm;
  }

  function hline(color: [number, number, number] = [38, 38, 38]) {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.2);
    pdf.line(ML, y, W - MR, y);
    gap(4);
  }

  function badge(label: string, x: number, rgb: [number, number, number]) {
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');

    const tw = pdf.getTextWidth(label);
    const bw = tw + 6;
    const bh = 5;

    pdf.setDrawColor(...rgb);
    pdf.setFillColor(rgb[0] * 0.15, rgb[1] * 0.15, rgb[2] * 0.15);
    pdf.roundedRect(x, y - 3.5, bw, bh, 1, 1, 'FD');

    pdf.setTextColor(...rgb);
    pdf.text(label, x + 3, y);

    return bw + 3;
  }

  function sectionHeading(title: string) {
    checkPage(14);
    gap(2);

    pdf.setFillColor(...diffColor);
    pdf.rect(ML, y - 3, 2.5, 8, 'F');

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text(title.toUpperCase(), ML + 5, y + 2);

    y += 8;
    hline();
  }

  function codeBlock(label: string, content: string, rgb: [number, number, number]) {
    checkPage(20);

    const lines = pdf.splitTextToSize(content, CW - 8);
    const bh = lines.length * 4.2 + 14;

    checkPage(bh);

    // Container
    pdf.setFillColor(20, 20, 20);
    pdf.setDrawColor(38, 38, 38);
    pdf.roundedRect(ML, y, CW, bh, 2, 2, 'FD');

    // Header bar
    pdf.setFillColor(30, 30, 30);
    pdf.roundedRect(ML, y, CW, 8, 2, 2, 'F');
    pdf.rect(ML, y + 4, CW, 4, 'F');

    // Traffic lights
    pdf.setFillColor(255, 95, 87);
    pdf.circle(ML + 5, y + 4, 1.2, 'F');
    pdf.setFillColor(254, 188, 46);
    pdf.circle(ML + 10, y + 4, 1.2, 'F');
    pdf.setFillColor(40, 200, 64);
    pdf.circle(ML + 15, y + 4, 1.2, 'F');

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, ML + 20, y + 5.5);

    // Code content
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...rgb);

    let cy = y + 12;
    lines.forEach((line: string) => {
      pdf.text(line, ML + 4, cy);
      cy += 4.2;
    });

    y += bh + 4;
  }

  // ── COVER PAGE ───────────────────────────────────────────

  pdf.setFillColor(11, 17, 27);
  pdf.rect(0, 0, W, H, 'F');

  pdf.setFillColor(...diffColor);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
  pdf.rect(0, 0, W, 80, 'F');
  pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

  y = 24;

  pdf.setFillColor(...diffColor);
  pdf.roundedRect(ML, y, 8, 8, 2, 2, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(11, 17, 27);
  pdf.text('CTF', ML + 1.2, y + 5.5);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(148, 163, 184);
  pdf.text('PWNSCRIBE', ML + 12, y + 5.5);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(date, W - MR - pdf.getTextWidth(date), y + 5.5);

  y = 65;
  const badgeX = ML;
  let bx = badgeX;
  bx += badge(CAT_ICON[writeup.category] ?? writeup.category, bx, [100, 116, 139]);
  badge(writeup.difficulty, bx, diffColor);

  y += 10;
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(248, 250, 252);

  const titleLines = pdf.splitTextToSize(writeup.title, CW);
  pdf.text(titleLines as any, ML, y);
  y += titleLines.length * 11;

  gap(3);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text(writeup.ctfName, ML, y);
  y += 7;

  if (writeup.description) {
    gap(6);

    const dlines = pdf.splitTextToSize(writeup.description, CW - 12);
    const dh = dlines.length * 5 + 10;

    pdf.setFillColor(30, 41, 59);
    pdf.setDrawColor(...diffColor);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(ML, y, CW, dh, 2, 2, 'FD');

    pdf.setLineWidth(0.8);
    pdf.line(ML, y + 2, ML, y + dh - 2);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);

    dlines.forEach((l: string, i: number) => pdf.text(l, ML + 6, y + 7 + i * 5));

    y += dh + 8;
  }

  // Author strip at bottom
  y = H - 36;
  hline([30, 41, 59]);
  gap(2);

  pdf.setFillColor(...diffColor);
  pdf.circle(ML + 5, y + 3, 5, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(11, 17, 27);
  pdf.text(username.charAt(0).toUpperCase(), ML + 3.2, y + 5);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(226, 232, 240);
  pdf.text(username, ML + 13, y + 3);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Author', ML + 13, y + 7.5);

  const stepsLabel = `${writeup.steps.length} step${writeup.steps.length > 1 ? 's' : ''}`;
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text(stepsLabel, W - MR - pdf.getTextWidth(stepsLabel), y + 5);

  // ── CONTENT PAGES ────────────────────────────────────────

  pdf.addPage();
  pdf.setFillColor(17, 17, 17);
  pdf.rect(0, 0, W, H, 'F');
  y = MT;

  sectionHeading('Exploitation Steps');

  for (let i = 0; i < writeup.steps.length; i++) {
    const step = writeup.steps[i];
    checkPage(30);

    const headerH = 9;

    pdf.setFillColor(26, 26, 26);
    pdf.setDrawColor(38, 38, 38);
    pdf.roundedRect(ML, y, CW, headerH, 2, 2, 'FD');

    pdf.setFillColor(diffColor[0] * 0.2, diffColor[1] * 0.2, diffColor[2] * 0.2);
    pdf.setDrawColor(...diffColor);
    pdf.roundedRect(ML + 3, y + 1.5, 6, 6, 1, 1, 'FD');

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...diffColor);
    pdf.text(`${i + 1}`, ML + 4.8, y + 5.8);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(226, 232, 240);
    pdf.text(`Step ${i + 1}`, ML + 12, y + 6);

    y += headerH + 4;

    // Description
    checkPage(12);

    const dlines = pdf.splitTextToSize(step.description, CW);
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);

    dlines.forEach((l: string) => {
      checkPage(6);
      pdf.text(l, ML, y);
      y += 5;
    });

    gap(3);

    // Command
    if (step.command) {
      codeBlock('bash', step.command, [134, 239, 172]);
    }

    // Output
    if (step.commandOutput) {
      codeBlock('output', step.commandOutput, [125, 211, 252]);
    }

    // Images
    if (step.images.length > 0) {
      for (const img of step.images) {
        try {
          checkPage(50);

          const imgEl = new Image();
          imgEl.crossOrigin = 'anonymous';

          await new Promise<void>((res) => {
            imgEl.onload = () => res();
            imgEl.onerror = () => res();
            imgEl.src = img.secureUrl;
          });

          if (imgEl.naturalWidth > 0) {
            const ratio = imgEl.naturalHeight / imgEl.naturalWidth;
            const imgW = CW;
            const imgH = Math.min(imgW * ratio, 80);

            checkPage(imgH + 6);

            pdf.setDrawColor(38, 38, 38);
            pdf.setLineWidth(0.3);
            pdf.rect(ML, y, imgW, imgH);
            pdf.addImage(imgEl, 'JPEG', ML, y, imgW, imgH);
            y += imgH + 6;
          }
        } catch {
          /* skip */
        }
      }
    }

    gap(6);

    // Divider between steps
    if (i < writeup.steps.length - 1) {
      checkPage(8);
      pdf.setDrawColor(38, 38, 38);
      pdf.setLineWidth(0.15);
      pdf.line(ML + 10, y, W - MR - 10, y);
      gap(6);
    }
  }

  // Flag
  if (writeup.flag) {
    checkPage(30);
    sectionHeading('Flag');

    const fh = 16;
    pdf.setFillColor(15, 42, 26);
    pdf.setDrawColor(22, 101, 52);
    pdf.roundedRect(ML, y, CW, fh, 3, 3, 'FD');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(74, 222, 128);
    pdf.text(writeup.flag, ML + 8, y + 10);
    y += fh + 6;
  }

  // Footer on last page
  checkPage(10);
  y = H - 12;

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 65, 85);

  pdf.text('CTF Writeup Generator', ML, y);
  const right = `${writeup.title} · ${writeup.ctfName}`;
  pdf.text(right, W - MR - pdf.getTextWidth(right), y);

  // Save
  const safeFilename = writeup.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);

  pdf.save(`${safeFilename}.pdf`);
}

