import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-blue-200/60 dark:hover:bg-yellow-600/40 transition-all duration-300 ease-out group outline-none"
      aria-label="Cambia tema"
    >
      {/* Sun Icon */}
      <Sun 
        className={`absolute h-6 w-6 text-blue-900 transition-all duration-500 ease-out ${
          theme === 'dark' 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        }`} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={`absolute h-6 w-6 text-white transition-all duration-500 ease-out ${
          theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        }`} 
      />
      
      {/* Hover effect circle */}
      <div className="absolute inset-0 rounded-full bg-primary-500/20 dark:bg-accent-500/20 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
    </button>
  );
};

export default ThemeToggle;