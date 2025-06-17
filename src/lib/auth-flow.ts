/**
 * Authentication Flow for Law Firm Platform
 * Handles firm signup vs user signin, and AD integration
 */

import { createClient } from '@supabase/supabase-js';

// Types for our authentication system
interface FirmSignupData {
  firmName: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  paymentId: string;
}

interface UserInviteData {
  name: string;
  email: string;
  role: 'admin' | 'partner' | 'associate' | 'paralegal' | 'client';
  department?: string;
  firmId: string;
}

interface ActiveDirectoryConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  syncEnabled: boolean;
  groupMapping: Record<string, string>;
}

/**
 * FIRM SIGNUP FLOW
 * This happens when a law firm first purchases and sets up their account
 */
export class FirmSignupFlow {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Step 1: Process firm signup after payment
   */
  async processFirmSignup(signupData: FirmSignupData) {
    try {
      // 1. Create firm record
      const { data: firm, error: firmError } = await this.supabase
        .from('firms')
        .insert({
          name: signupData.firmName,
          domain: signupData.domain,
          subscription_tier: signupData.subscriptionTier,
          payment_id: signupData.paymentId,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (firmError) throw firmError;

      // 2. Create admin user account
      const { data: adminUser, error: authError } = await this.supabase.auth.admin
        .createUser({
          email: signupData.adminEmail,
          password: this.generateTemporaryPassword(),
          email_confirm: true,
          user_metadata: {
            name: signupData.adminName,
            role: 'admin',
            firm_id: firm.id
          }
        });

      if (authError) throw authError;

      // 3. Create firm_users relationship
      await this.supabase
        .from('firm_users')
        .insert({
          firm_id: firm.id,
          user_id: adminUser.user.id,
          role: 'admin',
          status: 'active',
          invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString()
        });

      // 4. Send onboarding email
      await this.sendOnboardingEmail(signupData.adminEmail, firm.id);

      return {
        success: true,
        firmId: firm.id,
        adminUserId: adminUser.user.id,
        onboardingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?firm=${firm.id}&token=${this.generateOnboardingToken(firm.id)}`
      };

    } catch (error) {
      console.error('Firm signup error:', error);
      return { success: false, error: error.message };
    }
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!';
  }

  private generateOnboardingToken(firmId: string): string {
    // Generate secure token for onboarding
    return Buffer.from(`${firmId}:${Date.now()}`).toString('base64');
  }

  private async sendOnboardingEmail(email: string, firmId: string) {
    // Implementation would integrate with email service (SendGrid, etc.)
    console.log(`Sending onboarding email to ${email} for firm ${firmId}`);
  }
}

/**
 * USER SIGNIN FLOW
 * This handles existing users logging into their firm's platform
 */
export class UserSigninFlow {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Standard email/password signin
   */
  async signInWithEmail(email: string, password: string) {
    try {
      // 1. Authenticate user
      const { data: authData, error: authError } = await this.supabase.auth
        .signInWithPassword({ email, password });

      if (authError) throw authError;

      // 2. Get user's firm association
      const { data: firmUser, error: firmError } = await this.supabase
        .from('firm_users')
        .select(`
          *,
          firms (
            id,
            name,
            domain,
            subscription_tier,
            status
          )
        `)
        .eq('user_id', authData.user.id)
        .eq('status', 'active')
        .single();

      if (firmError) throw firmError;

      // 3. Update last login
      await this.supabase
        .from('firm_users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      return {
        success: true,
        user: authData.user,
        firm: firmUser.firms,
        role: firmUser.role,
        permissions: this.getRolePermissions(firmUser.role)
      };

    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * SSO signin with Active Directory
   */
  async signInWithSSO(samlResponse: string) {
    try {
      // 1. Validate SAML response
      const userInfo = await this.validateSAMLResponse(samlResponse);
      
      // 2. Get or create user
      let user = await this.getUserByEmail(userInfo.email);
      
      if (!user) {
        // Auto-provision user from AD
        user = await this.provisionUserFromAD(userInfo);
      }

      // 3. Update user info from AD
      await this.syncUserFromAD(user.id, userInfo);

      return {
        success: true,
        user,
        firm: user.firm,
        role: user.role,
        ssoProvider: 'active_directory'
      };

    } catch (error) {
      console.error('SSO signin error:', error);
      return { success: false, error: error.message };
    }
  }

  private getRolePermissions(role: string) {
    const permissions = {
      admin: ['all'],
      partner: ['cases:all', 'documents:all', 'users:read', 'analytics:read'],
      associate: ['cases:assigned', 'documents:case', 'users:read'],
      paralegal: ['cases:assigned', 'documents:case', 'users:read'],
      client: ['cases:own', 'documents:own']
    };
    return permissions[role as keyof typeof permissions] || [];
  }

  private async validateSAMLResponse(samlResponse: string) {
    // SAML validation logic
    return {
      email: 'user@domain.com',
      name: 'User Name',
      groups: ['Partners', 'Corporate Law'],
      attributes: {}
    };
  }

  private async getUserByEmail(email: string) {
    const { data } = await this.supabase
      .from('firm_users')
      .select('*, firms(*)')
      .eq('email', email)
      .single();
    return data;
  }

  private async provisionUserFromAD(userInfo: any) {
    // Auto-provision user from Active Directory
    const role = this.mapADGroupsToRole(userInfo.groups);
    
    // Create user account
    // Associate with firm
    // Set permissions
    
    return userInfo;
  }

  private async syncUserFromAD(userId: string, userInfo: any) {
    // Sync user attributes from AD
  }

  private mapADGroupsToRole(groups: string[]): string {
    const groupMapping = {
      'Partners': 'partner',
      'Associates': 'associate',
      'Paralegals': 'paralegal',
      'Administrators': 'admin'
    };

    for (const group of groups) {
      if (groupMapping[group as keyof typeof groupMapping]) {
        return groupMapping[group as keyof typeof groupMapping];
      }
    }
    return 'associate'; // default role
  }
}

/**
 * USER MANAGEMENT FLOW
 * This handles adding new users to existing firms
 */
export class UserManagementFlow {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Manual user invitation by admin
   */
  async inviteUser(inviteData: UserInviteData) {
    try {
      // 1. Validate admin has permission
      const canInvite = await this.validateInvitePermission(inviteData.firmId);
      if (!canInvite) throw new Error('Insufficient permissions');

      // 2. Check email domain matches firm domain
      const firmDomain = await this.getFirmDomain(inviteData.firmId);
      const emailDomain = inviteData.email.split('@')[1];
      if (emailDomain !== firmDomain) {
        throw new Error(`Email must be from ${firmDomain} domain`);
      }

      // 3. Create pending user record
      const { data: invitation, error } = await this.supabase
        .from('user_invitations')
        .insert({
          firm_id: inviteData.firmId,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          department: inviteData.department,
          invited_by: 'current_admin_id',
          invitation_token: this.generateInvitationToken(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Send invitation email
      await this.sendInvitationEmail(invitation);

      return { success: true, invitationId: invitation.id };

    } catch (error) {
      console.error('User invitation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * CSV bulk import
   */
  async bulkImportUsers(firmId: string, csvData: any[]) {
    const results = [];
    
    for (const userData of csvData) {
      try {
        const result = await this.inviteUser({
          firmId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department: userData.department
        });
        results.push({ ...userData, result });
      } catch (error) {
        results.push({ ...userData, result: { success: false, error: error.message } });
      }
    }

    return {
      total: csvData.length,
      successful: results.filter(r => r.result.success).length,
      failed: results.filter(r => !r.result.success).length,
      details: results
    };
  }

  /**
   * Active Directory sync
   */
  async syncUsersFromAD(firmId: string, adConfig: ActiveDirectoryConfig) {
    try {
      // 1. Connect to Azure AD
      const adUsers = await this.getADUsers(adConfig);

      // 2. Sync each user
      const syncResults = [];
      for (const adUser of adUsers) {
        const result = await this.syncSingleUserFromAD(firmId, adUser, adConfig);
        syncResults.push(result);
      }

      // 3. Handle deprovisioning (users removed from AD)
      await this.handleDeprovisioning(firmId, adUsers);

      return {
        success: true,
        synced: syncResults.filter(r => r.success).length,
        errors: syncResults.filter(r => !r.success).length,
        details: syncResults
      };

    } catch (error) {
      console.error('AD sync error:', error);
      return { success: false, error: error.message };
    }
  }

  private async getADUsers(adConfig: ActiveDirectoryConfig) {
    // Microsoft Graph API integration
    // Returns array of AD users with groups and attributes
    return [];
  }

  private async syncSingleUserFromAD(firmId: string, adUser: any, adConfig: ActiveDirectoryConfig) {
    try {
      // Map AD user to platform user
      const role = this.mapADGroupsToRole(adUser.groups, adConfig.groupMapping);
      
      // Check if user exists
      const existingUser = await this.getUserByEmail(adUser.mail);
      
      if (existingUser) {
        // Update existing user
        await this.updateUserFromAD(existingUser.id, adUser, role);
      } else {
        // Create new user
        await this.createUserFromAD(firmId, adUser, role);
      }

      return { success: true, email: adUser.mail, action: existingUser ? 'updated' : 'created' };

    } catch (error) {
      return { success: false, email: adUser.mail, error: error.message };
    }
  }

  private mapADGroupsToRole(groups: string[], groupMapping: Record<string, string>): string {
    for (const group of groups) {
      if (groupMapping[group]) {
        return groupMapping[group];
      }
    }
    return 'associate'; // default role
  }

  private async validateInvitePermission(firmId: string): Promise<boolean> {
    // Check if current user has admin or partner role
    return true;
  }

  private async getFirmDomain(firmId: string): Promise<string> {
    const { data } = await this.supabase
      .from('firms')
      .select('domain')
      .eq('id', firmId)
      .single();
    return data?.domain || '';
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async sendInvitationEmail(invitation: any) {
    // Email service integration
    console.log(`Sending invitation to ${invitation.email}`);
  }

  private async getUserByEmail(email: string) {
    const { data } = await this.supabase
      .from('firm_users')
      .select('*')
      .eq('email', email)
      .single();
    return data;
  }

  private async updateUserFromAD(userId: string, adUser: any, role: string) {
    // Update user with AD information
  }

  private async createUserFromAD(firmId: string, adUser: any, role: string) {
    // Create new user from AD information
  }

  private async handleDeprovisioning(firmId: string, activeADUsers: any[]) {
    // Deactivate users who are no longer in AD
  }
}

/**
 * Usage Examples
 */

// Example 1: Firm signs up
const firmSignup = new FirmSignupFlow();
await firmSignup.processFirmSignup({
  firmName: "Smith & Associates Law",
  domain: "smithlaw.com",
  adminName: "John Smith",
  adminEmail: "admin@smithlaw.com",
  subscriptionTier: "professional",
  paymentId: "pay_123abc"
});

// Example 2: User signs in
const userSignin = new UserSigninFlow();
await userSignin.signInWithEmail("lawyer@smithlaw.com", "password123");

// Example 3: Admin invites new user
const userManagement = new UserManagementFlow();
await userManagement.inviteUser({
  name: "Sarah Johnson",
  email: "sarah@smithlaw.com",
  role: "partner",
  department: "Corporate Law",
  firmId: "firm_123abc"
});

// Example 4: Bulk CSV import
await userManagement.bulkImportUsers("firm_123abc", [
  { name: "Michael Chen", email: "michael@smithlaw.com", role: "associate", department: "Litigation" },
  { name: "Emily Davis", email: "emily@smithlaw.com", role: "paralegal", department: "Corporate Law" }
]);

// Example 5: AD sync
await userManagement.syncUsersFromAD("firm_123abc", {
  tenantId: "tenant-123",
  clientId: "client-456", 
  clientSecret: "secret-789",
  domain: "smithlaw.onmicrosoft.com",
  syncEnabled: true,
  groupMapping: {
    "Partners": "partner",
    "Associates": "associate",
    "Paralegals": "paralegal"
  }
}); 