import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
}

const DIFFICULTY_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  EASY:   { bg: '#1a2e1a', text: '#4ade80', border: '#166534' },
  MEDIUM: { bg: '#2e2a1a', text: '#fbbf24', border: '#92400e' },
  HARD:   { bg: '#2e1a1a', text: '#fb923c', border: '#9a3412' },
  INSANE: { bg: '#2e1a1a', text: '#f87171', border: '#991b1b' },
};

const CATEGORY_ICONS: Record<string, string> = {
  WEB: '🌐', PWN: '💥', CRYPTO: '🔐', FORENSICS: '🔍',
  MISC: '🎯', REV: '⚙️', OSINT: '👁️',
};

function badge(text: string, bg: string, color: string, border: string) {
  return `<span style="
    display: inline-flex; align-items: center; gap: 4px;
    background: ${bg}; color: ${color};
    border: 1px solid ${border};
    padding: 3px 10px; border-radius: 4px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.3px;
  ">${text}</span>`;
}

function codeBlock(label: string, content: string, color: string) {
  return `
    <div style="margin: 10px 0; border-radius: 6px; overflow: hidden; border: 1px solid #2d2d2d;">
      <div style="
        background: #1e1e1e; padding: 6px 14px;
        border-bottom: 1px solid #2d2d2d;
        display: flex; align-items: center; gap: 8px;
      ">
        <span style="display:flex;gap:5px;">
          <span style="width:10px;height:10px;border-radius:50%;background:#ff5f57;display:inline-block;"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#febc2e;display:inline-block;"></span>
          <span style="width:10px;height:10px;border-radius:50%;background:#28c840;display:inline-block;"></span>
        </span>
        <span style="color: #6b7280; font-size: 11px; font-family: 'SF Mono', 'Fira Code', monospace;">${label}</span>
      </div>
      <div style="background: #141414; padding: 14px 16px;">
        <pre style="
          margin: 0; color: ${color};
          font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 12px; line-height: 1.6;
          white-space: pre-wrap; word-break: break-all;
        ">${content}</pre>
      </div>
    </div>
  `;
}

