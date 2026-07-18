'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SmokeRing } from '@paper-design/shaders-react';

/**
 * Ambient SmokeRing shader background for the event detail page.
 * - Renders only on desktop (md+) to avoid mobile perf issues.
 * - Falls back to a static gradient on mobile.
 * - Respects dark/light mode with appropriate colors.
 * - Kept at low opacity so it reads as ambient texture, not a focal element.
 */
export function EventDetailShaderBg() {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Don't render anything server-side to avoid hydration mismatch
  if (!isMounted) return null;

  const isDark = resolvedTheme === 'dark';

  // Static gradient fallback for mobile
  if (!isDesktop) {
    return (
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          opacity: 0.3,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />
    );
  }

  return (
    // Outer: absolute positioning to fill the relative parent container
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        overflow: 'hidden',
        opacity: isDark ? 0.35 : 0.5,
      }}
    >
      {/* Inner: explicit 100% dimensions so the canvas actually renders at full size */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <SmokeRing
          colors={isDark ? ['#6366f1'] : ['#4f46e5']}
          colorBack={isDark ? '#0a0a0f' : '#e0e7ff'}
          noiseScale={3}
          noiseIterations={6}
          radius={0.35}
          thickness={0.6}
          speed={0.8}
          scale={1.5}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
