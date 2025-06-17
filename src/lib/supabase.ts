import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Debug logging for environment variables
console.log('Environment debug:', {
  NODE_ENV: process.env.NODE_ENV,
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
})

// Fallback values for when Supabase is not available
const FALLBACK_URL = 'https://dummy.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.SIGNING_KEY_DUMMY'

// Validate environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY

console.log('Creating Supabase client with URL:', supabaseUrl)

let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Use fallback values instead of throwing error
  const finalUrl = url || FALLBACK_URL
  const finalKey = key || FALLBACK_KEY

  console.log('🔧 Supabase: Creating client', { 
    hasRealUrl: !!url, 
    hasRealKey: !!key,
    finalUrl: finalUrl.includes('dummy') ? 'FALLBACK' : 'REAL'
  })

  supabaseClient = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (url, options) => {
        if (url.toString().includes('dummy.supabase.co') || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          console.warn('🔧 Supabase: Using fallback response for', url.toString())
          return Promise.resolve(new Response(JSON.stringify({ 
            error: { message: 'Supabase not available in development' } 
          }), { 
            status: 503, 
            headers: { 'content-type': 'application/json' } 
          }))
        }
        return fetch(url, options)
      }
    }
  })
  
  console.log('🔧 Supabase: Client created successfully')
  return supabaseClient
}

// Keep existing type exports
export type { User, Session } from '@supabase/supabase-js'

// Database types based on our schema
export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  title: string
  description: string | null
  status: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  client_id: string
  assigned_user_id: string | null
  due_date: string | null
  kanban_stage_id: string | null
  team_id: string | null
  case_type_id: string | null
  source: string | null
  // Relationships
  client?: Client
  team?: Team
  case_type?: CaseType
  kanban_stage?: KanbanStage
}

export interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface CaseType {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface KanbanStage {
  id: string
  name: string
  description: string | null
  order_index: number
  created_at: string
}

export interface Document {
  id: string
  name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  case_id: string
  uploaded_by: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  assigned_to: string | null
  case_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// RBAC System Types
export interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  department: string
  level: number
  is_billable: boolean
  can_create_cases: boolean
  can_assign_cases: boolean
  can_view_all_cases: boolean
  can_manage_users: boolean
  can_view_financials: boolean
  can_manage_billing: boolean
  can_access_admin: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  phone: string | null
  title: string | null
  department: string | null
  office_location: string | null
  is_active: boolean
  hire_date: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_by: string | null
  assigned_at: string
  is_primary: boolean
  role?: Role
}

export interface UserWithRoles extends UserProfile {
  user_roles: (UserRole & { role: Role })[]
  primary_role?: Role
} 