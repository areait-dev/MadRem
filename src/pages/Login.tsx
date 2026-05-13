import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TechBackground from '../components/TechBackground';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    let valid = true;

    if (!email) {
      setEmailError('Inserisci la tua email!');
      valid = false;
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError('Inserisci un indirizzo email valido!');
      valid = false;
    }

    if (!password) {
      setPasswordError('Inserisci la password!');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      await signIn(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a]">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs">Verifica sessione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500">
      <TechBackground />

      {/* Top Bar for Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side: Branding & Info */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-center p-12 lg:p-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex h-32 w-32 items-center justify-center mb-4 p-3 bg-white/5 dark:bg-transparent rounded-full">
            <img src="/madrem.circle.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">
            Mad<span className="text-primary italic">Rem</span>
          </h1>
          <p className="text-slate-600 dark:text-text-muted text-xl max-w-md leading-relaxed font-bold opacity-80 transition-colors">
            Sistemi avanzati per il monitoraggio e la gestione di domini, database e infrastrutture.
          </p>

          <div className="pt-10 flex gap-4">
            <div className="h-1.5 w-16 rounded-full bg-primary shadow-[0_0_15px_rgba(247,190,0,0.3)] dark:shadow-[0_0_15px_rgba(247,190,0,0.5)]" />
            <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 md:p-10 space-y-8 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="md:hidden text-center mb-6">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">
                Mad<span className="text-primary italic">Rem</span>
              </h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Accesso</h2>
              <p className="text-slate-500 dark:text-text-muted font-bold text-sm uppercase tracking-widest opacity-60 transition-colors">Credenziali Aziendali</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-text-muted uppercase tracking-[0.2em] ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 dark:text-text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="nome@azienda.it"
                      className="input-glass w-full pl-12 font-bold bg-white/50 dark:bg-black/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-red-500 dark:text-red-400 font-bold ml-1"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-text-muted uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 dark:text-text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-glass w-full pl-12 pr-12 font-bold bg-white/50 dark:bg-black/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-text-muted hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-red-500 dark:text-red-400 font-bold ml-1"
                      >
                        {passwordError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'border-slate-200 dark:border-white/10 group-hover:border-primary/50'
                      }`}>
                      {rememberMe && <div className="w-2 h-2 bg-slate-900 dark:bg-background rounded-sm" />}
                    </div>
                  </div>
                  <span className="ml-3 text-[11px] text-slate-500 dark:text-text-muted group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-black uppercase tracking-widest">Rimani collegato</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full btn-primary !py-4 text-sm font-black uppercase tracking-[0.2em]"
              >
                {loading ? "Accesso in corso..." : "Accedi al Sistema"}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
                  >
                    <p className="text-xs text-red-500 dark:text-red-400 font-bold">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}