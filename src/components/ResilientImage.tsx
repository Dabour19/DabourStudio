import React, { useState } from 'react';
import { HornetMark } from './HornetLogo';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#0E1017] bg-hex-grid p-6 text-center overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#070709] via-transparent to-[#F5B700]/10 pointer-events-none" />
        <HornetMark className="w-12 h-12 mb-3 relative z-10" />
        <span className="text-xs font-mono-tabular text-[#F5B700] relative z-10">
          DabourStudio · دبور ستيديو
        </span>
        {fallbackLabel && (
          <span className="mt-1 text-sm font-semibold text-zinc-200 max-w-xs line-clamp-2 relative z-10">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
