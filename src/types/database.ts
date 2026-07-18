// Database types for Supabase
export type UserRole = 'student' | 'admin';
export type RegistrationStatus = 'confirmed' | 'cancelled';
export type EventCategory = 'technology' | 'cultural' | 'workshop' | 'sports' | 'seminar' | 'social' | 'general';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  category: EventCategory;
  venue: string;
  event_date: string;
  registration_deadline: string;
  total_seats: number;
  seats_remaining: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Registration = {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  qr_code: string | null;
  checked_in: boolean;
  registered_at: string;
};

export type RegistrationWithEvent = Registration & {
  events: Event;
};

export type RegistrationWithUser = Registration & {
  users: User;
};

export type Announcement = {
  id: string;
  event_id: string | null;
  title: string;
  message: string;
  posted_by: string | null;
  posted_at: string;
};

export type AnnouncementWithEvent = Announcement & {
  events: Event | null;
};

export type Feedback = {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type Waitlist = {
  id: string;
  user_id: string;
  event_id: string;
  joined_at: string;
  notified: boolean;
};

// Database schema type for Supabase client
// Must satisfy GenericSchema: { Tables, Views, Functions }
// Uses `type` aliases (not `interface`) for Row/Insert/Update so they have
// implicit index signatures and satisfy Record<string, unknown>.
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id'>>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Event, 'id'>>;
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, 'id' | 'registered_at' | 'qr_code' | 'checked_in'> & {
          id?: string;
          registered_at?: string;
          qr_code?: string;
          checked_in?: boolean;
        };
        Update: Partial<Omit<Registration, 'id'>>;
        Relationships: [
          {
            foreignKeyName: 'registrations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'registrations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          }
        ];
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'posted_at'> & {
          id?: string;
          posted_at?: string;
        };
        Update: Partial<Omit<Announcement, 'id'>>;
        Relationships: [
          {
            foreignKeyName: 'announcements_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'announcements_posted_by_fkey';
            columns: ['posted_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Feedback, 'id'>>;
        Relationships: [
          {
            foreignKeyName: 'feedback_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      waitlist: {
        Row: Waitlist;
        Insert: Omit<Waitlist, 'id' | 'joined_at' | 'notified'> & {
          id?: string;
          joined_at?: string;
          notified?: boolean;
        };
        Update: Partial<Omit<Waitlist, 'id'>>;
        Relationships: [
          {
            foreignKeyName: 'waitlist_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'waitlist_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      register_for_event: {
        Args: { p_event_id: string; p_user_id: string };
        Returns: Registration;
      };
      cancel_registration: {
        Args: { p_registration_id: string; p_user_id: string };
        Returns: undefined;
      };
      check_in_registration: {
        Args: { p_qr_code: string };
        Returns: Registration;
      };
    };
  };
};

// Event categories with display labels
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'sports', label: 'Sports' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'social', label: 'Social' },
  { value: 'general', label: 'General' },
];

// Category color mapping for badges
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  technology: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  cultural: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  workshop: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  sports: 'bg-green-500/10 text-green-500 border-green-500/20',
  seminar: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  social: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  general: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};
