import { Bell, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
}

export function AnnouncementsFeed({ announcements }: AnnouncementsFeedProps) {
  if (announcements.length === 0) {
    return (
      <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
        <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-medium mb-1">No announcements</h3>
        <p className="text-sm text-muted-foreground mb-4">You're all caught up! There are no new announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0">
                <div className={`p-2 rounded-full ${announcement.event_id ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {announcement.event_id ? <Bell className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
              </div>
              <div className="space-y-1 w-full">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h4 className="font-semibold text-base">{announcement.title}</h4>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(announcement.posted_at)}
                  </div>
                </div>
                
                {announcement.event_id && (
                  <Badge variant="outline" className="mb-2 font-normal text-xs">
                    Event Update
                  </Badge>
                )}
                
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                  {announcement.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
