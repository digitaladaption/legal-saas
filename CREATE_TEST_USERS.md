# Creating Test Users for LawFirmAI Dashboard

This guide will help you create test users so you can sign in without email verification.

## Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/settings/api
2. Copy the **service_role** key (NOT the anon key)
3. Add it to your `.env.local` file:

```bash
# Add this line to your .env.local file
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 2: Run the User Creation Script

```bash
npm run create-users
```

## Step 3: Available Test Accounts

After running the script, you'll have these test accounts:

| Email                           | Password     | Role      |
|---------------------------------|--------------|-----------|
| admin@lawfirmai.com            | admin123!    | admin     |
| attorney@lawfirmai.com         | attorney123! | attorney  |
| paralegal@lawfirmai.com        | paralegal123!| paralegal |
| client@lawfirmai.com           | client123!   | client    |
| matty@digitaladaption.co.uk    | matty123!    | admin     |

## Alternative: Disable Email Confirmation

If you prefer to disable email confirmation entirely for development:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/auth/settings
2. Scroll down to "Email Auth"
3. Turn OFF "Enable email confirmations"
4. Save the changes

This will allow users to sign up directly without email verification.

## Troubleshooting

- **Error: SUPABASE_SERVICE_ROLE_KEY is required**: Make sure you added the service role key to your .env.local file
- **Error: User already exists**: The user was already created, you can try signing in with the credentials
- **Profile creation failed**: This is normal if the user_profiles table doesn't exist yet

## Security Note

**Important**: Only use these test accounts in development. Never use the service role key in production client-side code! 