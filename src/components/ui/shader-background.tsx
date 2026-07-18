'use client';

import React, { useEffect, useRef } from 'react';

export function ShaderBackground() {
  const lightCanvasRef = useRef<HTMLCanvasElement>(null);
  const darkCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function initShader(canvas: HTMLCanvasElement | null, isDark: boolean) {
      if (!canvas) return null;

      function syncSize() {
        if (!canvas) return;
        const w = canvas.clientWidth || 1280;
        const h = canvas.clientHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      }

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncSize);
        resizeObserver.observe(canvas);
      }
      syncSize();

      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) return null;

      const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

      // Light mode shader (ANIMATION_27)
      const fsLight = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
void main() {
    vec2 uv = v_texCoord;
    float noise1 = sin(uv.x * 2.5 + u_time * 0.4) * 0.5 + 0.5;
    float noise2 = sin(uv.y * 3.2 + u_time * 0.6) * 0.5 + 0.5;
    float noise3 = sin((uv.x + uv.y) * 2.0 + u_time * 0.5) * 0.5 + 0.5;
    vec3 color1 = vec3(0.0, 0.34, 1.0);
    vec3 color2 = vec3(0.44, 0.62, 1.0);
    vec3 color3 = vec3(0.96, 0.97, 1.0);
    vec3 color = mix(color1, color2, noise1);
    color = mix(color, color3, noise2 * 0.7);
    color = mix(color, color2, noise3 * 0.5);
    color += (1.0 - uv.y) * 0.15;
    gl_FragColor = vec4(color, 1.0);
}`;

      // Dark mode shader (ANIMATION_33)
      const fsDark = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
void main() {
    vec2 uv = v_texCoord;
    float noise1 = sin(uv.x * 3.0 + u_time * 0.8) * 0.5 + 0.5;
    float noise2 = sin(uv.y * 4.0 - u_time * 0.6) * 0.5 + 0.5;
    float noise3 = sin((uv.x - uv.y) * 2.5 + u_time * 1.0) * 0.5 + 0.5;
    vec3 color1 = vec3(0.0, 0.05, 0.2);
    vec3 color2 = vec3(0.0, 0.4, 1.0);
    vec3 color3 = vec3(0.3, 0.7, 1.0);
    vec3 color = mix(color1, color2, noise1);
    color = mix(color, color3, noise2 * 0.4);
    color += color2 * noise3 * 0.2;
    gl_FragColor = vec4(color, 1.0);
}`;

      function cs(type: number, src: string) {
        if (!gl) return null;
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      if (!prog) return null;
      
      const vertexShader = cs(gl.VERTEX_SHADER, vs);
      const fragmentShader = cs(gl.FRAGMENT_SHADER, isDark ? fsDark : fsLight);
      if (!vertexShader || !fragmentShader) return null;

      gl.attachShader(prog, vertexShader);
      gl.attachShader(prog, fragmentShader);
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const pos = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes = gl.getUniformLocation(prog, 'u_resolution');

      let animationFrameId: number;
      function render(t: number) {
        if (!gl) return;
        if (typeof ResizeObserver === 'undefined') syncSize();
        gl.viewport(0, 0, canvas!.width, canvas!.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas!.width, canvas!.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameId = requestAnimationFrame(render);
      }
      render(0);

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }

    const cleanupLight = initShader(lightCanvasRef.current, false);
    const cleanupDark = initShader(darkCanvasRef.current, true);

    return () => {
      if (cleanupLight) cleanupLight();
      if (cleanupDark) cleanupDark();
    };
  }, []);

  return (
    <>
      <canvas 
        ref={lightCanvasRef} 
        className="dark:hidden fixed inset-0 w-full h-full -z-10 pointer-events-none" 
      />
      <canvas 
        ref={darkCanvasRef} 
        className="hidden dark:block fixed inset-0 w-full h-full -z-10 pointer-events-none" 
      />
      {/* Global dark mode overlay to ensure consistent brightness and text legibility */}
      <div className="hidden dark:block fixed inset-0 w-full h-full bg-black/40 -z-10 pointer-events-none" />
    </>
  );
}
