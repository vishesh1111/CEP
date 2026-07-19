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
  const [isMobile, setIsMobile] = useState(false);

  // Initialize scanner and get available cameras
  useEffect(() => {
    // Detect mobile
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    console.log('Device detected:', checkMobile ? 'Mobile' : 'Desktop');
    
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          console.log('Available cameras:', devices);
          setCameras(devices.map(device => ({
            id: device.id,
            label: device.label || `Camera ${device.id.slice(0, 8)}`
          })));
          
          // On mobile, try to select the rear camera by default
          if (checkMobile && devices.length > 1) {
            const rearCameraIndex = devices.findIndex(d => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            if (rearCameraIndex !== -1) {
              setCurrentCameraIndex(rearCameraIndex);
              console.log('Rear camera found at index:', rearCameraIndex);
            }
          }
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
      console.log('=== STARTING SCANNER ===');
      console.log('Device type:', isMobile ? 'MOBILE' : 'DESKTOP');
      console.log('Current camera index:', currentCameraIndex);
      console.log('Available cameras:', cameras.length);
      
      // Mobile requires more aggressive settings
      const config: Html5QrcodeCameraScanConfig = {
        fps: isMobile ? 3 : 10, // Even lower FPS on mobile (was 5, now 3)
        qrbox: isMobile 
          ? { width: 250, height: 250 } // Fixed size on mobile for consistency
          : function(viewfinderWidth, viewfinderHeight) {
              const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdgeSize * 0.7);
              return { width: qrboxSize, height: qrboxSize };
            },
        aspectRatio: 1.0,
        disableFlip: false,
        // More aggressive mobile constraints
        videoConstraints: isMobile ? {
          facingMode: 'environment', // Force rear camera
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        } : {
          facingMode: { ideal: 'environment' }
        }
      };

      // Determine camera to use
      let cameraIdToUse: any;
      if (cameraId) {
        cameraIdToUse = cameraId;
      } else if (cameras.length > 0) {
        cameraIdToUse = cameras[currentCameraIndex].id;
      } else {
        // Fallback to environment facing mode
        cameraIdToUse = { facingMode: 'environment' };
      }

      console.log('Config:', JSON.stringify(config, null, 2));
      console.log('Camera to use:', cameraIdToUse);

      await scannerRef.current.start(
        cameraIdToUse,
        config,
        (decodedText, decodedResult) => {
          console.log('🎯 QR CODE DETECTED:', decodedText);
          
          // Prevent duplicate scans of the same code within 3 seconds
          const now = Date.now();
          const lastScan = lastScannedRef.current;
          
          if (lastScan && lastScan.code === decodedText && (now - lastScan.timestamp) < 3000) {
            console.log('⏭️  Duplicate scan ignored (within 3s)');
            return;
          }
          
          // Update last scanned info
          lastScannedRef.current = { code: decodedText, timestamp: now };
          
          console.log('✅ Processing scan:', decodedText);
          
          // Process the scan
          onScan(decodedText);
          
          // Provide haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(200);
            console.log('📳 Haptic feedback triggered');
          }
        },
        (errorMessage) => {
          // Only log significant errors, ignore NotFoundExceptions
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.warn('⚠️  Scanner error:', errorMessage);
          }
        }
      );

      console.log('✅ Scanner started successfully');
      console.log('Scanner state:', scannerRef.current.getState());
      setIsScanning(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ Error starting scanner:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
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
              {isMobile && (
                <p className="text-xs text-muted-foreground mt-2">Mobile device detected</p>
              )}
            </div>
          </div>
        )}
        
        {/* Mobile scanning instructions - MORE PROMINENT */}
        {isScanning && isMobile && (
          <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white text-sm p-4 rounded-lg shadow-lg">
            <p className="font-bold mb-2">📱 MOBILE SCANNING MODE</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Rear camera active</li>
              <li>✓ Hold QR 25-35cm away</li>
              <li>✓ Keep centered & steady</li>
              <li>✓ Wait 3-5 seconds</li>
            </ul>
          </div>
        )}
        
        {/* Desktop instructions */}
        {isScanning && !isMobile && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-xs p-3 rounded-lg backdrop-blur-sm">
            <p>Hold QR code centered in the green box. Detection typically takes 1-2 seconds.</p>
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
