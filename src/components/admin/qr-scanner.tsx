'use client';
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, SwitchCamera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QrScannerProps {
  onScan: (text: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(null);

  // Initialize scanner and get available cameras
  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map(device => ({
            id: device.id,
            label: device.label || `Camera ${device.id.slice(0, 8)}`
          })));
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        toast.error('Unable to access cameras');
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async (cameraId?: string) => {
    if (!scannerRef.current) return;

    setIsLoading(true);

    try {
      // Detect if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const config: Html5QrcodeCameraScanConfig = {
        fps: isMobile ? 5 : 10, // Lower FPS on mobile for better performance
        qrbox: function(viewfinderWidth, viewfinderHeight) {
          // More aggressive sizing for mobile
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = isMobile 
            ? Math.floor(minEdgeSize * 0.85) // Larger box on mobile (85%)
            : Math.floor(minEdgeSize * 0.7);  // 70% on desktop
          return {
            width: qrboxSize,
            height: qrboxSize
          };
        },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: { ideal: 'environment' },
          // Add mobile-specific video constraints
          ...(isMobile && {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            focusMode: { ideal: 'continuous' }
          })
        }
      };

      const cameraIdToUse = cameraId || cameras[currentCameraIndex]?.id || { facingMode: 'environment' };

      console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
      console.log('Starting scanner with config:', config);
      console.log('Camera ID:', cameraIdToUse);

      await scannerRef.current.start(
        cameraIdToUse,
        config,
        (decodedText, decodedResult) => {
          console.log('QR Code detected:', decodedText);
          
          // Prevent duplicate scans of the same code within 3 seconds
          const now = Date.now();
          const lastScan = lastScannedRef.current;
          
          if (lastScan && lastScan.code === decodedText && (now - lastScan.timestamp) < 3000) {
            // Same code scanned within 3 seconds - ignore
            console.log('Duplicate scan ignored');
            return;
          }
          
          // Update last scanned info
          lastScannedRef.current = { code: decodedText, timestamp: now };
          
          console.log('Processing scan:', decodedText);
          
          // Process the scan
          onScan(decodedText);
          
          // Provide haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
        },
        (errorMessage) => {
          // Only log significant errors, ignore scanning errors
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.log('Scanner error (non-critical):', errorMessage);
          }
        }
      );

      console.log('Scanner started successfully');
      setIsScanning(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      toast.error(err.message || 'Failed to start camera');
      setIsLoading(false);
    }
  };

  const stopScanning = async () => {
    if (!scannerRef.current) return;

    setIsLoading(true);
    try {
      await scannerRef.current.stop();
      setIsScanning(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
      setIsLoading(false);
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) {
      toast.info('Only one camera available');
      return;
    }

    setIsLoading(true);
    await stopScanning();
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    
    setTimeout(() => {
      startScanning(cameras[nextIndex].id);
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Scanner Display */}
      <div className="relative rounded-lg overflow-hidden bg-black/5 min-h-[300px]">
        <div id="qr-reader" className="w-full" />
        
        {/* Overlay when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Camera ready to scan</p>
            </div>
          </div>
        )}
        
        {/* Mobile scanning instructions */}
        {isScanning && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-xs p-3 rounded-lg backdrop-blur-sm md:hidden">
            <p className="font-medium mb-1">📱 Mobile Scanning Tips:</p>
            <ul className="space-y-1">
              <li>• Hold QR code 20-40cm from camera</li>
              <li>• Keep it centered in the green box</li>
              <li>• Ensure good lighting</li>
              <li>• Hold steady for 2-3 seconds</li>
            </ul>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isScanning ? (
          <Button 
            onClick={() => startScanning()} 
            disabled={isLoading || cameras.length === 0}
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
          <>
            <Button 
              onClick={stopScanning} 
              variant="destructive"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </>
              )}
            </Button>
            
            {cameras.length > 1 && (
              <Button 
                onClick={switchCamera} 
                variant="outline"
                disabled={isLoading}
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Camera info */}
      {cameras.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Using: {cameras[currentCameraIndex]?.label || 'Default Camera'}
          {cameras.length > 1 && ` (${currentCameraIndex + 1}/${cameras.length})`}
        </p>
      )}
    </div>
  );
}
