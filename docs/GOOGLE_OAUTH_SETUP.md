# Google OAuth Setup for Roadmapster

## Prerequisites
✅ Google Cloud Project created  
✅ OAuth 2.0 Client ID created  
✅ Supabase local development environment running

## Your Configuration
- **Client ID**: `49649362518-vb0qc81vpdvegtkp72k2bcphp7gkmuj2.apps.googleusercontent.com`
- **Redirect URIs Required**:
  - For local development: `http://127.0.0.1:54321/auth/v1/callback`
  - For production: `https://your-supabase-project.supabase.co/auth/v1/callback`

## Steps to Complete Setup

### 1. Get Your Client Secret from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Copy the **Client Secret**

### 2. Update Local Environment

1. Open `.env` file in the project root
2. Replace `your-google-client-secret-here` with your actual client secret:
   ```
   GOOGLE_CLIENT_SECRET=your-actual-secret-here
   ```

### 3. Configure Authorized Redirect URIs in Google Cloud

Add these URIs to your OAuth 2.0 Client ID configuration:

1. In Google Cloud Console, go to your OAuth 2.0 Client ID
2. Under **Authorized redirect URIs**, add:
   - `http://127.0.0.1:54321/auth/v1/callback` (for local development)
   - `http://localhost:3000/auth/callback` (for local app callback)
3. Click **Save**

### 4. Restart Supabase

After updating the `.env` file, restart Supabase to apply the changes:

```bash
supabase stop
supabase start
```

### 5. Test the Authentication Flow

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000
3. You should be redirected to the login page
4. Click "Sign in with Google"
5. Complete the Google OAuth flow
6. You should be redirected back to the app

## Current Implementation Status

✅ **Completed:**
- Supabase service layer for all data operations
- Google OAuth authentication flow implementation
- Login page with Google sign-in button
- Auth callback route for handling OAuth responses
- React hooks for real-time data synchronization
- Middleware for session management
- Database schema with all V2 tables

🔧 **Configuration Needed:**
- Add your Google Client Secret to `.env` file
- Verify redirect URIs in Google Cloud Console

## Troubleshooting

### "Redirect URI mismatch" Error
- Ensure the redirect URI in Google Cloud Console exactly matches: `http://127.0.0.1:54321/auth/v1/callback`
- Note: Use `127.0.0.1` not `localhost` for local development

### "Invalid client" Error
- Verify the Client ID in `supabase/config.toml` matches your Google OAuth Client ID
- Ensure the Client Secret in `.env` is correct

### Authentication Not Working
1. Check Supabase is running: `supabase status`
2. Verify Google OAuth is enabled in `supabase/config.toml`
3. Check browser console for errors
4. Review Supabase logs: `supabase logs`

## Next Steps

Once authentication is working:
1. The app will automatically create user profiles
2. Users can create/join teams
3. All data will persist in Supabase instead of localStorage
4. Real-time collaboration features will be active

## Security Notes

⚠️ **Important:**
- Never commit the `.env` file with your client secret to Git
- The `.env` file is already in `.gitignore`
- For production, use environment variables in your hosting platform
- Enable domain restrictions in Google OAuth for production use