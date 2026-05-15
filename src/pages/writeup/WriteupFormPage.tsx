import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, ArrowLeft, X } from 'lucide-react';

interface Step {
  description: string;
  command: string;
  commandOutput: string;
  images: File[];
  previewUrls: string[];
}

const CATEGORIES = ['WEB', 'PWN', 'CRYPTO', 'FORENSICS', 'MISC', 'REV', 'OSINT', 'HARDWARE', 'MOBILE', 'CLOUD', 'BLOCKCHAIN', 'NETWORK', 'STEGO', 'PWNABLE', 'TRIVIA'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'INSANE'];

const difficultyColor: Record<string, string> = {
  EASY: 'border-green-500 text-green-400',
  MEDIUM: 'border-yellow-500 text-yellow-400',
  HARD: 'border-orange-500 text-orange-400',
  INSANE: 'border-red-500 text-red-400',
};

export function WriteupFormPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState({
    title: '',
    ctfName: '',
    category: 'WEB',
    difficulty: 'MEDIUM',
    flag: '',
    description: '',
  });

  const [steps, setSteps] = useState<Step[]>([
    { description: '', command: '', commandOutput: '', images: [], previewUrls: [] },
  ]);

  const addStep = () => {
    setSteps([...steps, { description: '', command: '', commandOutput: '', images: [], previewUrls: [] }]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return toast.error('Minimal harus ada 1 step');
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const handleImageAdd = (index: number, files: FileList | null) => {
    if (!files) return;
    const updated = [...steps];
    const step = updated[index];

    Array.from(files).forEach((file) => {
      if (step.images.length >= 10) return toast.error('Maksimal 10 gambar per step');
      if (file.size > 5 * 1024 * 1024) return toast.error(`${file.name} melebihi 5 MB`);
      step.images.push(file);
      step.previewUrls.push(URL.createObjectURL(file));
    });

    setSteps(updated);
  };

  const removeImage = (stepIndex: number, imgIndex: number) => {
    const updated = [...steps];
    URL.revokeObjectURL(updated[stepIndex].previewUrls[imgIndex]);
    updated[stepIndex].images.splice(imgIndex, 1);
    updated[stepIndex].previewUrls.splice(imgIndex, 1);
    setSteps(updated);
  };

  const handleSubmit = async () => {
    if (!meta.title || !meta.ctfName) return toast.error('Title dan CTF Name wajib diisi');
    if (steps.some((s) => !s.description)) return toast.error('Semua step harus ada deskripsinya');

    setSaving(true);
    try {
      // 1. Buat writeup
      const { data: writeupData } = await api.post('/writeups', meta);
      const writeupId = writeupData.data.id;

      // 2. Buat setiap step + upload gambarnya
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const { data: stepData } = await api.post(`/writeups/${writeupId}/steps`, {
          description: step.description,
          command: step.command || undefined,
          commandOutput: step.commandOutput || undefined,
          orderIndex: i,
        });
        const stepId = stepData.data.id;

        // Upload gambar satu per satu
        for (const image of step.images) {
          const formData = new FormData();
          formData.append('file', image);
          await api.post(`/writeups/${writeupId}/steps/${stepId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      toast.success('Writeup berhasil dibuat!');
      navigate(`/writeup/${writeupId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal menyimpan writeup');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">New Writeup</h1>
        </div>

        {/* Metadata */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Challenge Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Challenge Title *</label>
              <input
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="SQL Injection to RCE"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">CTF Name *</label>
              <input
                value={meta.ctfName}
                onChange={(e) => setMeta({ ...meta, ctfName: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="PicoCTF 2024"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Flag</label>
              <input
                value={meta.flag}
                onChange={(e) => setMeta({ ...meta, flag: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="CTF{flag_here}"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMeta({ ...meta, category: cat })}
                    className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
                      meta.category === cat
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setMeta({ ...meta, difficulty: diff })}
                    className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
                      meta.difficulty === diff
                        ? `${difficultyColor[diff]} bg-opacity-10`
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                rows={3}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Jelaskan challenge ini secara singkat..."
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Step {i + 1}
                </h2>
                <button
                  onClick={() => removeStep(i)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Description *</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, 'description', e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Jelaskan langkah eksploitasi ini..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Command</label>
                  <textarea
                    value={step.command}
                    onChange={(e) => updateStep(i, 'command', e.target.value)}
                    rows={2}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="nmap -sV target.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Command Output</label>
                  <textarea
                    value={step.commandOutput}
                    onChange={(e) => updateStep(i, 'commandOutput', e.target.value)}
                    rows={2}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="80/tcp open http..."
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Screenshots</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {step.previewUrls.map((url, imgIdx) => (
                      <div key={imgIdx} className="relative group">
                        <img
                          src={url}
                          alt={`preview-${imgIdx}`}
                          className="w-20 h-20 object-cover rounded border border-border"
                        />
                        <button
                          onClick={() => removeImage(i, imgIdx)}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageAdd(i, e.target.files)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step */}
        <button
          onClick={addStep}
          className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-8"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 text-sm border border-border rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Writeup'}
          </button>
        </div>
      </div>
    </div>
  );
}