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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* Left Side: Brand & Version */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[9px] md:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              Mad<span className="text-primary italic">Rem</span>
            </span>
          </div>
          <span className="h-3 w-px bg-slate-200 dark:bg-white/10"></span>
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
            v{packageJson.version} &middot; {getReleaseDate()}
          </span>
        </div>

        {/* Right Side: Copyright & Powered By */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-2 md:pt-0">
          <div className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} <span className="hidden xs:inline">&middot;</span> <span className="text-slate-600 dark:text-slate-300">Madroom</span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-tight">Powered by</span>
            <span className="text-[8px] md:text-[9px] font-black text-slate-900 dark:text-white tracking-widest">adr.IA.no-dev</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
