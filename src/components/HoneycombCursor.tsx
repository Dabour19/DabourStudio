import React, { useEffect, useRef, useState } from 'react';

export const HoneycombCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
      }
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, input, select, textarea, [role="button"]')
        );
        setHovered(isInteractive);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 pointer-events-none hidden lg:flex items-center justify-center w-8 h-8 transition-transform duration-75 ease-out"
    >
      <svg
        viewBox="0 0 36 36"
        className={`w-full h-full transition-transform duration-150 ${
          hovered ? 'scale-125 opacity-95' : 'scale-100 opacity-55'
        }`}
      >
        <polygon
          points="18,2 32,10 32,26 18,34 4,26 4,10"
          fill={hovered ? 'rgba(245, 183, 0, 0.12)' : 'none'}
          stroke="#F5B700"
          strokeWidth="1.5"
        />
        <circle cx="18" cy="18" r="2" fill="#F5B700" />
      </svg>
    </div>
  );
};
