# Google OAuth Setup Guide for MathTutor AI

## Overview
This guide provides step-by-step instructions to configure Google OAuth authentication for the MathTutor AI application using Supabase.

## Prerequisites
- Active Google account
- Supabase project created and configured
- Access to Supabase project dashboard

## Part 1: Google Cloud Console Configuration

### Step 1: Access Google Cloud Console
1. **Visit Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - If you don't have a project: Click "Select a project" → "New Project"
   - Project name: `MathTutor AI` or your preferred name
   - Click "Create"
   - If you have existing projects: Select the appropriate project

### Step 2: Enable Required APIs
1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Enable Google+ API** (Legacy - still required for OAuth)
   - Search for "Google+ API"
   - Click on "Google+ API" result
   - Click "Enable" button
   - Wait for API to be enabled

3. **Enable People API** (Recommended for profile info)
   - Search for "People API"
   - Click on "People API" result
   - Click "Enable" button

### Step 3: Configure OAuth Consent Screen
1. **Go to OAuth Consent Screen**
   - Click "APIs & Services" → "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (for public apps)
   - Click "Create"

3. **Fill App Information**
   - **App name**: `MathTutor AI`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: Leave blank for now
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Scopes Configuration**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test Users** (Optional for development)
   - Add test user emails if needed
   - Click "Save and Continue"

6. **Summary**
   - Review settings
   - Click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials
1. **Go to Credentials**
   - Click "APIs & Services" → "Credentials"

2. **Create OAuth Client ID**
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"

3. **Configure Application**
   - **Application type**: Web application
   - **Name**: `MathTutor AI Web Client`

4. **Add Authorized JavaScript Origins**
   ```
   http://localhost:5173
   https://localhost:5173
   ```

5. **Add Authorized Redirect URIs**
   You need to find your Supabase project URL first:
   - Go to your Supabase dashboard
   - Your project URL format: `https://[PROJECT_ID].supabase.co`
   
   Add these URIs:
   ```
   https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```

6. **Create Credentials**
   - Click "Create"
   - **IMPORTANT**: Copy and save:
     - Client ID (starts with numbers, ends with .apps.googleusercontent.com)
     - Client Secret (random string)

## Part 2: Supabase Configuration

### Step 1: Access Supabase Dashboard
1. **Go to Supabase**
   - Visit: https://app.supabase.com/
   - Sign in to your account
   - Select your MathTutor AI project

### Step 2: Configure Google Provider
1. **Navigate to Authentication**
   - In left sidebar, click "Authentication"
   - Click "Providers" tab

2. **Enable Google Provider**
   - Find "Google" in the list
   - Click the toggle to enable it
   - Click "Configure"

3. **Add Google OAuth Credentials**
   - **Google Client ID**: Paste from Google Cloud Console
   - **Google Client Secret**: Paste from Google Cloud Console
   - Click "Save"

### Step 3: Configure Site URL and Redirect URLs
1. **Go to URL Configuration**
   - Still in Authentication section
   - Click "URL Configuration" tab

2. **Set Site URL**
   - **Site URL**: `http://localhost:5173`
   - For production: `https://your-domain.com`

3. **Add Redirect URLs**
   - **Redirect URLs**: Add these exact URLs (click "Add URL" for each):
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:5173/auth/callback
   ```
   - For production, add your domain URLs:
   ```
   https://your-domain.com
   https://your-domain.com/
   https://your-domain.com/auth/callback
   ```

4. **Save Configuration**
   - Click "Save"

### Step 4: Update Additional Settings (Optional)
1. **Email Templates**
   - Go to "Authentication" → "Email Templates"
   - Customize confirmation and recovery emails if needed

2. **Rate Limiting**
   - Go to "Authentication" → "Rate Limiting"
   - Adjust limits as needed for your application

## Part 3: Testing Configuration

### Step 1: Test in Development
1. **Start your application**
   ```bash
   npm run dev
   ```

2. **Navigate to login**
   - Go to `http://localhost:5173`
   - Click login button
   - Click "Continue with Google"

3. **Expected Flow**
   - Redirects to Google OAuth consent screen
   - User approves permissions
   - Redirects back to your application
   - User should be logged in

### Step 2: Common Issues and Solutions

#### Issue 1: "redirect_uri_mismatch" Error
**Solution**: 
- Double-check redirect URIs in Google Cloud Console
- Ensure they exactly match your Supabase project URL
- Format: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

#### Issue 2: "unauthorized_client" Error
**Solution**:
- Verify OAuth consent screen is configured
- Ensure app is published (not in testing mode)
- Check that correct Client ID is used in Supabase

#### Issue 3: "access_denied" Error
**Solution**:
- Check OAuth consent screen configuration
- Verify required scopes are added
- Ensure user email is added to test users (if in testing mode)

## Part 4: Production Deployment

### Step 1: Update Google Cloud Console for Production
1. **Add Production URLs**
   - Go to Google Cloud Console → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add production authorized origins:
   ```
   https://your-production-domain.com
   ```
   - Add production redirect URIs:
   ```
   https://[PROJECT_ID].supabase.co/auth/v1/callback
   https://your-production-domain.com/auth/callback
   ```

### Step 2: Update Supabase for Production
1. **Update Site URL**
   - In Supabase dashboard → Authentication → URL Configuration
   - Change Site URL to: `https://your-production-domain.com`

2. **Update Redirect URLs**
   - Add production redirect patterns:
   ```
   https://your-production-domain.com/**
   ```

### Step 3: Publish OAuth App
1. **Go to OAuth Consent Screen**
   - In Google Cloud Console
   - Click "Publish App"
   - Complete verification process if required

## Security Best Practices

1. **Environment Variables**
   - Store sensitive data in environment variables
   - Never commit Client Secret to version control

2. **HTTPS Only**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS

3. **Domain Validation**
   - Restrict authorized domains to your actual domains
   - Remove localhost URLs from production settings

4. **Regular Security Reviews**
   - Periodically review OAuth scopes
   - Monitor authentication logs
   - Update credentials if compromised

## Troubleshooting Checklist

- [ ] Google Cloud Console project created
- [ ] APIs enabled (Google+ API, People API)
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs correctly configured
- [ ] Supabase Google provider enabled
- [ ] Client ID and Secret correctly entered in Supabase
- [ ] Site URL and redirect URLs configured in Supabase
- [ ] Application URL matches configured domains
- [ ] HTTPS enabled for production

## Support Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**Important Notes:**
- Google OAuth setup can take 5-10 minutes to propagate
- Always test in incognito/private browsing mode
- Keep your Client Secret secure and never expose it in frontend code
- Consider using environment variables for all sensitive configuration