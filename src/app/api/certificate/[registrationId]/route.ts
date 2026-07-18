import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Certificate } from '@/lib/pdf/certificate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Fetch registration with event and user details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        user_id,
        checked_in,
        events (
          id,
          title,
          event_date,
          venue
        ),
        users (
          name,
          email
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (registration.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to download this certificate.' },
        { status: 403 }
      );
    }

    // Verify checked in
    if (!registration.checked_in) {
      return NextResponse.json(
        { error: 'Certificate not available. You must be checked in at the event to receive a certificate.' },
        { status: 403 }
      );
    }

    // Extract data
    const event = registration.events as any;
    const userInfo = registration.users as any;

    if (!event || !userInfo) {
      return NextResponse.json(
        { error: 'Event or user data not found.' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(Certificate, {
        studentName: userInfo.name,
        eventTitle: event.title,
        eventDate: event.event_date,
        venue: event.venue,
      }) as any
    );

    // Create safe filename
    const safeFileName = event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${safeFileName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate. Please try again later.' },
      { status: 500 }
    );
  }
}
