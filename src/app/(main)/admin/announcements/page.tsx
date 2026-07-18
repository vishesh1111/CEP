import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteAnnouncement } from '@/lib/actions/announcements';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase.from('announcements').select('*, events(title)').order('posted_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
      <div className="space-y-4">
        {announcements?.map(ann => (
          <div key={ann.id} className="p-4 border rounded-md relative group">
            <h3 className="font-semibold">{ann.title}</h3>
            {ann.events && <p className="text-sm text-muted-foreground mb-2">Event: {ann.events.title}</p>}
            <p className="text-sm mt-2">{ann.message}</p>
            <p className="text-xs text-muted-foreground mt-4">{formatDate(ann.posted_at)}</p>
            
            <form action={async () => {
              'use server';
              await deleteAnnouncement(ann.id);
            }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button type="submit" variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ))}
        {(!announcements || announcements.length === 0) && (
          <p className="text-muted-foreground">No announcements found.</p>
        )}
      </div>
    </div>
  );
}
