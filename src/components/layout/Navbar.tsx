import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Terminal, Shield } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-bold text-foreground tracking-wider text-sm uppercase">
          PWNSCRIBE
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Terminal className="w-4 h-4" />
          <span>{user?.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}