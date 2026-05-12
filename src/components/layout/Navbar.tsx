import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Terminal, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-border bg-card px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground tracking-wider text-sm uppercase">
            PWNSCRIBE
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
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

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden mt-3 pb-2 border-t border-border pt-3 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Terminal className="w-4 h-4" />
            <span>{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}