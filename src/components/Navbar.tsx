import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Gestione', icon: Globe, href: '/gestione' },
];

export default function Navbar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Static avatar from public folder
  const avatarUrl = "/adriano200.png";

  // Scroll shrink
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      title: 'VUOI DISCONNETTERTI?',
      showCancelButton: true,
      confirmButtonText: 'ESCI',
      cancelButtonText: 'ANNULLA',
      reverseButtons: true,
      background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      color: isDark ? '#ffffff' : '#0f172a',
      backdrop: `rgba(0,0,0,0.5)`,
      width: '320px',
      customClass: {
        popup: 'rounded-[2.5rem] border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-2xl p-6',
        title: 'text-[11px] font-black tracking-[0.4em] text-slate-500 dark:text-white/40 mb-8 uppercase pt-4',
        confirmButton: 'btn-primary !px-8 !py-3 !text-[10px] !rounded-full !m-2',
        cancelButton: 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/30 !px-8 !py-3 !text-[10px] !rounded-full !m-2',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        signOut();
      }
    });
  };

  return (
    <nav className={`fixed bottom-6 md:bottom-20 inset-x-0 z-50 transition-all duration-500 flex justify-center px-2 md:px-4`}>
      {/* ── High-End Glass Pill ── */}
      <div className={`
        relative w-full max-w-4xl flex items-center justify-between pl-1 pr-1
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        backdrop-blur-xl bg-white/[0.03] dark:bg-black/20 border border-slate-200 dark:border-white/10
        ${isScrolled
          ? 'h-11 rounded-full shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-black/40'
          : 'h-14 md:h-16 rounded-full md:rounded-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'
        }
      `}>

        {/* Logo Section - Hooked to the left edge */}
        <Link to="/dashboard" className="flex items-center group z-10 bg-slate-100/50 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500">
          <div className={`
            flex items-center justify-center rounded-full group-hover:border-primary/30 transition-all duration-500 overflow-hidden
            ${isScrolled ? 'h-8 w-8' : 'h-10 w-10 md:h-14 md:w-14'}
          `}>
            <img src="/madrem.circle.png" alt="Logo" className="w-full h-full object-contain scale-90 group-hover:scale-100 transition-transform duration-700" />
          </div>
          <span className="hidden sm:block mx-4 text-sm md:text-xl font-black tracking-tighter text-slate-900 dark:text-white transition-colors">
            Mad<span style={{ color: '#F7BE00' }} className="italic">Rem</span>
          </span>
        </Link>

        {/* Main Nav (Icons only on mobile) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1 md:gap-2 pointer-events-auto">
            {NAV_LINKS.map(({ name, icon: Icon, href }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`
                    flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
                    ${active
                      ? 'text-primary scale-110'
                      : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} className={`${active ? 'animate-pulse' : ''} md:w-3.5 md:h-3.5`} />
                  <span className="hidden md:inline">{name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 md:gap-2 z-10">
          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden xs:block" />

            <div className="relative hidden xs:block" ref={notifRef}>
              <button className="relative p-2 rounded-xl text-slate-600 dark:text-white/70 hover:text-[#F7BE00] transition-all duration-300">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#F7BE00] rounded-full" />
              </button>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />
          </div>

          {/* Profile Section - Hooked to the right edge */}
          <button
            onClick={handleLogout}
            className="group flex items-center rounded-full bg-slate-100/50 dark:bg-white/5 hover:bg-red-500/10 transition-all duration-500 border border-slate-200/50 dark:border-white/5 hover:border-red-500/20"
          >
            <div className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hidden sm:block">
              <span className="ml-4 mr-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                Esci
              </span>
            </div>
            <div className={`
              rounded-full overflow-hidden flex items-center justify-center group-hover:border-red-500/30 transition-all duration-500
              ${isScrolled ? 'h-8 w-8' : 'h-10 w-10 md:h-14 md:w-14'}
            `}>
              <img src={avatarUrl} alt="Profilo" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}