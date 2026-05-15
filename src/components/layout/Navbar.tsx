import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Terminal, Shield, Menu, X, Sun, Moon} from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '@/store/theme.store';


export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
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
            PwnScribe
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Terminal className="w-4 h-4" />
            <span>{user?.username}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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