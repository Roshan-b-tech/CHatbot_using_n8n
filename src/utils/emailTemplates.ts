import { emailVerificationConfig } from './emailVerification';

export interface EmailTemplateData {
    appName: string;
    appUrl: string;
    userEmail: string;
    verificationUrl: string;
    supportEmail: string;
}

/**
 * Generate professional email content for verification
 */
export const generateVerificationEmailContent = (data: EmailTemplateData) => {
    const { appName, appUrl, userEmail, verificationUrl, supportEmail } = data;

    return {
        subject: `Verify your ${appName} account`,
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ${appName} account</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .logo { 
            width: 60px; 
            height: 60px; 
            margin: 0 auto 20px; 
            background: #3b82f6; 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 24px; 
            font-weight: bold;
          }
          .title { 
            color: #1f2937; 
            font-size: 24px; 
            font-weight: 600; 
            margin: 0 0 10px 0;
          }
          .subtitle { 
            color: #6b7280; 
            font-size: 16px; 
            margin: 0;
          }
          .content { 
            margin: 30px 0; 
          }
          .email-box { 
            background: #f3f4f6; 
            padding: 16px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center;
          }
          .email-text { 
            font-family: monospace; 
            font-size: 16px; 
            color: #374151; 
            font-weight: 500;
          }
          .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            text-align: center;
          }
          .button:hover { 
            background: #2563eb; 
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px;
          }
          .warning { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 20px 0; 
            color: #92400e;
          }
          .warning-title { 
            font-weight: 600; 
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🤖</div>
            <h1 class="title">Welcome to ${appName}!</h1>
            <p class="subtitle">Please verify your email address to get started</p>
          </div>
          
          <div class="content">
            <p>Hi there!</p>
            
            <p>Thank you for signing up for ${appName}. To complete your registration and start using our AI chatbot, please verify your email address.</p>
            
            <div class="email-box">
              <p class="email-text">${userEmail}</p>
            </div>
            
            <p>Click the button below to verify your email address:</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
            
            <div class="warning">
              <div class="warning-title">⚠️ Important:</div>
              <p>This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.</p>
            </div>
            
            <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from ${appName} (${appUrl})</p>
            <p>If you have any questions, please contact us at <a href="mailto:${supportEmail}" style="color: #3b82f6;">${supportEmail}</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              To ensure delivery, please add ${supportEmail} to your address book or safe sender list.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Welcome to ${appName}!

Please verify your email address to complete your registration and start using our AI chatbot.

Your email: ${userEmail}

Verify your email by clicking this link:
${verificationUrl}

If the link doesn't work, copy and paste it into your browser.

IMPORTANT: This verification link will expire in 24 hours.

If you didn't create an account with ${appName}, you can safely ignore this email.

This email was sent from ${appName} (${appUrl})
For support, contact: ${supportEmail}

To ensure delivery, please add ${supportEmail} to your address book.
    `
    };
};

/**
 * Generate resend verification email content
 */
export const generateResendVerificationEmailContent = (data: EmailTemplateData) => {
    const { appName, appUrl, userEmail, verificationUrl, supportEmail } = data;

    return {
        subject: `New verification email for ${appName}`,
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New verification email for ${appName}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .logo { 
            width: 60px; 
            height: 60px; 
            margin: 0 auto 20px; 
            background: #059669; 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 24px; 
            font-weight: bold;
          }
          .title { 
            color: #1f2937; 
            font-size: 24px; 
            font-weight: 600; 
            margin: 0 0 10px 0;
          }
          .subtitle { 
            color: #6b7280; 
            font-size: 16px; 
            margin: 0;
          }
          .content { 
            margin: 30px 0; 
          }
          .email-box { 
            background: #f3f4f6; 
            padding: 16px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center;
          }
          .email-text { 
            font-family: monospace; 
            font-size: 16px; 
            color: #374151; 
            font-weight: 500;
          }
          .button { 
            display: inline-block; 
            background: #059669; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            text-align: center;
          }
          .button:hover { 
            background: #047857; 
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧</div>
            <h1 class="title">New Verification Email</h1>
            <p class="subtitle">Here's your new verification link for ${appName}</p>
          </div>
          
          <div class="content">
            <p>Hi there!</p>
            
            <p>You requested a new verification email for your ${appName} account. Here's your new verification link:</p>
            
            <div class="email-box">
              <p class="email-text">${userEmail}</p>
            </div>
            
            <p>Click the button below to verify your email address:</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #059669;">${verificationUrl}</p>
            
            <p>This new verification link will expire in 24 hours.</p>
            
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from ${appName} (${appUrl})</p>
            <p>For support, contact: <a href="mailto:${supportEmail}" style="color: #059669;">${supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
New Verification Email for ${appName}

You requested a new verification email for your ${appName} account. Here's your new verification link:

Your email: ${userEmail}

Verify your email by clicking this link:
${verificationUrl}

If the link doesn't work, copy and paste it into your browser.

This new verification link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

This email was sent from ${appName} (${appUrl})
For support, contact: ${supportEmail}
    `
    };
};
