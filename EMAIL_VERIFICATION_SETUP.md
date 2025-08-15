# Email Verification Setup Guide

This guide explains how to set up and use the email verification system in your AI Chatbot application.

## Overview

The email verification system ensures that users verify their email addresses before accessing the application. It includes:

1. **Signup Flow**: Users sign up and receive a verification email
2. **Verification Page**: Users click the email link to verify their account
3. **Verification Pending**: Shows users they need to check their email
4. **Resend Functionality**: Allows users to request new verification emails
5. **Automatic Redirect**: Users are redirected to the dashboard after verification

## Features

- ✅ Email verification during signup
- ✅ Verification link handling
- ✅ Resend verification email with rate limiting
- ✅ Automatic redirect after verification
- ✅ User-friendly verification pending page
- ✅ Error handling for expired/invalid links
- ✅ Local storage for pending verification state

## Setup Instructions

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Verification Configuration
VITE_EMAIL_VERIFICATION_ENABLED=true
VITE_VERIFICATION_REDIRECT_URL=https://your-app-domain.com/verify-email
```

### 2. Nhost Configuration

The system automatically enables email verification in your Nhost client configuration.

### 3. Routes

The following routes are automatically configured:

- `/auth` - Sign in/Sign up page
- `/verify-email` - Email verification page
- `/dashboard` - Main application (requires verification)

## How It Works

### Signup Flow

1. User fills out signup form
2. Account is created in Nhost
3. Verification email is automatically sent
4. User sees "Verification Pending" page
5. User checks email and clicks verification link
6. Email is verified and user is redirected to dashboard

### Verification Process

1. User clicks verification link in email
2. Link contains verification token
3. Token is validated by Nhost
4. User account is marked as verified
5. User is automatically redirected to dashboard

### Resend Functionality

- Users can resend verification emails
- Rate limiting: 1 minute delay between resend attempts
- Countdown timer shows remaining wait time
- Success/error messages for feedback

## Components

### EmailVerification.tsx
Handles the verification process when users click email links.

**Features:**
- Token validation
- Success/error states
- Automatic redirect
- Resend functionality

### VerificationPending.tsx
Shown after successful signup, instructing users to check their email.

**Features:**
- Email display
- Resend button with rate limiting
- Back to sign in option
- Helpful instructions

### AuthForm.tsx
Updated to integrate with email verification flow.

**Changes:**
- Shows verification pending after signup
- Stores verification email for resend
- Integrates with verification utilities

## Utilities

### emailVerification.ts
Centralized functions for email verification operations.

**Functions:**
- `sendVerificationEmail()` - Send verification email
- `isEmailVerificationRequired()` - Check if verification needed
- `getVerificationStatus()` - Get current verification state
- `storePendingVerificationEmail()` - Store email for resend
- `canResendVerification()` - Check resend availability
- `getResendCountdown()` - Get remaining wait time

## Configuration Options

### Rate Limiting
```typescript
export const emailVerificationConfig: EmailVerificationConfig = {
  resendDelay: 60000, // 1 minute between resend attempts
  // ... other options
};
```

### Redirect URLs
```bash
VITE_VERIFICATION_REDIRECT_URL=https://your-domain.com/verify-email
```

## Testing

### Local Development
1. Start your development server
2. Sign up with a new email
3. Check your email for verification link
4. Click the link to verify
5. You should be redirected to dashboard

### Production Testing
1. Deploy to production
2. Update environment variables
3. Test signup flow with real email
4. Verify email verification works
5. Test resend functionality

## Troubleshooting

### Common Issues

**Verification email not received:**
- Check spam folder
- Verify email address is correct
- Check Nhost email configuration
- Use resend functionality

**Verification link expired:**
- Links typically expire after 24 hours
- Use resend functionality to get new link
- Check Nhost token expiration settings

**Redirect not working:**
- Verify route configuration in App.tsx
- Check authentication state
- Ensure user is properly verified

### Debug Information

The system logs detailed information to the console:
- Authentication state changes
- Verification attempts
- Redirect actions
- Error details

## Security Considerations

- Verification tokens are single-use
- Rate limiting prevents spam
- Secure token validation
- Automatic cleanup of stored data
- HTTPS required for production

## Customization

### Styling
All components use Tailwind CSS and can be customized by modifying the className attributes.

### Messages
Update text content in the component files to match your brand voice.

### Timing
Adjust resend delays and redirect timing in the configuration files.

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify environment variable configuration
3. Check Nhost dashboard for email settings
4. Review the troubleshooting section above

## Future Enhancements

Potential improvements to consider:

- Email templates customization
- Multiple verification methods (SMS, etc.)
- Advanced rate limiting
- Verification analytics
- Admin verification override
- Bulk verification tools
