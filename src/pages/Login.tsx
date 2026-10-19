import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errors';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TechBackground from '../components/TechBackground';
import Logo from '../components/Logo';
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
    } catch (err) {
      setError(getErrorMessage(err) || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-fg font-semibold uppercase tracking-widest text-xs">Verifica sessione...</p>
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
          <h1 className="sr-only">promoremind</h1>
          <Logo className="h-8 lg:h-12 mb-4" />
          <p className="text-muted text-xl max-w-md leading-relaxed font-semibold transition-colors">
            Sistemi avanzati per il monitoraggio e la gestione di domini, database e infrastrutture.
          </p>

          <div className="pt-10 flex gap-4">
            <div className="h-1.5 w-16 rounded-full bg-accent" />
            <div className="h-1.5 w-6 rounded-full bg-line/20" />
            <div className="h-1.5 w-6 rounded-full bg-line/20" />
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
          <div className="card p-8 md:p-10 space-y-8 border border-divider">
            <div className="md:hidden flex justify-center mb-6">
              <Logo className="h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-fg">Accesso</h2>
              <p className="text-muted font-semibold text-sm uppercase tracking-widest transition-colors">Credenziali Aziendali</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted group-focus-within:text-link transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="nome@azienda.it"
                      className="input pl-12"
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
                        className="text-xs text-error font-semibold ml-1"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted group-focus-within:text-link transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-12 pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-link transition-colors"
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
                        className="text-xs text-error font-semibold ml-1"
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
                    <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-accent border-primary' : 'border-divider group-hover:border-accent/50'
                      }`}>
                      {rememberMe && <div className="w-2 h-2 bg-fg rounded-sm" />}
                    </div>
                  </div>
                  <span className="ml-3 text-xs text-muted group-hover:text-fg transition-colors font-semibold uppercase tracking-widest">Rimani collegato</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className="btn-primary btn-lg w-full"
              >
                {loading ? "Accesso in corso..." : "Accedi al Sistema"}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-error/10 border border-error/40 rounded-card text-center"
                  >
                    <p className="text-xs text-error font-semibold">{error}</p>
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