'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkInRegistration } from '@/lib/actions/checkin';
import { toast } from 'sonner';

const QrScanner = dynamic(() => import('@/components/admin/qr-scanner'), { ssr: false });

export default function CheckInPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (code: string) => {
    setLoading(true);
    const res = await checkInRegistration(code);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Successfully checked in!');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-center">QR Check-in</h1>
      
      <div className="p-4 border rounded-md bg-muted/50">
        <QrScanner onScan={handleScan} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or manual entry</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Enter QR code string..." 
          value={manualCode} 
          onChange={e => setManualCode(e.target.value)} 
        />
        <Button onClick={() => handleScan(manualCode)} disabled={!manualCode || loading}>
          Check In
        </Button>
      </div>
    </div>
  );
}
