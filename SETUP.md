# 🚀 AI Chatbot Setup Guide

Complete setup instructions for the AI Chatbot with Bolt + Nhost + Hasura + n8n + OpenRouter.

## 📋 Prerequisites

- Node.js 18+ and npm
- Nhost account ([nhost.io](https://nhost.io))
- n8n instance (Railway, DigitalOcean, etc.)
- OpenRouter API key ([openrouter.ai](https://openrouter.ai))

## 🏗️ Step-by-Step Setup

### 1. **Frontend Setup**

```bash
# Clone and install dependencies
git clone <your-repo>
cd subSpace_Internship
npm install

# Copy environment configuration
cp env.example .env.local
```

### 2. **Environment Configuration**

Edit `.env.local` with your actual values:

```env
# Nhost Configuration
VITE_NHOST_SUBDOMAIN=your-actual-subdomain
VITE_NHOST_REGION=us-east-1

# Hasura GraphQL Configuration
VITE_HASURA_GRAPHQL_URL=https://your-subdomain.hasura.app/v1/graphql
VITE_HASURA_WEBSOCKET_URL=wss://your-subdomain.hasura.app/v1/graphql

# Bolt Authentication Configuration
VITE_BOLT_ENABLED=true
VITE_BOLT_API_KEY=your-bolt-api-key
VITE_BOLT_WEBHOOK_URL=https://your-bolt-instance.com/webhook

# n8n Workflow Configuration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com
```

### 3. **Database Setup**

#### 3.1 Access Hasura Console
1. Go to your Nhost dashboard
2. Click on "Hasura" tab
3. Open Hasura Console

#### 3.2 Run Database Schema
1. Go to "Data" → "SQL" in Hasura Console
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the script

#### 3.3 Verify Tables
- Check that `chats` and `messages` tables are created
- Verify RLS policies are enabled
- Confirm permissions are set correctly

### 4. **Hasura Actions Configuration**

#### 4.1 Create Custom Types
1. Go to "Actions" → "Custom Types" in Hasura Console
2. Add the `SendMessageResponse` type:
   ```graphql
   type SendMessageResponse {
     success: Boolean!
     message: String
     error: String
   }
   ```

#### 4.2 Create the Action
1. Go to "Actions" → "Actions" in Hasura Console
2. Click "Create" → "Action"
3. Configure the action:
   - **Action Name**: `sendMessage`
   - **Type**: `SendMessageResponse`
   - **Arguments**:
     - `chat_id: String!`
     - `content: String!`
   - **Handler**: `https://your-n8n-instance.com/webhook/chat`
   - **Forward client headers**: ✅ Enabled
   - **Headers**:
     - `x-hasura-admin-secret`: `{{NHOST_HASURA_ADMIN_SECRET}}`

#### 4.3 Set Permissions
1. Go to "Actions" → "Permissions"
2. Allow `user` role to execute the action

### 5. **n8n Workflow Setup**

#### 5.1 Deploy n8n Instance
1. **Railway** (Recommended for quick setup):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Deploy n8n
   railway login
   railway init
   railway add
   railway up
   ```

2. **DigitalOcean** (Production):
   - Create Droplet with Docker
   - Run n8n with Docker Compose

#### 5.2 Import Workflow
1. Open your n8n instance
2. Go to "Workflows" → "Import from File"
3. Upload `n8n/workflow.json`

#### 5.3 Configure Credentials
1. **Hasura Credentials**:
   - Type: HTTP Header Auth
   - Name: `Hasura Admin`
   - Header Name: `x-hasura-admin-secret`
   - Header Value: `{{HASURA_ADMIN_SECRET}}`

2. **OpenRouter Credentials**:
   - Type: HTTP Header Auth
   - Name: `OpenRouter API`
   - Header Name: `Authorization`
   - Header Value: `Bearer {{OPENROUTER_API_KEY}}`

#### 5.4 Set Environment Variables
In n8n, go to "Settings" → "Environment Variables":
```env
HASURA_GRAPHQL_URL=https://your-subdomain.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret
OPENROUTER_API_KEY=your-openrouter-api-key
APP_URL=https://your-app-domain.com
```

#### 5.5 Activate Workflow
1. Click "Activate" on the workflow
2. Copy the webhook URL
3. Update Hasura Action handler with this URL

### 6. **Test the Integration**

#### 6.1 Start Frontend
```bash
npm run dev
```

#### 6.2 Test Authentication
1. Sign up with a new account
2. Verify authentication works
3. Check if Bolt integration is active

#### 6.3 Test Chat Functionality
1. Create a new chat
2. Send a message
3. Verify AI response appears
4. Check real-time updates

## 🔧 Troubleshooting

### Common Issues

#### **Authentication Errors**
- Verify Nhost subdomain and region
- Check if email authentication is enabled in Nhost
- Ensure environment variables are correct

#### **GraphQL Errors**
- Verify Hasura GraphQL URL
- Check if tables and RLS policies are created
- Ensure user role permissions are set

#### **n8n Workflow Issues**
- Check webhook URL is accessible
- Verify credentials are configured
- Check environment variables in n8n
- Review workflow execution logs

#### **AI Response Issues**
- Verify OpenRouter API key
- Check n8n workflow execution
- Ensure Hasura Action is properly configured

### Debug Mode

Enable debug mode in `.env.local`:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📊 Verification Checklist

- [ ] Frontend starts without errors
- [ ] User can sign up/sign in
- [ ] Database tables are created with RLS
- [ ] Hasura Action is configured and accessible
- [ ] n8n workflow is active and accessible
- [ ] OpenRouter API integration works
- [ ] Chat creation and messaging works
- [ ] AI responses appear in real-time
- [ ] Real-time subscriptions work
- [ ] All GraphQL operations use proper authentication

## 🚀 Production Deployment

### Frontend
- Build with `npm run build`
- Deploy to Vercel, Netlify, or your preferred platform
- Set production environment variables

### Backend
- Use Nhost production environment
- Ensure n8n instance is production-ready
- Set up monitoring and logging
- Configure proper SSL certificates

### Security
- Review RLS policies
- Verify API key security
- Enable rate limiting
- Set up error monitoring

## 📚 Additional Resources

- [Nhost Documentation](https://docs.nhost.io/)
- [Hasura Documentation](https://hasura.io/docs/)
- [n8n Documentation](https://docs.n8n.io/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review n8n workflow logs
3. Check Hasura console for errors
4. Verify environment variables
5. Check browser console for frontend errors

---

**🎉 Congratulations!** Your AI Chatbot is now fully configured and ready to use.