export async function generatePdf(writeup: WriteupData, username: string) {
  const diff = DIFFICULTY_COLOR[writeup.difficulty] ?? DIFFICULTY_COLOR.EASY;
  const catIcon = CATEGORY_ICONS[writeup.category] ?? '📁';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 860px;
    background: #111111;
    padding: 0;
    font-family: -apple-system, 'Segoe UI', sans-serif;
    color: #e2e8f0;
    font-size: 13.5px;
    line-height: 1.7;
  `;
  document.body.appendChild(container);

  // ── COVER PAGE ─────────────────────────────────────────────
  let html = `
    <div style="
      min-height: 1100px;
      background: linear-gradient(160deg, #0f172a 0%, #111111 60%);
      padding: 72px 64px 48px;
      display: flex; flex-direction: column;
      border-bottom: 1px solid #1e293b;
    ">
      <!-- Top bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 80px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="
            width: 32px; height: 32px; border-radius: 8px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            display:flex; align-items:center; justify-content:center;
            font-size: 16px;
          ">🛡</div>
          <span style="color: #94a3b8; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
            CTF WRITEUP GENERATOR
          </span>
        </div>
        <span style="color: #475569; font-size: 12px;">${date}</span>
      </div>

      <!-- Title section -->
      <div style="flex: 1;">
        <div style="margin-bottom: 20px;">
          ${badge(`${catIcon} ${writeup.category}`, '#1e293b', '#94a3b8', '#334155')}
          &nbsp;
          ${badge(`⚡ ${writeup.difficulty}`, diff.bg, diff.text, diff.border)}
        </div>

        <h1 style="
          font-size: 42px; font-weight: 700;
          color: #f8fafc; margin: 0 0 12px 0;
          line-height: 1.2; letter-spacing: -0.5px;
        ">${writeup.title}</h1>

        <p style="color: #64748b; font-size: 16px; margin: 0 0 48px 0;">
          ${writeup.ctfName}
        </p>

        ${writeup.description ? `
          <div style="
            background: #1e293b; border-left: 3px solid #22c55e;
            border-radius: 0 8px 8px 0; padding: 16px 20px;
            color: #cbd5e1; font-size: 14px; max-width: 600px;
          ">${writeup.description}</div>
        ` : ''}
      </div>

      <!-- Author strip -->
      <div style="
        margin-top: 60px;
        padding-top: 24px; border-top: 1px solid #1e293b;
        display: flex; justify-content: space-between; align-items: center;
      ">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg, #22c55e, #0ea5e9);
            display:flex; align-items:center; justify-content:center;
            font-weight: 700; font-size: 14px; color: white;
          ">${username.charAt(0).toUpperCase()}</div>
          <div>
            <div style="color: #e2e8f0; font-weight: 600; font-size: 13px;">${username}</div>
            <div style="color: #475569; font-size: 11px;">Author</div>
          </div>
        </div>
        <div style="color: #475569; font-size: 12px;">
          ${writeup.steps.length} steps
        </div>
      </div>
    </div>

    <!-- ── CONTENT PAGE ── -->
    <div style="padding: 56px 64px;">

      <!-- Section heading -->
      <div style="
        display: flex; align-items: center; gap: 12px;
        margin-bottom: 32px;
      ">
        <div style="width: 3px; height: 20px; background: #22c55e; border-radius: 2px;"></div>
        <h2 style="
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          color: #64748b; text-transform: uppercase; margin: 0;
        ">EXPLOITATION STEPS</h2>
      </div>
  `;

  // ── STEPS ──────────────────────────────────────────────────
  writeup.steps.forEach((step, i) => {
    html += `
      <div style="
        margin-bottom: 32px;
        background: #161616;
        border: 1px solid #262626;
        border-radius: 12px;
        overflow: hidden;
      ">
        <!-- Step header -->
        <div style="
          padding: 14px 20px;
          background: #1a1a1a;
          border-bottom: 1px solid #262626;
          display: flex; align-items: center; gap: 12px;
        ">
          <div style="
            width: 24px; height: 24px; border-radius: 6px;
            background: #22c55e20; border: 1px solid #22c55e40;
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 700; color: #22c55e;
          ">${i + 1}</div>
          <span style="font-weight: 600; color: #e2e8f0; font-size: 13px;">Step ${i + 1}</span>
        </div>

        <!-- Step body -->
        <div style="padding: 20px;">
          <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 13.5px;">
            ${step.description}
          </p>

          ${step.command ? codeBlock('bash', step.command, '#86efac') : ''}
          ${step.commandOutput ? codeBlock('output', step.commandOutput, '#7dd3fc') : ''}

          ${step.images.length > 0 ? `
            <div style="margin-top: 16px;">
              <div style="
                font-size: 11px; color: #475569; letter-spacing: 1px;
                text-transform: uppercase; margin-bottom: 10px;
              ">SCREENSHOTS</div>
              ${step.images.map(img => `
                <div style="
                  border: 1px solid #262626; border-radius: 8px;
                  overflow: hidden; margin-bottom: 10px;
                ">
                  <img src="${img.secureUrl}"
                    style="width:100%; display:block;"
                    crossorigin="anonymous" />
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  // ── FLAG ───────────────────────────────────────────────────
  if (writeup.flag) {
    html += `
      <div style="
        margin-top: 8px;
        background: #0f2a1a;
        border: 1px solid #166534;
        border-radius: 12px;
        padding: 24px 28px;
      ">
        <div style="
          font-size: 11px; color: #4ade80; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 12px; font-weight: 600;
        ">🚩 FLAG</div>
        <code style="
          display: block;
          font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 15px; font-weight: 600;
          color: #4ade80;
          background: #052e16;
          padding: 12px 18px; border-radius: 6px;
          border: 1px solid #166534;
          word-break: break-all;
        ">${writeup.flag}</code>
      </div>
    `;
  }

  // ── FOOTER ─────────────────────────────────────────────────
  html += `
      <div style="
        margin-top: 48px; padding-top: 20px;
        border-top: 1px solid #1e293b;
        display: flex; justify-content: space-between;
        color: #334155; font-size: 11px;
      ">
        <span>CTF Writeup Generator</span>
        <span>${writeup.title} · ${writeup.ctfName}</span>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Tunggu semua gambar load
  const images = container.querySelectorAll('img');
  await Promise.all(Array.from(images).map(img =>
    new Promise<void>(resolve => {
      if (img.complete) resolve();
      else { img.onload = () => resolve(); img.onerror = () => resolve(); }
    })
  ));

  // Render ke canvas
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#111111',
    logging: false,
    windowWidth: 860,
  });

  document.body.removeChild(container);

  // Generate PDF
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/png');
  const scaledHeight = (canvas.height / canvas.width) * pdfWidth;

  let y = 0;
  let remaining = scaledHeight;

  while (remaining > 0) {
    pdf.addImage(imgData, 'PNG', 0, y, pdfWidth, scaledHeight);
    remaining -= pdfHeight;
    y -= pdfHeight;
    if (remaining > 0) pdf.addPage();
  }

  const safeFilename = writeup.title
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
  pdf.save(`${safeFilename}.pdf`);
}