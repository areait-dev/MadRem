import React from 'react';

// Sfondo piatto del design system, con una griglia tecnica appena accennata
const TechBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-page">
      <div
        className="absolute inset-0 text-fg opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        }}
      />
    </div>
  );
}

export default TechBackground;
