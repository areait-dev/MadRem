import React from 'react';
import { motion } from "framer-motion";

const TechBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 opacity-30 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 dark:bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Professional Grid System */}
      <div
        className="absolute inset-0 opacity-[0.20] dark:opacity-[0.40] dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(247,190,0,0.1) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(247,190,0,0.1) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.40]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(247,190,0,0.15) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(247,190,0,0.15) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(#F7BE00 1px, transparent 1px),
            linear-gradient(90deg, #F7BE00 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px',
        }}
      />

      {/* Decorative Technical Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] dark:opacity-[0.04] pointer-events-none text-primary">
        <defs>
          <pattern id="line-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#line-pattern)" />
      </svg>

      {/* Spotlight Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(247,190,0,0.02)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(247,190,0,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(247,190,0,0.02)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(247,190,0,0.03)_0%,transparent_50%)]" />

      {/* Animated Beams */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: ["-100%", "200%"],
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
          className="absolute top-[20%] left-0 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 dark:via-primary/40 to-transparent rotate-[-45deg]"
        />
        <motion.div
          animate={{
            x: ["-100%", "200%"],
            opacity: [0, 0.1, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
          className="absolute top-[60%] left-0 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/10 dark:via-primary/20 to-transparent rotate-[-45deg]"
        />
      </div>
    </div>
  );
}

export default TechBackground;
