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

const QrScanner = dynamic(() => import('@/components/admin/qr-scanner'), { ssr: false });

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

  const handleScan = async (code: string) => {
    setLoading(true);
    // Convert to uppercase for consistency
    const upperCode = code.trim().toUpperCase();
    const res = await checkInRegistration(upperCode);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Successfully checked in!');
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

  // Handle QR code image upload using html5-qrcode
  const decodeQRFromImage = useCallback(async (file: File) => {
    const html5QrCode = new Html5Qrcode('temp-reader');
    try {
      const qrCodeMessage = await html5QrCode.scanFile(file, true);
      return qrCodeMessage;
    } catch (error: any) {
      throw new Error('No QR code found in image');
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setLoading(true);
    toast.loading('Scanning QR code from image...');

    try {
      const qrCode = await decodeQRFromImage(file);
      toast.dismiss();
      await handleScan(qrCode);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to decode QR code from image');
      setLoading(false);
    }
  }, [decodeQRFromImage]);

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
      {/* Hidden element for html5-qrcode file scanning */}
      <div id="temp-reader" style={{ display: 'none' }} />
      
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
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                  {isDragging ? (
                    <>
                      <Upload className="h-8 w-8 text-primary animate-bounce" />
                      <p className="text-sm font-medium text-primary">Drop QR code image here</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag & drop QR code image</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </>
                  )}
                </div>
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
