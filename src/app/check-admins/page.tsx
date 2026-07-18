import { createClient } from '@/lib/supabase/server';

export default async function CheckAdminsPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Get admin users
  const adminUsers = allUsers?.filter(u => u.role === 'admin') || [];
  const studentUsers = allUsers?.filter(u => u.role === 'student') || [];
  
  // Get current user's role
  const currentUserData = allUsers?.find(u => u.id === user?.id);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Admin Status Check</h1>
      
      {/* Current User */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {currentUserData?.name || 'Unknown'}</p>
            <p>
              <strong>Role:</strong>{' '}
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                currentUserData?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUserData?.role || 'Unknown'}
              </span>
            </p>
            <p><strong>User ID:</strong> {user.id.substring(0, 20)}...</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Not logged in</p>
        )}
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{allUsers?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{adminUsers.length}</div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{studentUsers.length}</div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>
      
      {/* Admin Users */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Admin Users {adminUsers.length > 0 && `(${adminUsers.length})`}
        </h2>
        
        {adminUsers.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
            <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              ⚠️ No admin users found!
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              You need to create an admin user manually via SQL.
            </p>
            <div className="bg-white dark:bg-gray-900 rounded p-3 mt-3">
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                Run this in Supabase SQL Editor:
              </p>
              <code className="text-xs block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                UPDATE public.users<br/>
                SET role = 'admin'<br/>
                WHERE email = 'your-email@example.com';
              </code>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {adminUsers.map((admin) => (
              <div key={admin.id} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(admin.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    ADMIN
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Student Users (First 5) */}
      {studentUsers.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Students (showing {Math.min(5, studentUsers.length)} of {studentUsers.length})
          </h2>
          <div className="space-y-2">
            {studentUsers.slice(0, 5).map((student) => (
              <div key={student.id} className="border-b last:border-0 pb-2 last:pb-0">
                <p className="font-medium text-sm">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Required */}
      {adminUsers.length === 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📋 Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>Register a user account if you haven't already</li>
            <li>Copy your email from the registration</li>
            <li>Open Supabase Dashboard → SQL Editor</li>
            <li>Run the UPDATE command shown above with your email</li>
            <li>Refresh this page to verify</li>
          </ol>
        </div>
      )}
    </div>
  );
}
