import { useState, useEffect } from 'react';
import packageJson from '../../package.json';

function getReleaseDate() {
  const date = packageJson.releaseDate ? new Date(packageJson.releaseDate) : new Date();
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function Footer() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <footer
      className={`
        fixed bottom-0 left-0 w-full z-40
        transition-all duration-500 ease-in-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        bg-white/80 dark:bg-black/40 backdrop-blur-2xl
        border-t border-slate-200/50 dark:border-white/5
        px-4 md:px-6 py-2 md:py-3
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
        {/* Left Side: Brand & Version */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[8px] md:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Mad<span className="text-primary italic">Rem</span>
            </span>
          </div>
          <span className="h-2 w-px bg-slate-200 dark:bg-white/10"></span>
          <span className="text-[7px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight whitespace-nowrap">
            v{packageJson.version} &middot; {getReleaseDate()}
          </span>
        </div>

        {/* Right Side: Copyright & Powered By */}
        <div className="flex items-center gap-3">
          <div className="text-[7px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
            &copy; {new Date().getFullYear()} <span className="text-slate-600 dark:text-slate-300">Madroom</span>
          </div>
          
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-tight hidden xxs:inline">By</span>
            <span className="text-[7px] md:text-[9px] font-black text-slate-900 dark:text-white tracking-tighter">adr.IA.no-dev</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
