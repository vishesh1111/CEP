'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User } from '@/types/database';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    
    const res = await updateProfile({ name });
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Profile updated');
      setUser(prev => prev ? { ...prev, name } : null);
    }
    setUpdating(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <div className="p-6 border rounded-md space-y-4">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email (Cannot be changed)</label>
            <Input defaultValue={user.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Input defaultValue={user.role} disabled className="capitalize" />
          </div>
          <Button type="submit" disabled={updating}>
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
