import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Shield, Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data } = await api.post('/auth/login', form);
    login(data.data.user, data.data.token, data.data.refreshToken);
    toast.success(`Welcome back, ${data.data.user.username}!`);
    navigate('/dashboard');
  } catch (err: any) {
    if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
      toast.error('Email belum diverifikasi. Cek inbox kamu.');
      navigate('/verify-otp', { state: { email: form.email } });
    } else {
      toast.error(err.response?.data?.error ?? 'Login gagal');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-wider uppercase">PWNSCRIBE</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="hacker@ctf.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}