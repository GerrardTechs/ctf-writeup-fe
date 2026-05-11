import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Shield, Flag, Terminal, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Image {
  id: string;
  secureUrl: string;
}

interface Step {
  id: string;
  orderIndex: number;
  description: string;
  command?: string;
  commandOutput?: string;
  images: Image[];
}

interface PublicWriteup {
  title: string;
  ctfName: string;
  category: string;
  difficulty: string;
  flag?: string;
  description?: string;
  status: string;
  createdAt: string;
  steps: Step[];
  user: { username: string };
}

const difficultyColor: Record<string, string> = {
  EASY: 'text-green-400 border-green-500',
  MEDIUM: 'text-yellow-400 border-yellow-500',
  HARD: 'text-orange-400 border-orange-500',
  INSANE: 'text-red-400 border-red-500',
};

export function SharePage() {
  const { token } = useParams();
  const [writeup, setWriteup] = useState<PublicWriteup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    fetchWriteup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchWriteup = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? '';
      const { data } = await axios.get(`${baseUrl}/api/v1/public/writeup/${token}`);
      setWriteup(data.data);
    } catch {
      setError('Link tidak valid atau sudah dinonaktifkan');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (i: number) => {
    const updated = new Set(expandedSteps);
    updated.has(i) ? updated.delete(i) : updated.add(i);
    setExpandedSteps(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !writeup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error || 'Writeup tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar public */}
      <nav className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground tracking-wider text-sm uppercase">PwnScribe</span>
        </div>
        
        <a
          href="/"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Buat writeup kamu sendiri -&gt;
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded border font-mono ${difficultyColor[writeup.difficulty] ?? 'text-muted-foreground border-border'}`}>
              {writeup.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded border border-border text-muted-foreground font-mono">
              {writeup.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{writeup.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{writeup.ctfName}</span>
            <span>&middot;</span>
            <span>by {writeup.user.username}</span>
            <span>&middot;</span>
            <span>{new Date(writeup.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-3">
          {writeup.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm">{writeup.description}</p>
            </div>
          )}
          {writeup.flag && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flag</p>
              <code className="text-sm text-primary font-mono bg-primary/10 px-3 py-1 rounded">
                {writeup.flag}
              </code>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Steps</p>
            <p className="text-sm">{writeup.steps.length} steps</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {writeup.steps.map((step, i) => (
            <div key={step.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(i)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
              >
                <span className="text-sm font-medium text-primary">Step {i + 1}</span>
                {expandedSteps.has(i) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSteps.has(i) && (
                <div className="px-5 pb-5 space-y-3 border-t border-border">
                  <p className="text-sm mt-4">{step.description}</p>
                  {step.command && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Command</p>
                      <pre className="bg-background border border-border rounded px-3 py-2 text-xs font-mono overflow-x-auto text-green-400">
                        {step.command}
                      </pre>
                    </div>
                  )}
                  {step.commandOutput && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Output</p>
                      <pre className="bg-background border border-border rounded px-3 py-2 text-xs font-mono overflow-x-auto text-blue-400">
                        {step.commandOutput}
                      </pre>
                    </div>
                  )}
                  {step.images.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Screenshots</p>
                      <div className="flex flex-wrap gap-2">
                        {step.images.map((img) => (
                          <a key={img.id} href={img.secureUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={img.secureUrl}
                              alt="screenshot"
                              className="w-32 h-24 object-cover rounded border border-border hover:border-primary/50 transition-colors"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border border-primary/20 rounded-lg p-6 text-center bg-primary/5">
          <Terminal className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Writeup ini dibuat dengan
          </p>
          <p className="font-bold text-foreground mb-3">PwnScribe &mdash; Automated CTF Write-Up Generator</p>
          
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Flag className="w-4 h-4" />
            Buat Writeup Kamu Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}