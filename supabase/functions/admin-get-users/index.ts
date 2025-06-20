// Follow Deno and Supabase Edge Function conventions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  order?: string;
  role?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    // Create Supabase client with Admin privileges using environment variables
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Verify the calling user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Check if user is admin by querying their role from profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      return new Response(JSON.stringify({ error: 'Failed to verify admin status', details: profileError }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Verify the user is an admin
    if (profileData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Parse the request body to get query parameters
    const { page = 1, limit = 20, search = '', order = 'created_at', role = '' }: UserQuery = await req.json()
    
    // Create a query to the auth.users table using admin privileges
    let query = supabaseAdmin.auth.admin.listUsers({ 
      page: page - 1, // Supabase uses 0-indexed pages
      perPage: limit,
    })

    // Execute query
    const { data: { users }, error: usersError } = await query

    if (usersError) {
      return new Response(JSON.stringify({ error: 'Error fetching users', details: usersError }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // If search is provided, filter users client-side (since auth.listUsers doesn't support filtering)
    let filteredUsers = users
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = users.filter(user => 
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.includes(search)) ||
        (user.user_metadata?.full_name && 
          user.user_metadata.full_name.toLowerCase().includes(searchLower))
      )
    }

    // If role filter is provided, fetch matching profiles and filter users
    if (role) {
      const { data: roleProfiles, error: roleError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', role)
      
      if (!roleError && roleProfiles) {
        const roleIds = roleProfiles.map(profile => profile.id)
        filteredUsers = filteredUsers.filter(user => roleIds.includes(user.id))
      }
    }

    // Get total user count for pagination
    const { data: { users: allUsers }, error: countError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1,
    })

    if (countError) {
      console.error('Error getting total count:', countError)
    }

    // Return the filtered users
    return new Response(JSON.stringify({
      users: filteredUsers,
      total: allUsers?.length || 0,
      page,
      limit
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}) 