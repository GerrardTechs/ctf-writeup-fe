import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, ArrowLeft, X, Save } from 'lucide-react';

interface ExistingImage {
  id: string;
  secureUrl: string;
}

interface Step {
  id?: string;
  description: string;
  command: string;
  commandOutput: string;
  orderIndex: number;
  existingImages: ExistingImage[];
  newImages: File[];
  previewUrls: string[];
  deleted?: boolean;
}

const CATEGORIES = ['WEB', 'PWN', 'CRYPTO', 'FORENSICS', 'MISC', 'REV', 'OSINT'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'INSANE'];

const difficultyColor: Record<string, string> = {
  EASY: 'border-green-500 text-green-400',
  MEDIUM: 'border-yellow-500 text-yellow-400',
  HARD: 'border-orange-500 text-orange-400',
  INSANE: 'border-red-500 text-red-400',
};

export function WriteupEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState({
    title: '',
    ctfName: '',
    category: 'WEB',
    difficulty: 'MEDIUM',
    flag: '',
    description: '',
  });

  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    fetchWriteup();
  }, [id]);

  const fetchWriteup = async () => {
    try {
      const { data } = await api.get(`/writeups/${id}`);
      const w = data.data;
      setMeta({
        title: w.title,
        ctfName: w.ctfName,
        category: w.category,
        difficulty: w.difficulty,
        flag: w.flag ?? '',
        description: w.description ?? '',
      });
      setSteps(
        w.steps.map((s: any) => ({
          id: s.id,
          description: s.description,
          command: s.command ?? '',
          commandOutput: s.commandOutput ?? '',
          orderIndex: s.orderIndex,
          existingImages: s.images ?? [],
          newImages: [],
          previewUrls: [],
        }))
      );
    } catch {
      toast.error('Gagal memuat writeup');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, {
      description: '',
      command: '',
      commandOutput: '',
      orderIndex: steps.length,
      existingImages: [],
      newImages: [],
      previewUrls: [],
    }]);
  };

  const removeStep = (index: number) => {
    if (steps.filter(s => !s.deleted).length <= 1) {
      return toast.error('Minimal harus ada 1 step');
    }
    const updated = [...steps];
    if (updated[index].id) {
      updated[index].deleted = true;
    } else {
      updated.splice(index, 1);
    }
    setSteps(updated);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const handleImageAdd = (index: number, files: FileList | null) => {
    if (!files) return;
    const updated = [...steps];
    const step = updated[index];
    Array.from(files).forEach((file) => {
      const totalImages = step.existingImages.length + step.newImages.length;
      if (totalImages >= 10) return toast.error('Maksimal 10 gambar per step');
      if (file.size > 5 * 1024 * 1024) return toast.error(`${file.name} melebihi 5 MB`);
      step.newImages.push(file);
      step.previewUrls.push(URL.createObjectURL(file));
    });
    setSteps(updated);
  };

  const removeNewImage = (stepIndex: number, imgIndex: number) => {
    const updated = [...steps];
    URL.revokeObjectURL(updated[stepIndex].previewUrls[imgIndex]);
    updated[stepIndex].newImages.splice(imgIndex, 1);
    updated[stepIndex].previewUrls.splice(imgIndex, 1);
    setSteps(updated);
  };

  const removeExistingImage = async (stepIndex: number, imageId: string) => {
    try {
      await api.delete(`/images/${imageId}`);
      const updated = [...steps];
      updated[stepIndex].existingImages = updated[stepIndex].existingImages.filter(
        (img) => img.id !== imageId
      );
      setSteps(updated);
      toast.success('Gambar dihapus');
    } catch {
      toast.error('Gagal menghapus gambar');
    }
  };

  const handleSubmit = async () => {
    if (!meta.title || !meta.ctfName) return toast.error('Title dan CTF Name wajib diisi');
    const activeSteps = steps.filter(s => !s.deleted);
    if (activeSteps.some(s => !s.description)) return toast.error('Semua step harus ada deskripsinya');

    setSaving(true);
    try {
      // 1. Update metadata writeup
      await api.patch(`/writeups/${id}`, {
        title: meta.title,
        ctfName: meta.ctfName,
        category: meta.category,
        difficulty: meta.difficulty,
        flag: meta.flag || undefined,
        description: meta.description || undefined,
      });

      // 2. Hapus step yang ditandai deleted
      for (const step of steps.filter(s => s.deleted && s.id)) {
        await api.delete(`/writeups/${id}/steps/${step.id}`);
      }

      // 3. Update atau buat step
      let orderIndex = 0;
      for (const step of steps.filter(s => !s.deleted)) {
        if (step.id) {
          // Update existing step
          await api.put(`/writeups/${id}/steps/${step.id}`, {
            description: step.description,
            command: step.command || undefined,
            commandOutput: step.commandOutput || undefined,
            orderIndex,
          });
        } else {
          // Buat step baru
          const { data: stepData } = await api.post(`/writeups/${id}/steps`, {
            description: step.description,
            command: step.command || undefined,
            commandOutput: step.commandOutput || undefined,
            orderIndex,
          });
          step.id = stepData.data.id;
        }

        // Upload gambar baru
        for (const image of step.newImages) {
          const formData = new FormData();
          formData.append('file', image);
          await api.post(`/writeups/${id}/steps/${step.id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }

        orderIndex++;
      }

      toast.success('Writeup berhasil diupdate!');
      navigate(`/writeup/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const activeSteps = steps.filter(s => !s.deleted);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(`/writeup/${id}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Edit Writeup</h1>
        </div>

        {/* Metadata */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Challenge Info
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Challenge Title *</label>
              <input
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">CTF Name *</label>
              <input
                value={meta.ctfName}
                onChange={(e) => setMeta({ ...meta, ctfName: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
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
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {activeSteps.map((step, i) => {
            const realIndex = steps.indexOf(step);
            return (
              <div key={step.id ?? i} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Step {i + 1}
                  </h2>
                  <button
                    onClick={() => removeStep(realIndex)}
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
                      onChange={(e) => updateStep(realIndex, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Command</label>
                    <textarea
                      value={step.command}
                      onChange={(e) => updateStep(realIndex, 'command', e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Command Output</label>
                    <textarea
                      value={step.commandOutput}
                      onChange={(e) => updateStep(realIndex, 'commandOutput', e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Screenshots</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {/* Existing images */}
                      {step.existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.secureUrl}
                            alt="screenshot"
                            className="w-20 h-20 object-cover rounded border border-border"
                          />
                          <button
                            onClick={() => removeExistingImage(realIndex, img.id)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}

                      {/* New image previews */}
                      {step.previewUrls.map((url, imgIdx) => (
                        <div key={imgIdx} className="relative group">
                          <img
                            src={url}
                            alt={`new-${imgIdx}`}
                            className="w-20 h-20 object-cover rounded border border-primary/50"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/70 text-xs text-center text-white rounded-b py-0.5">
                            new
                          </div>
                          <button
                            onClick={() => removeNewImage(realIndex, imgIdx)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}

                      {/* Upload button */}
                      <label className="w-20 h-20 border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageAdd(realIndex, e.target.files)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Step */}
        <button
          onClick={addStep}
          className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-8"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => navigate(`/writeup/${id}`)}
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
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}