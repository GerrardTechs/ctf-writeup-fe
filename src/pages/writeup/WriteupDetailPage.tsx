import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Image { id: string; secureUrl: string; }
interface Step {
  id: string;
  orderIndex: number;
  description: string;
  command?: string;
  commandOutput?: string;
  images: Image[];
}
interface Writeup {
  id: string;
  title: string;
  ctfName: string;
  category: string;
  difficulty: string;
  flag?: string;
  description?: string;
  status: string;
  steps: Step[];
}

const difficultyColor: Record<string, string> = {
  EASY: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HARD: 'text-orange-400',
  INSANE: 'text-red-400',
};

export function WriteupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [writeup, setWriteup] = useState<Writeup | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  useEffect(() => { fetchWriteup(); }, [id]);

  const fetchWriteup = async () => {
    try {
      const { data } = await api.get(`/writeups/${id}`);
      setWriteup(data.data);
    } catch {
      toast.error('Gagal memuat writeup');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/writeups/${id}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${writeup?.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Writeup berhasil diexport!');
    } catch {
      toast.error('Gagal export writeup');
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post(`/writeups/${id}/publish`);
      toast.success('Writeup dipublish!');
      fetchWriteup();
    } catch {
      toast.error('Gagal publish writeup');
    } finally {
      setPublishing(false);
    }
  };

  const toggleStep = (index: number) => {
    const updated = new Set(expandedSteps);
    updated.has(index) ? updated.delete(index) : updated.add(index);
    setExpandedSteps(updated);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (!writeup) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{writeup.title}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {writeup.ctfName} · {writeup.category} ·{' '}
                <span className={difficultyColor[writeup.difficulty]}>{writeup.difficulty}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export .md
            </button>
            {writeup.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-lg p-5 mb-6 grid grid-cols-2 gap-4">
          {writeup.description && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm">{writeup.description}</p>
            </div>
          )}
          {writeup.flag && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flag</p>
              <code className="text-sm text-primary font-mono bg-primary/10 px-3 py-1 rounded">
                {writeup.flag}
              </code>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              writeup.status === 'PUBLISHED' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {writeup.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Steps</p>
            <p className="text-sm">{writeup.steps.length} steps</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {writeup.steps.map((step, i) => (
            <div key={step.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(i)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
              >
                <span className="text-sm font-medium text-primary">Step {i + 1}</span>
                {expandedSteps.has(i) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedSteps.has(i) && (
                <div className="px-5 pb-5 space-y-3 border-t border-border">
                  <p className="text-sm mt-4">{step.description}</p>
                  {step.command && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Command</p>
                      <pre className="bg-background border border-border rounded px-3 py-2 text-xs font-mono overflow-x-auto">
                        {step.command}
                      </pre>
                    </div>
                  )}
                  {step.commandOutput && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Output</p>
                      <pre className="bg-background border border-border rounded px-3 py-2 text-xs font-mono overflow-x-auto">
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
      </div>
    </div>
  );
}