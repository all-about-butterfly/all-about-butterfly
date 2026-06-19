'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type PicProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallbackEmoji?: string;
};

/**
 * Renders /images/* assets exported from the Claude Design project.
 * Those PNGs aren't included yet (the design connector can't transfer files
 * over ~256 KiB) — drop the originals into public/images using these exact
 * filenames and this swaps in automatically, no code changes needed.
 */
export function Pic({ src, alt, className, style, fallbackEmoji = '🦋' }: PicProps) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // The image may have already failed to load before hydration attached
    // onError (the browser starts fetching from the server-rendered HTML
    // before React's listeners exist) — catch that case on mount too.
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, []);

  if (broken) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#ece3c8,#ddd0ab)',
          color: '#a08a3e',
          fontSize: '2.4em',
        }}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setBroken(true)}
    />
  );
}
