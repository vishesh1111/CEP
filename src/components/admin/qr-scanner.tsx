'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    
    scanner.render((decodedText) => {
      if (!scanned) {
        setScanned(true);
        onScan(decodedText);
        setTimeout(() => setScanned(false), 3000); // prevent multi scans
      }
    }, (error) => {
      // ignore
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, scanned]);

  return <div id="qr-reader" className="w-full" />;
}
