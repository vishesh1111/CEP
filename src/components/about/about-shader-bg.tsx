'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Dynamically import the ShaderGradient components with ssr: false
// to avoid hydration mismatch and server-side errors with Canvas/Three.js
const ShaderGradientCanvas = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
);
const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradient),
  { ssr: false }
);

export function AboutShaderBg() {
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

  if (!isMounted) return null;

  const isDark = resolvedTheme === 'dark';

  // Fallback for mobile only
  if (!isDesktop) {
    return (
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          background: isDark
            ? 'radial-gradient(circle at top right, rgba(168,85,247,0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(99,102,241,0.15) 0%, transparent 40%)'
            : 'radial-gradient(circle at top right, rgba(168,85,247,0.08) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(99,102,241,0.08) 0%, transparent 40%)',
        }}
      />
    );
  }

  const shaderUrl = isDark
    ? '?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.35&cAzimuthAngle=180&cDistance=3.9&cPolarAngle=115&cameraZoom=1&color1=%236366f1&color2=%23a855f7&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=2.4&uTime=0.2&wireframe=false'
    : '?animate=on&axesHelper=off&bgColor1=%23ffffff&bgColor2=%23ffffff&brightness=1.2&cAzimuthAngle=180&cDistance=3.9&cPolarAngle=115&cameraZoom=1&color1=%236366f1&color2=%23a855f7&color3=%23ffffff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=2.4&uTime=0.2&wireframe=false';

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Overlay to ensure text contrast further down the page */}
      <div className={`absolute inset-0 z-10 ${isDark ? 'bg-black/30' : 'bg-white/50'}`} />
      
      <ShaderGradientCanvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <ShaderGradient
          control="query"
          urlString={shaderUrl}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
