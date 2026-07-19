declare module '@shadergradient/react' {
  import { CSSProperties } from 'react';

  export interface ShaderGradientCanvasProps {
    children?: React.ReactNode;
    style?: CSSProperties;
    className?: string;
  }

  export interface ShaderGradientProps {
    control?: 'query' | 'props';
    urlString?: string;
    [key: string]: any;
  }

  export const ShaderGradientCanvas: React.FC<ShaderGradientCanvasProps>;
  export const ShaderGradient: React.FC<ShaderGradientProps>;
}
