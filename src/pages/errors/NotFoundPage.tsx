import { useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-mono text-8xl font-bold text-primary/20 mb-4">404</div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold uppercase tracking-wider text-sm">PwnScribe</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Path yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="bg-card border border-border rounded-lg p-4 mb-6 text-left font-mono text-xs text-muted-foreground">
          <span className="text-primary">$</span> curl -I {window.location.href}
          <br />
          <span className="text-red-400">HTTP/1.1 404 Not Found</span>
          <br />
          <span className="text-muted-foreground">X-Content-Type: nosniff</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}