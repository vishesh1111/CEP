import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteAnnouncement } from '@/lib/actions/announcements';
import { AnnouncementForm } from '@/components/admin/announcement-form';
import { Badge } from '@/components/ui/badge';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  
  // Get all events for the dropdown
  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .order('event_date', { ascending: false });
  
  // Get all announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, events(title)')
    .order('posted_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Announcements</h1>
        <p className="text-muted-foreground">
          Create general announcements or event-specific updates for students.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Create Announcement Form */}
        <AnnouncementForm events={events || []} />

        {/* Existing Announcements */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Announcements</h2>
          <div className="space-y-4">
            {announcements?.map(ann => (
              <div key={ann.id} className="p-5 border rounded-lg relative group hover:shadow-sm transition-shadow bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{ann.title}</h3>
                      {ann.event_id ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Event-Specific
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          General
                        </Badge>
                      )}
                    </div>
                    
                    {ann.events && (
                      <p className="text-sm text-muted-foreground mb-2">
                        📅 Event: {ann.events.title}
                      </p>
                    )}
                    
                    <p className="text-sm mt-2 whitespace-pre-wrap">{ann.message}</p>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      Posted on {formatDate(ann.posted_at)}
                    </p>
                  </div>
                  
                  <form action={async () => {
                    'use server';
                    await deleteAnnouncement(ann.id);
                  }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            
            {(!announcements || announcements.length === 0) && (
              <div className="text-center py-12 bg-muted/30 rounded-lg border-dashed border-2">
                <p className="text-muted-foreground">
                  No announcements yet. Create your first announcement above!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
