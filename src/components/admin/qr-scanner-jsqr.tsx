'use client';
import { useEffect, useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QrScannerProps {
  onScan: (text: string) => void;
}

export default function QrScannerJsQR({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(null);

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Scan for QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      console.log('🎯 QR CODE DETECTED:', code.data);

      // Prevent duplicate scans
      const now = Date.now();
      const lastScan = lastScannedRef.current;

      if (lastScan && lastScan.code === code.data && (now - lastScan.timestamp) < 3000) {
        console.log('⏭️  Duplicate scan ignored');
        animationFrameRef.current = requestAnimationFrame(scanQRCode);
        return;
      }

      // Update last scanned
      lastScannedRef.current = { code: code.data, timestamp: now };

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Process scan
      console.log('✅ Processing scan:', code.data);
      onScan(code.data);
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const startScanning = async () => {
    setIsLoading(true);

    try {
      console.log('=== STARTING JSQR SCANNER ===');
      
      // Request camera access with mobile-optimized constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      console.log('Requesting camera with constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // iOS fix
        await videoRef.current.play();

        console.log('✅ Video stream started');
        console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);

        setIsScanning(true);
        setIsLoading(false);

        // Start scanning loop
        scanQRCode();
      }
    } catch (err: any) {
      console.error('❌ Error starting scanner:', err);
      toast.error(err.message || 'Failed to start camera');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Video Display */}
      <div className="relative rounded-lg overflow-hidden bg-black min-h-[300px]">
        <video
          ref={videoRef}
          className="w-full h-auto"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Camera ready to scan</p>
            </div>
          </div>
        )}

        {/* Scanning overlay with corner markers */}
        {isScanning && (
          <div className="absolute inset-0">
            {/* Scanning instructions */}
            <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white text-sm p-4 rounded-lg shadow-lg z-10">
              <p className="font-bold mb-2">📱 SCANNING ACTIVE</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Hold QR 20-40cm away</li>
                <li>✓ Keep centered & steady</li>
                <li>✓ Ensure good lighting</li>
              </ul>
            </div>

            {/* Corner markers for scanning area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            disabled={isLoading}
            className="flex-1 max-w-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="flex-1 max-w-xs"
          >
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Camera
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-center text-muted-foreground">
        Using jsQR scanner - Optimized for mobile devices
      </p>
    </div>
  );
}
