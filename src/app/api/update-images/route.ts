import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in as admin.' }, { status: 401 });
  }

  const updates = [
    { match: '%CodeStorm Hackathon%', image: '/CodeStormHackathon.jpg' },
    { match: '%Guest Lecture%', image: '/Guestlecture.jpg' },
    { match: '%Movie Night%', image: '/MOVIENIGHT.jpg' },
    { match: '%Blood Donation%', image: '/BloodDonation.jpg' },
    { match: '%Live Coding%', image: '/CodingContest.jpg' },
    { match: '%Future of AI%', image: '/FutureOfAI.png' },
    { match: '%Annual Music Fest%', image: '/AnnualMusicFest.png' },
    { match: '%Web Development%', image: '/webdevbootcamp.png' },
    { match: '%Career Fair%', image: '/CareerFair.png' },
    { match: '%Basketball%', image: '/Basketball.png' },
    { match: '%Marathon%', image: '/MarathonForCharity.jpg' },
    { match: '%Spectrum%', image: '/AnnualMusicFest.png' }, // Fallback for Spectrum
  ];

  let successCount = 0;
  
  for (const update of updates) {
    const { error } = await supabase
      .from('events')
      .update({ banner_url: update.image })
      .ilike('title', update.match);
      
    if (!error) successCount++;
  }

  return NextResponse.json({ success: true, message: `Updated images for ${successCount} event categories successfully.` });
}
