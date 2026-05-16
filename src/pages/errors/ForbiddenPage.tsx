import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-mono text-8xl font-bold text-red-500/20 mb-4">403</div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldX className="w-5 h-5 text-red-400" />
          <span className="font-bold uppercase tracking-wider text-sm">Access Denied</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground text-sm mb-8">
          IP kamu telah diblokir karena aktivitas mencurigakan. Jika ini kesalahan, hubungi administrator.
        </p>
        <div className="bg-card border border-red-500/20 rounded-lg p-4 mb-6 text-left font-mono text-xs">
          <span className="text-red-400">$</span> curl -I {window.location.href}
          <br />
          <span className="text-red-400">HTTP/1.1 403 Forbidden</span>
          <br />
          <span className="text-muted-foreground">X-Ban-Reason: Suspicious activity detected</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity mx-auto"
        >
          <Home className="w-4 h-4" />
          Kembali ke Home
        </button>
      </div>
    </div>
  );
}