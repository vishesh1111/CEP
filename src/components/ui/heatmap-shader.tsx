'use client';

import { Heatmap } from '@paper-design/shaders-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function HeatmapShader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <div style={{ transform: 'scale(3)', transformOrigin: 'center' }}>
        <Heatmap
          width={600}
          height={600}
          image="https://shaders.paper.design/images/logos/diamond.svg"
          colors={
            isLight
              ? ["#f8fafc", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5"]
              : ["#112069", "#1f3ca3", "#3265e7", "#6bd8ff", "#ffe77a", "#ff9a1f", "#ff4d00"]
          }
          colorBack={isLight ? "#f8fafc" : "#000000"}
          contour={0.5}
          angle={0}
          noise={0}
          innerGlow={0.5}
          outerGlow={0.5}
          speed={0.8}
          scale={0.4} // Reduced scale in the shader since the CSS transform scales it up 3x
        />
      </div>
    </div>
  );
}
