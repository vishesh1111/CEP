import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'qrcode';

export default async function TestQRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get confirmed registrations with QR codes
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      users (name, email),
      events (title)
    `)
    .eq('status', 'confirmed')
    .not('qr_code', 'is', null)
    .order('registered_at', { ascending: false })
    .limit(10);

  // Generate QR code images
  const qrCodesWithImages = await Promise.all(
    (registrations || []).map(async (reg: any) => {
      const qrDataUrl = await QRCode.toDataURL(reg.qr_code, {
        width: 300,
        margin: 2,
      });
      return {
        ...reg,
        qrImage: qrDataUrl,
      };
    })
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Test QR Codes</h1>
        <p className="text-muted-foreground">
          Valid QR codes from confirmed registrations - Use these to test the scanner
        </p>
      </div>

      {qrCodesWithImages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No confirmed registrations found. Create an event and register for it first.
              </p>
              <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                <p className="font-semibold">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create an event at /admin/events/new</li>
                  <li>Register for it (as a regular user)</li>
                  <li>Come back here to get the test QR code</li>
                  <li>Use it to test the scanner</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qrCodesWithImages.map((reg: any) => (
            <Card key={reg.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {reg.users?.name || 'Unknown User'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {reg.events?.title || 'Unknown Event'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={reg.qrImage}
                    alt={`QR Code: ${reg.qr_code}`}
                    className="w-64 h-64"
                  />
                </div>

                {/* QR Code Text */}
                <div className="text-center">
                  <code className="text-sm bg-muted px-3 py-1 rounded font-mono">
                    {reg.qr_code}
                  </code>
                </div>

                {/* Status */}
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    reg.checked_in 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {reg.checked_in ? '✓ Already Checked In' : 'Ready to Check In'}
                  </span>
                </div>

                {/* Instructions */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <p>Use this QR code to test the scanner</p>
                  <p className="mt-1">Scanner allows re-scanning even if checked in</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-semibold mb-2">Desktop Testing:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open this page on your computer</li>
              <li>Open /admin/check-in on your phone</li>
              <li>Point phone camera at QR code on screen</li>
              <li>Scanner should detect it immediately</li>
            </ol>
          </div>
          
          <div>
            <p className="font-semibold mb-2">Mobile Testing (Image Upload):</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Screenshot one of the QR codes above</li>
              <li>Go to /admin/check-in</li>
              <li>Use "Drag & drop QR code image" feature</li>
              <li>Upload the screenshot</li>
              <li>Should process immediately</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold mb-2">Manual Entry Testing:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Copy the code text (e.g., REG-ABC123)</li>
              <li>Go to /admin/check-in</li>
              <li>Paste in manual entry field</li>
              <li>Click "Check In"</li>
              <li>Should process immediately</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
