import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Shield, Loader2, Mail, RefreshCw } from 'lucide-react';

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/register');
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    paste.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Masukkan 6 digit kode OTP');

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: code });
      toast.success('Email berhasil diverifikasi! Silakan login.');
      navigate('/login');
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'OTP_EXPIRED') {
        toast.error('Kode OTP expired. Klik "Kirim Ulang".');
      } else {
        toast.error(err.response?.data?.error ?? 'Kode OTP salah');
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP baru sudah dikirim!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Gagal mengirim OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">

          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-wider uppercase">PwnScribe</h1>
          </div>

          {/* Icon email */}
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-lg font-bold text-center text-foreground mb-2">
            Verifikasi Email
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Kode OTP 6 digit sudah dikirim ke
          </p>
          <p className="text-sm font-mono text-primary text-center mb-8 bg-primary/5 border border-primary/20 rounded px-3 py-1">
            {email}
          </p>

          {/* OTP Input */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded-lg border transition-colors focus:outline-none
                  ${digit
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground focus:border-primary'
                  }`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-primary text-primary-foreground rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mb-4"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Tidak menerima kode?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline mx-auto transition-opacity"
            >
              {resending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang OTP'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}