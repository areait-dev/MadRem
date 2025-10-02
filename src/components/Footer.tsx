import { useEffect, useState } from 'react';
import packageJson from '../../package.json';

// Funzione per ottenere la data di release dal package.json
function getReleaseDate() {
  // Se esiste una data di release nel package.json, usala
  if (packageJson.releaseDate) {
    return new Date(packageJson.releaseDate).toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
  
  // Fallback: usa la data corrente (per compatibilità)
  return new Date().toLocaleDateString('it-IT', { 
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
      // Nascondi solo su mobile (max-width: 640px)
      if (window.innerWidth <= 640) {
        if (window.scrollY > lastScrollY && window.scrollY > 40) {
          setVisible(false); // Scroll down: nascondi
        } else {
          setVisible(true); // Scroll up: mostra
        }
        setLastScrollY(window.scrollY);
      } else {
        setVisible(true); // Sempre visibile su desktop
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <footer
      className={`
        fixed bottom-0 left-0 w-full z-40
        transition-transform duration-300
        ${visible ? 'translate-y-0' : 'translate-y-full'}
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
        border-t border-gray-200 dark:border-gray-700
        text-center px-2 py-1 sm:px-4 sm:py-2 text-sm text-blue-900 dark:text-yellow-300
        shadow-inner
      `}
      style={{ fontFamily: 'inherit' }}
    >
      <div className="flex flex-row items-center justify-center gap-2">
        <span>
          v{packageJson.version} &middot; {getReleaseDate()}
        </span>
        <span className="text-blue-500 dark:text-yellow-400">
          powered by <span className="ml-1 tracking-wide text-blue-900 dark:text-yellow-300">adr.IA.no-dev</span>
        </span>
      </div>
      <div className="mt-1 text-xs text-blue-500 dark:text-yellow-400">
        &copy; {new Date().getFullYear()} Madroom - Gestione Scadenze
      </div>
    </footer>
  );
}
