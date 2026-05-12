import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, FileText, ChevronRight, Loader2, Flag } from 'lucide-react';

interface Writeup {
  id: string;
  title: string;
  ctfName: string;
  category: string;
  difficulty: string;
  status: string;
  createdAt: string;
  _count: { steps: number };
}

const difficultyColor: Record<string, string> = {
  EASY: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HARD: 'text-orange-400',
  INSANE: 'text-red-400',
};

const statusColor: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-primary/20 text-primary',
  ARCHIVED: 'bg-border text-muted-foreground',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWriteups();
  }, []);

  const fetchWriteups = async () => {
    try {
      const { data } = await api.get('/writeups');
      setWriteups(data.data);
    } catch {
      toast.error('Gagal memuat writeups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
  <div>
    <h1 className="text-xl md:text-2xl font-bold text-foreground">My Writeups</h1>
    <p className="text-muted-foreground text-sm mt-1">{writeups.length} writeup total</p>
  </div>
  <button
    onClick={() => navigate('/writeup/new')}
    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
  >
    <Plus className="w-4 h-4" />
    New Writeup
  </button>
</div>

<div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : writeups.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada writeup. Buat yang pertama!</p>
            <button
              onClick={() => navigate('/writeup/new')}
              className="mt-4 text-primary text-sm hover:underline"
            >
              + New Writeup
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {writeups.map((w) => (
              <div
                key={w.id}
                onClick={() => navigate(`/writeup/${w.id}`)}
                className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">{w.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[w.status]}`}>
                        {w.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5 flex flex-wrap gap-x-1">
  <span>{w.ctfName}</span>
  <span>·</span>
  <span>{w.category}</span>
  <span>·</span>
  <span className={difficultyColor[w.difficulty]}>{w.difficulty}</span>
  <span>·</span>
  <span>{w._count.steps} steps</span>
</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}