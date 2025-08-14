# AI Chatbot with Nhost + Hasura + n8n

A modern, real-time chatbot application built with React, TypeScript, Nhost authentication, Hasura GraphQL, and n8n workflow automation.

## Features

- 🔐 **Email Authentication** - Secure sign-up/sign-in with Nhost
- 💬 **Real-time Chat** - Live updates using GraphQL subscriptions  
- 🤖 **AI Chatbot** - Powered by OpenRouter API through n8n workflows
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔒 **Row-Level Security** - Users can only access their own data
- ⚡ **GraphQL Only** - All backend communication via GraphQL

## Architecture

```
Frontend (React/TS) → Hasura GraphQL → PostgreSQL
                   ↓
                Hasura Actions → n8n Webhooks → OpenRouter API
```

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd chatbot-app
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
REACT_APP_NHOST_SUBDOMAIN=your-subdomain
REACT_APP_NHOST_REGION=us-east-1
REACT_APP_HASURA_GRAPHQL_URL=https://your-subdomain.hasura.app/v1/graphql
REACT_APP_HASURA_WEBSOCKET_URL=wss://your-subdomain.hasura.app/v1/graphql
```

### 3. Database Schema

Create these tables in your Hasura console:

#### Chats Table

```sql
CREATE TABLE chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can CRUD own chats" ON chats
  USING (auth.uid() = user_id);
```

#### Messages Table

```sql
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  is_bot boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS  
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid())
  );
```

### 4. Hasura Actions

Create a `sendMessage` action in Hasura:

**Handler URL**: `https://your-n8n-instance.com/webhook/chat`

**Request Transform**:
```json
{
  "chat_id": "{{$body.input.chat_id}}",
  "content": "{{$body.input.content}}",
  "user_id": "{{$session.x-hasura-user-id}}"
}
```

**Type Definitions**:
```graphql
type Mutation {
  sendMessage(chat_id: String!, content: String!): SendMessageResponse
}

type SendMessageResponse {
  success: Boolean!
  message: String
  error: String
}
```

**Permissions**: Allow for `user` role

### 5. n8n Workflow Setup

Create an n8n workflow with these nodes:

1. **Webhook Trigger**
   - URL: `/webhook/chat`
   - Method: POST

2. **Validation Node** (Function)
   ```javascript
   // Validate user owns the chat
   const chatId = $json.chat_id;
   const userId = $json.user_id;
   
   // Query Hasura to verify ownership
   const response = await $http.request({
     url: 'https://your-subdomain.hasura.app/v1/graphql',
     method: 'POST',
     headers: {
       'x-hasura-admin-secret': 'your-admin-secret'
     },
     body: {
       query: `
         query($chatId: uuid!, $userId: uuid!) {
           chats_by_pk(id: $chatId) {
             user_id
           }
         }
       `,
       variables: { chatId, userId }
     }
   });
   
   if (response.data.chats_by_pk.user_id !== userId) {
     throw new Error('Unauthorized');
   }
   
   return $json;
   ```

3. **OpenRouter API Call**
   ```javascript
   const response = await $http.request({
     url: 'https://openrouter.ai/api/v1/chat/completions',
     method: 'POST',
     headers: {
       'Authorization': 'Bearer your-openrouter-key',
       'Content-Type': 'application/json'
     },
     body: {
       model: 'meta-llama/llama-3.2-3b-instruct:free',
       messages: [
         { role: 'user', content: $json.content }
       ]
     }
   });
   
   return {
     chatId: $json.chat_id,
     botResponse: response.choices[0].message.content
   };
   ```

4. **Save Response** (HTTP Request to Hasura)
   ```javascript
   await $http.request({
     url: 'https://your-subdomain.hasura.app/v1/graphql',
     method: 'POST',
     headers: {
       'x-hasura-admin-secret': 'your-admin-secret'
     },
     body: {
       query: `
         mutation($chatId: uuid!, $content: String!) {
           insert_messages_one(object: {
             chat_id: $chatId,
             content: $content,
             is_bot: true
           }) {
             id
           }
         }
       `,
       variables: {
         chatId: $json.chatId,
         content: $json.botResponse
       }
     }
   });
   
   return { success: true, message: 'Response saved' };
   ```

### 6. Start Development

```bash
npm run dev
```

## Configuration Details

### Nhost Setup

1. Create account at [nhost.io](https://nhost.io)
2. Create new project
3. Enable email authentication
4. Get subdomain and region
5. Update environment variables

### Hasura Setup

1. Your Nhost project includes Hasura automatically
2. Access Hasura console from Nhost dashboard
3. Create database schema (see above)
4. Set up actions and permissions
5. Test GraphQL queries

### n8n Setup

1. Deploy n8n instance (Railway, DigitalOcean, etc.)
2. Create webhook workflow (see above)
3. Get OpenRouter API key from [openrouter.ai](https://openrouter.ai)
4. Configure secure credentials in n8n

## Security Features

- **Row-Level Security**: Users can only access their own chats/messages
- **Authentication Required**: All operations require valid JWT token
- **Action Permissions**: Hasura actions restricted to authenticated users
- **API Key Security**: OpenRouter API key secured in n8n environment

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Authentication**: Nhost (JWT-based)
- **Database**: PostgreSQL with Hasura GraphQL API
- **Real-time**: GraphQL Subscriptions
- **Workflow**: n8n automation platform
- **AI**: OpenRouter API (multiple model options)
- **State Management**: Apollo Client

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch  
5. Create Pull Request

## License

MIT License - see LICENSE file for details