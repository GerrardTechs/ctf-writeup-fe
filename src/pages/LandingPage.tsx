import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Terminal, FileText, Sparkles, Download, ArrowRight, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: Terminal,
    title: 'Step Builder Dinamis',
    desc: 'Dokumentasikan setiap langkah eksploitasi dengan command, output, dan screenshot secara terstruktur.',
  },
  {
    icon: Sparkles,
    title: 'AI Narasi Otomatis',
    desc: 'Ubah catatan teknis informal menjadi laporan profesional dengan satu klik menggunakan AI.',
  },
  {
    icon: FileText,
    title: 'Export Markdown & PDF',
    desc: 'Hasilkan laporan siap publikasi dalam format Markdown atau PDF dengan desain profesional.',
  },
  {
    icon: Download,
    title: 'Share Link Instan',
    desc: 'Bagikan writeup kamu ke siapa saja tanpa perlu login dengan satu link unik.',
  },
];

const categories = ['WEB', 'PWN', 'CRYPTO', 'FORENSICS', 'MISC', 'REV', 'OSINT'];

export function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [featVisible, setFeatVisible] = useState(false);

  useEffect(() => {
    // Hero animation
    const t1 = setTimeout(() => setVisible(true), 100);
    // Features animation
    const t2 = setTimeout(() => setFeatVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav
        className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between sticky top-0 z-50"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            {/* Ganti <Shield> dengan <img src="/logo.png" className="w-full h-full object-cover" /> */}
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold tracking-wider text-sm uppercase text-foreground">
            PwnScribe
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Mulai Gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 md:pb-20 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <Sparkles className="w-3 h-3" />
          Powered by Groq AI · Llama 3.3 70B
        </div>

        {/* Logo besar — placeholder */}
        <div
          className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          {/* Ganti dengan logo kamu: <img src="/logo.png" className="w-full h-full object-cover" /> */}
          <Shield className="w-10 h-10 text-primary" />
        </div>

        {/* Headline */}
        <h1
          className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
          }}
        >
          Dokumentasi CTF{' '}
          <span className="text-primary">Lebih Cepat,</span>
          <br />
          Rapi, dan Profesional
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s',
          }}
        >
          PwnScribe membantu peneliti keamanan siber dan CTF player membuat laporan
          writeup profesional secara otomatis — dari catatan teknis hingga PDF siap publikasi.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s',
          }}
        >
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 border border-border text-muted-foreground px-6 py-3 rounded-lg text-sm hover:text-foreground hover:border-primary/50 transition-colors"
          >
            Sudah punya akun? Login
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category pills */}
        <div
          className="flex items-center justify-center gap-2 flex-wrap mt-12"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.7s',
          }}
        >
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground font-mono"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div
          className="text-center mb-12"
          style={{
            opacity: featVisible ? 1 : 0,
            transform: featVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Semua yang kamu butuhkan
          </h2>
          <p className="text-muted-foreground text-sm">
            Dari dokumentasi hingga publikasi, PwnScribe menangani semuanya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors group"
              style={{
                opacity: featVisible ? 1 : 0,
                transform: featVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.5s ease ${0.1 * i}s, transform 0.5s ease ${0.1 * i}s`,
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground tracking-wider uppercase">PwnScribe</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Automated CTF Write-Up Generator · Made with ❤️ to assist those in need.
        </p>
      </footer>
    </div>
  );
}