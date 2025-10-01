import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuti
const WARNING_TIME = 30 * 1000; // 30 secondi

export default function InactivityHandler() {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_TIME / 1000);
  const [pendingLogout, setPendingLogout] = useState(false);

  // Pulizia cookie e storage
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  // Logout automatico
  const handleAutoLogout = useCallback(async () => {
    setShowWarning(false);
    setPendingLogout(true);
    await signOut();
    clearAllStorage();
  }, [signOut]);

  // Reset timer su attività
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    setCountdown(WARNING_TIME / 1000);

    // Timer per logout
    timeoutRef.current = setTimeout(handleAutoLogout, SESSION_TIMEOUT);

    // Timer per mostrare il warning
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_TIME / 1000);
      let seconds = WARNING_TIME / 1000;
      countdownIntervalRef.current = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(countdownIntervalRef.current!);
          handleAutoLogout();
        }
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);
  }, [handleAutoLogout]);

  // Effetto che osserva user e pendingLogout
  useEffect(() => {
    if (pendingLogout && !user) {
      setPendingLogout(false);
      // L'eventuale redirect lo gestisce già ProtectedRoute/App
    }
  }, [pendingLogout, user]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimeout();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimeout();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, resetTimeout]);

  // Non mostrare alert se non loggato
  if (!user) return null;

  return showWarning ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-xs text-center">
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Sei inattivo</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Verrai disconnesso tra{" "}
          <span className="font-bold text-red-600">{countdown}</span>{" "}
          {countdown === 1 ? "secondo" : "secondi"} per inattività.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">
            Muovi il mouse o premi un tasto per restare connesso.
          </span>
          <span className="inline sm:hidden">
            Tocca lo schermo per restare connesso.
          </span>
        </p>
      </div>
    </div>
  ) : null;
}
