import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import DotGrid from '../DotGrid';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('madroomReminder_remember') === 'true';
  });

  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();

  const { theme } = useTheme(); 

  // Redirect se già loggato
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

    // Validazione email
    if (!email) {
      setEmailError('Inserisci la tua email!');
      valid = false;
      setTimeout(() => setEmailError(''), 5000);
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError('Inserisci un indirizzo email valido!');
      valid = false;
      setTimeout(() => setEmailError(''), 5000);
    }

    // Validazione password
    if (!password) {
      setPasswordError('Inserisci la password!');
      valid = false;
      setTimeout(() => setPasswordError(''), 5000);
    }

    if (!valid) {
      return;
    }

    setLoading(true);

    try {
      // Salva preferenza rememberMe
      localStorage.setItem('madroomReminder_remember', rememberMe ? 'true' : 'false');

      // Login
      await signIn(email, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  // Loading durante verifica auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 dark:border-accent-500 mx-auto mb-4"></div>
          <p className="text-blue-900 dark:text-white font-medium">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 dark:bg-accent-400/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300/15 dark:bg-accent-300/15 rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200/10 dark:bg-accent-200/10 rounded-full animate-pulse-soft" style={{ animationDelay: '4s' }}></div>
      </div> */}
<div className='absolute inset-0 w-full h-full z-0'>
<DotGrid
    key={theme}
    dotSize={2}
    gap={10}
    baseColor={theme ==='dark' ? '#F7BE00' : '#2563eb'}
    activeColor={theme ==='dark' ? '#F7BE00' : '#2563eb'}
    proximity={80}
    shockRadius={250}
    shockStrength={5}
    resistance={500}
    returnDuration={1}
  />
</div>
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-modal rounded-3xl p-8 transform hover:scale-[1.02] transition-all duration-500">
          
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500 dark:bg-yellow-500 mb-4">
              <img src="./reminder.png" alt="Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">
              MadRem
            </h1>
            {/* <p className="text-blue-600 dark:text-yellow-300 text-sm">
              Il tuo assistente per le scadenze
            </p> */}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400 dark:text-yellow-300 group-focus-within:text-primary-500 dark:group-focus-within:text-accent-500 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Indirizzo Email"
                  className="input-glass w-full pl-12 pr-4 py-4 text-blue-900 dark:text-white placeholder:text-blue-400 dark:placeholder:text-yellow-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 px-3 py-2 rounded-xl animate-fade-in">
                  {emailError}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400 dark:text-yellow-300 group-focus-within:text-primary-500 dark:group-focus-within:text-accent-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="input-glass w-full pl-12 pr-14 py-4 text-blue-900 dark:text-white placeholder:text-blue-400 dark:placeholder:text-yellow-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Toggle Password Visibility */}
                <div className="absolute inset-y-0 right-0 flex items-center h-full pr-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="relative flex items-center justify-center w-10 h-10 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-yellow-800 transition-colors duration-200"
                    aria-label="Toggle password visibility"
                    tabIndex={-1}
                  >
                    <span className="relative flex items-center justify-center w-5 h-5">
                      <Eye
                        className={`h-5 w-5 text-blue-400 dark:text-yellow-300 absolute transition-all duration-300 ease-in-out ${
                          showPassword ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                        }`}
                      />
                      <EyeOff
                        className={`h-5 w-5 text-blue-400 dark:text-yellow-300 absolute transition-all duration-300 ease-in-out ${
                          showPassword ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 px-3 py-2 rounded-xl animate-fade-in">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <div className="relative ms-4">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor="rememberMe"
                  className="flex items-center cursor-pointer select-none"
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                    rememberMe 
                      ? 'bg-primary-500 dark:bg-accent-500 border-primary-500 dark:border-accent-500' 
                      : 'border-blue-300 dark:border-yellow-300'
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-blue-700 dark:text-yellow-300">
                    Ricordami
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className={`w-1/2 mx-auto flex justify-center py-2 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
                loading || authLoading
                  ? 'bg-gray-400 cursor-not-allowed scale-95'
                  : 'btn-primary hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </div>
            </button>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl backdrop-blur-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-blue-500 dark:text-yellow-400 text-xs">
              © {new Date().getFullYear()} Madroom - Gestione Scadenze
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;