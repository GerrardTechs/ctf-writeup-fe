import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Send, Loader2, ChevronDown, ChevronUp, Pencil, Sparkles } from 'lucide-react';
import { generatePdf } from '@/utils/exportPdf';
import { useAuthStore } from '@/store/auth.store';
import { Share2, Copy, Check, Trash2 as Revoke } from 'lucide-react';
const [credits, setCredits] = useState<number | null>(null);
const [userPlan, setUserPlan] = useState<string>('FREE');

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
  const { user } = useAuthStore();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [enhancing, setEnhancing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
const [sharing, setSharing] = useState(false);
const [copied, setCopied] = useState(false);
  const [enhancedPreview, setEnhancedPreview] = useState<{
    description: string;
    steps: { orderIndex: number; description: string }[];
  } | null>(null);

  useEffect(() => {
    fetchWriteup();
    fetchCredits();
  }, [id]);
  
  const fetchCredits = async () => {
    try {
      const { data } = await api.get('/ai/credits');
      setCredits(data.data.credits);
      setUserPlan(data.data.plan);
    } catch { /* silent */ }
  };

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

  const handleExportPdf = async () => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const response = await api.get(`/writeups/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${writeup?.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF berhasil didownload!', { id: toastId });
    } catch {
      toast.error('Gagal generate PDF', { id: toastId });
    }
  };

  const handleEnhance = async () => {
    if (userPlan !== 'PRO' && credits !== null && credits <= 0) {
      toast.error('Credit AI habis! Upgrade ke Pro untuk enhance unlimited.');
      return;
    }
  
    setEnhancing(true);
    const toastId = toast.loading('AI sedang menarasikan writeup...');
    try {
      const { data } = await api.post(`/writeups/${id}/enhance`);
      setEnhancedPreview(data.data);
      if (data.data.creditsRemaining !== 'unlimited') {
        setCredits(data.data.creditsRemaining);
        toast.success(`Narasi berhasil! Sisa credit: ${data.data.creditsRemaining}/5`, { id: toastId });
      } else {
        toast.success('Narasi berhasil dibuat!', { id: toastId });
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'INSUFFICIENT_CREDITS') {
        toast.error('Credit AI habis! Upgrade ke Pro.', { id: toastId });
      } else {
        toast.error(err.response?.data?.error ?? 'Gagal generate narasi', { id: toastId });
      }
    } finally {
      setEnhancing(false);
    }
  };
  
  const handleApplyEnhancement = async () => {
    if (!enhancedPreview) return;
    const toastId = toast.loading('Menyimpan narasi...');
    try {
      await api.post(`/writeups/${id}/enhance/apply`, enhancedPreview);
      toast.success('Narasi berhasil disimpan!', { id: toastId });
      setEnhancedPreview(null);
      fetchWriteup();
    } catch {
      toast.error('Gagal menyimpan narasi', { id: toastId });
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data } = await api.post(`/writeups/${id}/share`);
      setShareUrl(data.data.shareUrl);
      toast.success('Share link berhasil dibuat!');
    } catch {
      toast.error('Gagal membuat share link');
    } finally {
      setSharing(false);
    }
  };
  
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleRevokeShare = async () => {
    try {
      await api.delete(`/writeups/${id}/share`);
      setShareUrl(null);
      toast.success('Share link dinonaktifkan');
    } catch {
      toast.error('Gagal menonaktifkan share link');
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
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
  <div className="flex items-center gap-3">
    <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
      <ArrowLeft className="w-5 h-5" />
    </button>
    <div>
      <h1 className="text-xl md:text-2xl font-bold">{writeup.title}</h1>
      <p className="text-muted-foreground text-sm mt-0.5">
        {writeup.ctfName} · {writeup.category} ·{' '}
        <span className={difficultyColor[writeup.difficulty]}>{writeup.difficulty}</span>
      </p>
    </div>
  </div>

  {/* Tombol — scroll horizontal di mobile */}
  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0 max-w-full">
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors whitespace-nowrap"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Export </span>.md
    </button>
    <button
      onClick={() => navigate(`/writeup/${id}/edit`)}
      className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors whitespace-nowrap"
    >
      <Pencil className="w-3.5 h-3.5" />
      Edit
    </button>
    <button
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors whitespace-nowrap disabled:opacity-50"
    >
      {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
      Share
    </button>
    <div className="flex items-center gap-1.5 whitespace-nowrap">
  {credits !== null && userPlan !== 'PRO' && (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${
      credits > 0
        ? 'border-primary/30 text-primary bg-primary/5'
        : 'border-red-500/30 text-red-400 bg-red-500/5'
    }`}>
      {credits}/5
    </span>
  )}
  {userPlan === 'PRO' && (
    <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-500/30 text-yellow-400 bg-yellow-500/5">
      PRO
    </span>
  )}
  <button
    onClick={handleEnhance}
    disabled={enhancing || (userPlan !== 'PRO' && credits !== null && credits <= 0)}
    className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-primary/50 rounded text-primary hover:bg-primary/10 transition-colors whitespace-nowrap disabled:opacity-50"
  >
    {enhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
    <span className="hidden sm:inline">{enhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
    <span className="sm:hidden">AI</span>
  </button>
</div>
    <button
      onClick={handleExportPdf}
      className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm border border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors whitespace-nowrap"
    >
      <Download className="w-3.5 h-3.5" />
      PDF
    </button>
    {writeup.status === 'DRAFT' && (
      <button
        onClick={handlePublish}
        disabled={publishing}
        className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
      >
        {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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

        {shareUrl && (
  <div className="bg-card border border-primary/30 rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-primary flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share Link Aktif
      </p>
      <button
        onClick={handleRevokeShare}
        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
      >
        <Revoke className="w-3 h-3" />
        Nonaktifkan
      </button>
    </div>
    <div className="flex gap-2">
      <input
        readOnly
        value={shareUrl}
        className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono text-muted-foreground"
      />
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded text-xs hover:opacity-90 transition-opacity"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      Link ini bisa diakses siapa saja tanpa login
    </p>
  </div>
)}

        {enhancedPreview && (
  <div className="bg-card border border-primary/30 rounded-lg p-5 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">AI Enhancement Preview</h3>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEnhancedPreview(null)}
          className="px-3 py-1 text-xs border border-border rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handleApplyEnhancement}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
        >
          Apply Changes
        </button>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Description (Enhanced)
        </p>
        <p className="text-sm text-foreground bg-background rounded p-3 border border-border">
          {enhancedPreview.description}
        </p>
      </div>

      {enhancedPreview.steps.map((step, i) => (
        <div key={i}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Step {i + 1} (Enhanced)
          </p>
          <p className="text-sm text-foreground bg-background rounded p-3 border border-border">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

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