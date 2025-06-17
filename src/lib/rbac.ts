import { getSupabaseClient } from './supabase'
import type { UserWithRoles, Role } from './supabase'

// Permission constants
export const PERMISSIONS = {
  CREATE_CASES: 'can_create_cases',
  ASSIGN_CASES: 'can_assign_cases',
  VIEW_ALL_CASES: 'can_view_all_cases',
  MANAGE_USERS: 'can_manage_users',
  VIEW_FINANCIALS: 'can_view_financials',
  MANAGE_BILLING: 'can_manage_billing',
  ACCESS_ADMIN: 'can_access_admin'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Department constants
export const DEPARTMENTS = {
  FEE_EARNING: 'Fee-Earning',
  PRACTICE_SUPPORT: 'Practice-Support', 
  BUSINESS_OPS: 'Business-Ops',
  ADMIN_SERVICES: 'Admin-Services',
  BUSINESS_DEV: 'Business-Dev',
  COMPLIANCE: 'Compliance',
  SUPPORT_SERVICES: 'Support-Services',
  TRAINEE: 'Trainee'
} as const

// Role level constants
export const ROLE_LEVELS = {
  JUNIOR: 1,
  MID: 2,
  SENIOR: 3,
  DIRECTOR: 4,
  PARTNER: 5
} as const

/**
 * Get current user's profile with roles
 */
export async function getCurrentUserProfile(): Promise<UserWithRoles | null> {
  const supabase = getSupabaseClient()
  console.log('🔧 RBAC: getCurrentUserProfile starting')
  try {
    console.log('🔧 RBAC: Getting current user from Supabase auth')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('🔧 RBAC: Error getting user:', userError)
      return null
    }
    if (!user) {
      console.log('🔧 RBAC: No authenticated user found')
      return null
    }

    console.log('🔧 RBAC: User found, fetching profile', { userId: user.id, email: user.email })
    
    // Simplified query to avoid relationship ambiguity - just get basic profile first
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.log('🔧 RBAC: Database error:', error)
      // If user profile doesn't exist yet, return null gracefully
      if (error.code === 'PGRST116') {
        console.warn('🔧 RBAC: User profile not found, returning null:', user.id)
        return null
      }
      // For now, return a basic profile without roles to avoid blocking auth
      console.warn('🔧 RBAC: Profile query failed, returning basic user data')
      return {
        id: user.id,
        email: user.email || '',
        first_name: null,
        last_name: null,
        display_name: user.email || 'User',
        phone: null,
        title: null,
        department: null,
        office_location: null,
        bio: null,
        is_active: true,
        hire_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_roles: [],
        primary_role: null
      } as unknown as UserWithRoles
    }

    if (!data) {
      console.log('🔧 RBAC: No profile data returned')
      return null
    }

    console.log('🔧 RBAC: Profile data found', { 
      profileId: data.id
    })

    // Return profile without roles for now to avoid relationship issues
    console.log('🔧 RBAC: Profile processing complete (simplified)')

    return {
      ...data,
      user_roles: [], // Temporarily empty to avoid relationship issues
      primary_role: null
    }
  } catch (error) {
    console.error('🔧 RBAC: Error fetching user profile:', error)
    return null
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: UserWithRoles | null, permission: Permission): boolean {
  if (!user || !user.user_roles) return false
  
  return user.user_roles.some(userRole => {
    const role = userRole.role
    if (!role) return false
    
    switch (permission) {
      case PERMISSIONS.CREATE_CASES:
        return role.can_create_cases
      case PERMISSIONS.ASSIGN_CASES:
        return role.can_assign_cases
      case PERMISSIONS.VIEW_ALL_CASES:
        return role.can_view_all_cases
      case PERMISSIONS.MANAGE_USERS:
        return role.can_manage_users
      case PERMISSIONS.VIEW_FINANCIALS:
        return role.can_view_financials
      case PERMISSIONS.MANAGE_BILLING:
        return role.can_manage_billing
      case PERMISSIONS.ACCESS_ADMIN:
        return role.can_access_admin
      default:
        return false
    }
  })
}

/**
 * Get user's highest role level
 */
export function getUserMaxLevel(user: UserWithRoles | null): number {
  if (!user || !user.user_roles) return 0
  
  return Math.max(...user.user_roles.map(ur => ur.role?.level || 0))
}

/**
 * Check if user is senior level or above (level 3+)
 */
export function isSeniorLevel(user: UserWithRoles | null): boolean {
  return getUserMaxLevel(user) >= ROLE_LEVELS.SENIOR
}

/**
 * Check if user is partner level (level 4+)
 */
export function isPartnerLevel(user: UserWithRoles | null): boolean {
  return getUserMaxLevel(user) >= ROLE_LEVELS.DIRECTOR
}

/**
 * Check if user can view a specific case
 */
export async function canViewCase(caseId: string, userId?: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase
      .rpc('can_access_case', {
        p_case_id: caseId,
        p_user_id: userId || (await supabase.auth.getUser()).data.user?.id
      })

    if (error) throw error
    return data === true
  } catch (error) {
    console.error('Error checking case access:', error)
    return false
  }
}

/**
 * Get user's department
 */
export function getUserDepartment(user: UserWithRoles | null): string | null {
  return user?.department || user?.primary_role?.department || null
}

/**
 * Check if user is billable
 */
export function isBillable(user: UserWithRoles | null): boolean {
  if (!user || !user.user_roles) return false
  return user.user_roles.some(ur => ur.role?.is_billable)
}

/**
 * Get user's role display names
 */
export function getUserRoleNames(user: UserWithRoles | null): string[] {
  if (!user || !user.user_roles) return []
  return user.user_roles.map(ur => ur.role?.display_name || '').filter(Boolean)
}

/**
 * Role-based UI helpers
 */
export const RoleGuard = {
  canCreateCases: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.CREATE_CASES),
  canAssignCases: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.ASSIGN_CASES),
  canViewAllCases: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.VIEW_ALL_CASES),
  canManageUsers: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.MANAGE_USERS),
  canViewFinancials: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.VIEW_FINANCIALS),
  canManageBilling: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.MANAGE_BILLING),
  canAccessAdmin: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.ACCESS_ADMIN),
  
  // Convenience methods
  isLegalStaff: (user: UserWithRoles | null) => getUserDepartment(user) === DEPARTMENTS.FEE_EARNING,
  isAdmin: (user: UserWithRoles | null) => hasPermission(user, PERMISSIONS.ACCESS_ADMIN),
  isSenior: (user: UserWithRoles | null) => isSeniorLevel(user),
  isPartner: (user: UserWithRoles | null) => isPartnerLevel(user)
} 