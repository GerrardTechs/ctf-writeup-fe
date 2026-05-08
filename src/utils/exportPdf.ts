import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPdf(writeupId: string, title: string) {
  // Buat container tersembunyi untuk render konten
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: #ffffff;
    padding: 48px;
    font-family: 'Courier New', monospace;
    color: #1a1a1a;
    font-size: 13px;
    line-height: 1.6;
  `;
  document.body.appendChild(container);

  return { container, cleanup: () => document.body.removeChild(container) };
}

interface Image { secureUrl: string; }
interface Step {
  orderIndex: number;
  description: string;
  command?: string | null;
  commandOutput?: string | null;
  images: Image[];
}
interface WriteupData {
  title: string;
  ctfName: string;
  category: string;
  difficulty: string;
  flag?: string | null;
  description?: string | null;
  steps: Step[];
  user?: { username: string };
  createdAt?: string;
}

const difficultyColor: Record<string, string> = {
  EASY: '#22c55e',
  MEDIUM: '#eab308',
  HARD: '#f97316',
  INSANE: '#ef4444',
};

export async function generatePdf(writeup: WriteupData, username: string) {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: #0d1117;
    padding: 48px;
    font-family: 'Courier New', monospace;
    color: #e6edf3;
    font-size: 13px;
    line-height: 1.7;
  `;
  document.body.appendChild(container);

  // Build HTML content
  let html = `
    <div style="border-bottom: 2px solid #21262d; padding-bottom: 24px; margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0 0 8px 0;">
        ${writeup.title}
      </h1>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px;">
        <span style="background: #161b22; border: 1px solid #21262d; padding: 4px 12px; border-radius: 4px; font-size: 12px;">
          📁 ${writeup.ctfName}
        </span>
        <span style="background: #161b22; border: 1px solid #21262d; padding: 4px 12px; border-radius: 4px; font-size: 12px;">
          🏷️ ${writeup.category}
        </span>
        <span style="background: #161b22; border: 1px solid ${difficultyColor[writeup.difficulty]}40; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: ${difficultyColor[writeup.difficulty]};">
          ⚡ ${writeup.difficulty}
        </span>
        <span style="background: #161b22; border: 1px solid #21262d; padding: 4px 12px; border-radius: 4px; font-size: 12px;">
          👤 ${username}
        </span>
      </div>
    </div>
  `;

  if (writeup.description) {
    html += `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #7d8590; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Description</h2>
        <p style="margin: 0; color: #c9d1d9;">${writeup.description}</p>
      </div>
    `;
  }

  html += `<h2 style="font-size: 14px; color: #7d8590; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Solution</h2>`;

  writeup.steps.forEach((step, i) => {
    html += `
      <div style="margin-bottom: 24px; border: 1px solid #21262d; border-radius: 8px; overflow: hidden;">
        <div style="background: #161b22; padding: 10px 16px; border-bottom: 1px solid #21262d;">
          <span style="color: #3fb950; font-weight: bold; font-size: 13px;">▶ Step ${i + 1}</span>
        </div>
        <div style="padding: 16px;">
          <p style="margin: 0 0 12px 0; color: #c9d1d9;">${step.description}</p>
    `;

    if (step.command) {
      html += `
        <div style="margin-bottom: 12px;">
          <div style="background: #161b22; border: 1px solid #21262d; border-radius: 6px; padding: 12px; font-family: 'Courier New', monospace;">
            <div style="color: #7d8590; font-size: 11px; margin-bottom: 6px;">$ command</div>
            <code style="color: #79c0ff; font-size: 12px; white-space: pre-wrap; word-break: break-all;">${step.command}</code>
          </div>
        </div>
      `;
    }

    if (step.commandOutput) {
      html += `
        <div style="margin-bottom: 12px;">
          <div style="background: #0d1117; border: 1px solid #21262d; border-radius: 6px; padding: 12px; font-family: 'Courier New', monospace;">
            <div style="color: #7d8590; font-size: 11px; margin-bottom: 6px;">output</div>
            <code style="color: #a5d6ff; font-size: 12px; white-space: pre-wrap; word-break: break-all;">${step.commandOutput}</code>
          </div>
        </div>
      `;
    }

    // Images
    if (step.images.length > 0) {
      html += `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">`;
      step.images.forEach((img) => {
        html += `<img src="${img.secureUrl}" style="max-width: 100%; border-radius: 4px; border: 1px solid #21262d;" crossorigin="anonymous" />`;
      });
      html += `</div>`;
    }

    html += `</div></div>`;
  });

  if (writeup.flag) {
    html += `
      <div style="margin-top: 24px; border: 1px solid #3fb95040; border-radius: 8px; padding: 16px; background: #0d1117;">
        <h2 style="font-size: 14px; color: #7d8590; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">🚩 Flag</h2>
        <code style="color: #3fb950; font-size: 14px; font-family: 'Courier New', monospace; background: #161b22; padding: 8px 16px; border-radius: 4px; display: block;">
          ${writeup.flag}
        </code>
      </div>
    `;
  }

  container.innerHTML = html;

  // Tunggu semua gambar load
  const images = container.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );

  // Render ke canvas
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0d1117',
    logging: false,
  });

  document.body.removeChild(container);

  // Generate PDF
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  let position = 0;
  let remainingHeight = scaledHeight;

  while (remainingHeight > 0) {
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    remainingHeight -= pdfHeight;
    position -= pdfHeight;
    if (remainingHeight > 0) pdf.addPage();
  }

  const safeFilename = writeup.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);

  pdf.save(`${safeFilename}.pdf`);
}