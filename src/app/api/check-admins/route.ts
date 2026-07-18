import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Get all users
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });
    
    if (allError) {
      return NextResponse.json({
        success: false,
        error: allError.message
      }, { status: 500 });
    }
    
    // Get admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    
    // Get student count
    const { data: studentUsers } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    let currentUser = null;
    
    if (user) {
      const userData = allUsers?.find(u => u.id === user.id);
      currentUser = {
        id: user.id,
        email: user.email,
        role: userData?.role || 'unknown',
        name: userData?.name || 'Unknown'
      };
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: allUsers?.length || 0,
        totalAdmins: adminUsers?.length || 0,
        totalStudents: studentUsers?.length || 0,
      },
      currentUser: currentUser || { message: 'Not logged in' },
      admins: adminUsers?.map(admin => ({
        email: admin.email,
        name: admin.name,
        created_at: new Date(admin.created_at).toLocaleString(),
        id: admin.id.substring(0, 8) + '...'
      })) || [],
      students: studentUsers?.slice(0, 5).map(student => ({
        email: student.email,
        name: student.name,
        created_at: new Date(student.created_at).toLocaleString()
      })) || [],
      message: adminUsers?.length === 0 
        ? '⚠️ No admin users found! You need to create one manually via SQL.' 
        : `✅ Found ${adminUsers?.length || 0} admin user(s)`
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
