import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
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
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const currentScrollY = window.scrollY;
      setVisible(!(currentScrollY > lastScrollY.current && currentScrollY > 100));
      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      className={`
        fixed bottom-0 left-0 w-full z-40
        transition-all duration-500 ease-in-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        bg-surface
        border-t border-divider
        px-gutter py-2 md:py-3
      `}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Logo className="h-3.5" />
          <span className="h-3 w-px bg-line/30"></span>
          <span className="caption text-muted whitespace-nowrap">
            v{packageJson.version} &middot; {getReleaseDate()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="caption text-muted hidden sm:block">
            &copy; {new Date().getFullYear()} Promotergroup S.p.A.
          </span>
        </div>
      </div>
    </footer>
  );
}
