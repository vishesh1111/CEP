'use client';
import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkInRegistration } from '@/lib/actions/checkin';
import { toast } from 'sonner';
import { CheckCircle, User, Calendar, MapPin, Clock, Ticket, AlertCircle, Upload, ImageIcon } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
import Tesseract from 'tesseract.js';

const QrScanner = dynamic(() => import('@/components/admin/qr-scanner-jsqr'), { ssr: false });

interface CheckInResult {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  checked_in: boolean;
  qr_code: string | null;
  registered_at: string;
  user?: {
    name: string;
    email: string;
  };
  event?: {
    title: string;
    event_date: string;
    venue: string;
    category: string;
  };
}

export default function CheckInPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [debugImageUrl, setDebugImageUrl] = useState<string | null>(null);

  const handleScan = async (code: string) => {
    if (loading) return; // Prevent concurrent scans
    
    setLoading(true);
    // Convert to uppercase for consistency
    const upperCode = code.trim().toUpperCase();
    
    // Show processing toast
    const toastId = toast.loading(`Checking in ${upperCode}...`);
    
    const res = await checkInRegistration(upperCode);
    toast.dismiss(toastId);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      // Check if already checked in
      if (res?.alreadyCheckedIn) {
        toast.info('✓ Already checked in', {
          description: res?.data?.user?.name || 'This participant was already checked in',
          duration: 3000,
        });
      } else {
        toast.success('✅ Successfully checked in!', {
          description: res?.data?.user?.name || 'Participant checked in',
          duration: 3000,
        });
      }
      
      if (res?.data) {
        console.log('Check-in data received:', res.data);
        setLastCheckIn(res.data);
        setCheckInHistory(prev => [res.data, ...prev].slice(0, 10));
      } else {
        console.error('No data in response');
      }
      setManualCode('');
    }
    setLoading(false);
  };

  // Handle QR code image upload using multiple decoding strategies
  const decodeQRFromImage = useCallback(async (file: File): Promise<string> => {
    console.log('📷 Starting QR decode for:', file.name, `(${file.size} bytes)`);
    
    // Strategy 1: Try jsQR with multiple scales and preprocessing
    const tryJsQR = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            console.log('🖼️ Image loaded:', img.width, 'x', img.height);

            // Try different scales and processing
            const tryDecode = (scale: number, applyFilter = false) => {
              try {
                const width = Math.floor(img.width * scale);
                const height = Math.floor(img.height * scale);
                
                if (width <= 0 || height <= 0) {
                  console.warn(`Invalid dimensions: ${width}x${height}`);
                  return null;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.clearRect(0, 0, width, height);
                ctx.imageSmoothingEnabled = scale !== 1;
                ctx.imageSmoothingQuality = 'high';
                
                if (applyFilter) {
                  ctx.filter = 'contrast(1.5) brightness(1.1) grayscale(1)';
                } else {
                  ctx.filter = 'none';
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                const imageData = ctx.getImageData(0, 0, width, height);
                
                if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) {
                  console.warn('Invalid image data');
                  return null;
                }
                
                const strategies: Array<'dontInvert' | 'onlyInvert' | 'attemptBoth'> = 
                  ['attemptBoth', 'dontInvert', 'onlyInvert'];
                
                for (const inversionAttempt of strategies) {
                  const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: inversionAttempt,
                  });

                  if (code?.data) {
                    console.log(`✅ jsQR success: scale=${scale}, filter=${applyFilter}, inversion=${inversionAttempt}`);
                    return code.data;
                  }
                }
                
                return null;
              } catch (error) {
                console.warn(`Error in tryDecode at scale ${scale}:`, error);
                return null;
              }
            };

            // Try multiple approaches
            const scales = [1, 2, 3, 4, 1.5, 0.5];
            
            for (const scale of scales) {
              // Try without filter
              const result1 = tryDecode(scale, false);
              if (result1) {
                resolve(result1);
                return;
              }
              
              // Try with filter
              const result2 = tryDecode(scale, true);
              if (result2) {
                resolve(result2);
                return;
              }
            }

            reject(new Error('jsQR: No QR code found'));
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    };

    // Strategy 2: Try html5-qrcode as fallback
    const tryHtml5QrCode = async (): Promise<string> => {
      console.log('🔄 Trying html5-qrcode as fallback...');
      const html5QrCode = new Html5Qrcode('qr-reader-fallback');
      try {
        const result = await html5QrCode.scanFile(file, true);
        console.log('✅ html5-qrcode success:', result);
        return result;
      } catch (error) {
        console.error('❌ html5-qrcode failed:', error);
        throw new Error('html5-qrcode: No QR code found');
      }
    };

    // Strategy 3: Try OCR to extract text from QR code image
    const tryOCR = async (): Promise<string> => {
      console.log('🔤 Trying OCR text extraction as last resort...');
      try {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        
        const text = result.data.text.trim().toUpperCase();
        console.log('📝 OCR extracted text:', text);
        
        // Try to find a QR code pattern in the extracted text
        // QR codes are usually alphanumeric strings
        const matches = text.match(/[A-Z0-9]{10,}/g);
        
        if (matches && matches.length > 0) {
          // Return the longest match (most likely to be the QR code)
          const qrCode = matches.reduce((a, b) => a.length > b.length ? a : b);
          console.log('✅ OCR found potential QR code:', qrCode);
          return qrCode;
        }
        
        throw new Error('OCR: No QR code pattern found in extracted text');
      } catch (error) {
        console.error('❌ OCR failed:', error);
        throw new Error('OCR: Could not extract text from image');
      }
    };

    // Try strategies in order: jsQR -> html5-qrcode -> OCR
    try {
      return await tryJsQR();
    } catch (error1) {
      console.warn('jsQR failed, trying html5-qrcode...', error1);
      try {
        return await tryHtml5QrCode();
      } catch (error2) {
        console.warn('html5-qrcode failed, trying OCR...', error2);
        try {
          return await tryOCR();
        } catch (error3) {
          console.error('All decoding strategies failed');
          throw new Error('Could not decode QR code. Please:\n• Try a clearer image\n• Ensure QR code is fully visible\n• Or enter the code manually');
        }
      }
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Show debug preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setDebugImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    const loadingToast = toast.loading('Analyzing image with multiple methods...');

    try {
      console.log('📷 Processing uploaded image:', file.name, file.size, 'bytes');
      console.log('Image type:', file.type);
      
      const qrCode = await decodeQRFromImage(file);
      console.log('🔍 Successfully decoded QR code:', qrCode);
      
      toast.dismiss(loadingToast);
      toast.success('QR code found!', {
        description: `Code: ${qrCode}`,
        duration: 2000,
      });
      
      // Small delay to show success message
      setTimeout(() => {
        handleScan(qrCode);
        setDebugImageUrl(null); // Clear debug image after success
      }, 500);
    } catch (error: any) {
      console.error('❌ Error decoding QR from image:', error);
      toast.dismiss(loadingToast);
      
      // More helpful error message
      toast.error('Could not read QR code', {
        description: 'Please try: Better lighting, clearer image, or manual entry',
        duration: 5000,
      });
      
      setLoading(false);
      // Keep debug image visible on error so user can see what was uploaded
      setTimeout(() => setDebugImageUrl(null), 3000);
    }
  }, [decodeQRFromImage, handleScan]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      {/* Hidden element for html5-qrcode fallback */}
      <div id="qr-reader-fallback" style={{ display: 'none' }} />
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">QR Code Check-in</h1>
        <p className="text-muted-foreground">Scan student QR codes or enter manually to check them in</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <QrScanner onScan={handleScan} />
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                {debugImageUrl ? (
                  <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <img src={debugImageUrl} alt="Uploaded QR" className="max-w-[200px] max-h-[200px] object-contain border rounded" />
                    <p className="text-xs text-muted-foreground">Analyzing image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
                    {isDragging ? (
                      <>
                        <Upload className="h-10 w-10 text-primary animate-bounce" />
                        <p className="text-sm font-medium text-primary">Drop QR code image here</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Drag & drop QR code image</p>
                          <p className="text-xs text-muted-foreground">or click to browse</p>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Supports: PNG, JPG, JPEG, WebP • Uses 3 detection methods
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or manual entry</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Enter QR code (e.g., REG-A3F7B2)" 
                  value={manualCode} 
                  onChange={e => setManualCode(e.target.value.toUpperCase())} 
                  onKeyPress={e => e.key === 'Enter' && manualCode && handleScan(manualCode)}
                />
                <Button onClick={() => handleScan(manualCode)} disabled={!manualCode || loading}>
                  {loading ? 'Checking...' : 'Check In'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Check-in Details */}
        <div>
          <Card className={lastCheckIn ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastCheckIn ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Last Check-in
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Awaiting Check-in
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastCheckIn ? (
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg">{lastCheckIn.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{lastCheckIn.user?.email || 'No email'}</p>
                      </div>
                      <Badge className="bg-green-500">Checked In</Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    {/* Event Info */}
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{lastCheckIn.event?.title || 'Unknown Event'}</p>
                        <p className="text-sm text-muted-foreground">
                          {lastCheckIn.event?.event_date ? formatDateTime(lastCheckIn.event.event_date) : 'No date'}
                        </p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{lastCheckIn.event?.venue || 'No venue'}</p>
                    </div>

                    {/* Registration Time */}
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Registered: </span>
                        {formatDate(lastCheckIn.registered_at)}
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-muted-foreground" />
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {lastCheckIn.qr_code}
                      </code>
                    </div>

                    {/* Category Badge */}
                    {lastCheckIn.event?.category && (
                      <div className="pt-2">
                        <Badge variant="outline">{lastCheckIn.event.category}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Scan a QR code to see check-in details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Check-in History */}
      {checkInHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkInHistory.map((checkIn, index) => (
                <div 
                  key={checkIn.id + index} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{checkIn.user?.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{checkIn.event?.title}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-muted-foreground">Just now</p>
                    <code className="text-xs font-mono">{checkIn.qr_code}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
