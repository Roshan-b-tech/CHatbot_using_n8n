# AI Chatbot Integration Setup Guide

## Step 1: Set up n8n Instance

### Option A: Local n8n (Development)
```bash
# Install n8n globally
npm install -g n8n

# Start n8n with environment variables
n8n start --tunnel
```

### Option B: Docker n8n
```bash
# Create docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_HOST=localhost
      - WEBHOOK_URL=http://localhost:5678
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:
```

## Step 2: Import n8n Workflow

1. **Start n8n** (local or Docker)
2. **Open n8n** at http://localhost:5678
3. **Go to Workflows** → **Import from File**
4. **Upload** `n8n/workflow.json`
5. **Activate the workflow**

## Step 3: Configure Environment Variables

In n8n, go to **Settings** → **Environment Variables** and add:

```env
HASURA_GRAPHQL_URL=https://ivbsvrhjpzemziisixvk.hasura.ap-south-1.nhost.run/v1/graphql
HASURA_ADMIN_SECRET=i0M9+^-&_+6hq,Tb7+':#f,-zb#'tbMb
OPENROUTER_API_KEY=your-actual-openrouter-api-key
APP_URL=http://localhost:5173
```

## Step 4: Get OpenRouter API Key

1. **Go to** [OpenRouter](https://openrouter.ai/)
2. **Sign up/Login**
3. **Get your API key** from the dashboard
4. **Add it to n8n environment variables**

## Step 5: Create Hasura Action

1. **Go to Hasura Console**
2. **Actions** → **Create Action**
3. **Use the configuration from** `hasura/actions.yaml`

## Step 6: Test the Integration

1. **Send a message** in your chat
2. **Check n8n execution logs**
3. **Verify AI response appears** in the chat

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure n8n webhook is accessible
- **Authentication errors**: Check Hasura admin secret
- **OpenRouter errors**: Verify API key and model availability

### Testing:
- **Test webhook**: Use Postman or curl to test n8n endpoint
- **Check logs**: Monitor n8n execution logs for errors
- **Verify database**: Check if AI responses are saved

## Next Steps

After setup:
1. **Test basic AI responses**
2. **Customize the AI model** (change OpenRouter model)
3. **Add conversation context** (include chat history)
4. **Implement error handling** and retries
5. **Add rate limiting** and usage tracking
