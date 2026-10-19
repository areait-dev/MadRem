interface LogoProps {
  /** `full`: wordmark "PromoRemind" · `icon`: quadrato con la "r" */
  variant?: 'full' | 'icon';
  /** Classi del contenitore (altezza, visibilità responsive, margini) */
  className?: string;
}

// Il wordmark ha due versioni: navy per il tema chiaro, bianca per il tema scuro
export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <span className={`inline-flex ${className}`}>
        <img src="/promoremind-icon.svg" alt="PromoRemind" className="h-full w-auto rounded-btn" />
      </span>
    );
  }

  return (
    <span className={`inline-flex ${className}`}>
      <img src="/promoremind-light.svg" alt="PromoRemind" className="h-full w-auto dark:hidden" />
      <img src="/promoremind-dark.svg" alt="" aria-hidden="true" className="hidden h-full w-auto dark:block" />
    </span>
  );
}
