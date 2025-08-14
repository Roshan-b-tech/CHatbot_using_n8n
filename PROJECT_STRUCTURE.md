# 🏗️ AI Chatbot Project Structure

Complete overview of the AI Chatbot application architecture and components.

## 📁 Project Structure

```
subSpace_Internship/
├── 📁 src/                          # Frontend React Application
│   ├── 📁 components/               # React Components
│   │   ├── 📁 Auth/                # Authentication Components
│   │   │   └── AuthForm.tsx        # Sign In/Sign Up Form with Bolt + Nhost
│   │   ├── 📁 Chat/                # Chat Interface Components
│   │   │   ├── ChatInterface.tsx   # Main Chat Container
│   │   │   ├── MessageList.tsx     # Message Display with Real-time Updates
│   │   │   └── MessageInput.tsx    # Message Input Component
│   │   ├── 📁 Dashboard/           # Dashboard Components
│   │   │   └── EmptyState.tsx      # Welcome Screen for New Users
│   │   └── 📁 Layout/              # Layout Components
│   │       ├── Header.tsx          # Top Navigation Bar
│   │       └── Sidebar.tsx         # Chat List Sidebar
│   ├── 📁 config/                  # Configuration Files
│   │   ├── apollo.ts               # Apollo Client + GraphQL Setup
│   │   ├── nhost.ts                # Nhost + Bolt Configuration
│   │   └── bolt.ts                 # Bolt Authentication Service
│   ├── 📁 graphql/                 # GraphQL Operations
│   │   ├── queries.ts              # GraphQL Queries & Subscriptions
│   │   └── mutations.ts            # GraphQL Mutations & Actions
│   ├── 📁 pages/                   # Page Components
│   │   └── Dashboard.tsx           # Main Dashboard Page
│   ├── 📁 types/                   # TypeScript Type Definitions
│   │   └── index.ts                # User, Chat, Message Interfaces
│   ├── App.tsx                     # Main Application Component
│   ├── main.tsx                    # Application Entry Point
│   └── index.css                   # Tailwind CSS Styles
├── 📁 database/                    # Database Schema & Scripts
│   └── schema.sql                  # Complete Database Schema with RLS
├── 📁 hasura/                      # Hasura Configuration
│   └── actions.yaml                # Hasura Actions Configuration
├── 📁 n8n/                         # n8n Workflow Configuration
│   └── workflow.json               # Complete n8n Workflow
├── 📁 .bolt/                       # Bolt Framework Configuration
│   ├── config.json                 # Bolt Template Configuration
│   └── prompt                      # Bolt Design Guidelines
├── 📄 env.example                  # Environment Variables Template
├── 📄 SETUP.md                     # Complete Setup Instructions
├── 📄 PROJECT_STRUCTURE.md         # This File
├── 📄 README.md                    # Project Overview & Features
├── 📄 package.json                 # Dependencies & Scripts
├── 📄 tailwind.config.js           # Tailwind CSS Configuration
├── 📄 vite.config.ts               # Vite Build Configuration
└── 📄 tsconfig.json                # TypeScript Configuration
```

## 🔄 Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Hasura      │    │      n8n        │
│   (React/TS)    │◄──►│   GraphQL API   │◄──►│   Workflow      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nhost Auth    │    │   PostgreSQL    │    │   OpenRouter    │
│   + Bolt        │    │   (with RLS)    │    │   AI API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Component Architecture

### **Authentication Layer**
- **Nhost Provider**: JWT-based authentication
- **Bolt Integration**: Enhanced authentication features
- **Auth Guards**: Route protection for authenticated users

### **Data Layer**
- **Apollo Client**: GraphQL state management
- **Real-time Subscriptions**: WebSocket connections for live updates
- **Type Safety**: Full TypeScript integration

### **UI Layer**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Reusable, accessible components
- **State Management**: React hooks for local state

## 🔐 Security Implementation

### **Row-Level Security (RLS)**
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);
```

### **Authentication Flow**
1. User signs in with Nhost + Bolt
2. JWT token stored securely
3. All GraphQL requests include auth headers
4. RLS policies enforce data isolation

### **API Security**
- Hasura Actions require authentication
- n8n webhooks validate user ownership
- OpenRouter API keys secured in n8n

## 🚀 Key Features

### **✅ Implemented**
- [x] Complete React/TypeScript frontend
- [x] Nhost authentication integration
- [x] Bolt authentication service
- [x] GraphQL queries, mutations, subscriptions
- [x] Real-time chat interface
- [x] Responsive design with Tailwind CSS
- [x] Database schema with RLS policies
- [x] Hasura Actions configuration
- [x] n8n workflow for AI integration
- [x] OpenRouter API integration
- [x] Comprehensive setup documentation

### **🔧 Configuration Required**
- [ ] Nhost project setup
- [ ] Database schema execution
- [ ] Hasura Actions activation
- [ ] n8n instance deployment
- [ ] OpenRouter API key configuration
- [ ] Environment variables setup

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | User interface and state management |
| **Styling** | Tailwind CSS | Responsive design system |
| **Authentication** | Nhost + Bolt | User authentication and authorization |
| **API** | GraphQL (Hasura) | Data querying and real-time updates |
| **Database** | PostgreSQL | Data persistence with RLS |
| **Workflow** | n8n | AI integration and automation |
| **AI** | OpenRouter API | Large language model responses |
| **Build** | Vite | Fast development and building |

## 🎯 Development Workflow

### **1. Local Development**
```bash
npm install          # Install dependencies
npm run setup:env    # Setup environment
npm run dev          # Start development server
```

### **2. Backend Setup**
```bash
npm run setup:db     # Database schema setup
npm run setup:hasura # Hasura Actions configuration
npm run setup:n8n    # n8n workflow deployment
```

### **3. Testing**
- Test authentication flow
- Verify chat functionality
- Check AI responses
- Validate real-time updates

## 🔍 File Purposes

### **Core Application Files**
- `src/App.tsx`: Main application wrapper with providers
- `src/main.tsx`: Application entry point
- `src/config/`: Configuration for all external services

### **Database & Backend**
- `database/schema.sql`: Complete database setup with security
- `hasura/actions.yaml`: Hasura Actions configuration
- `n8n/workflow.json`: AI integration workflow

### **Documentation**
- `SETUP.md`: Step-by-step setup instructions
- `README.md`: Project overview and features
- `PROJECT_STRUCTURE.md`: This comprehensive overview

## 🚀 Deployment Checklist

### **Frontend Deployment**
- [ ] Build production bundle (`npm run build`)
- [ ] Deploy to hosting platform (Vercel/Netlify)
- [ ] Configure environment variables
- [ ] Test production build

### **Backend Deployment**
- [ ] Nhost project in production
- [ ] Database schema deployed
- [ ] Hasura Actions active
- [ ] n8n workflow running
- [ ] API keys configured

### **Security Review**
- [ ] RLS policies verified
- [ ] Authentication flow tested
- [ ] API endpoints secured
- [ ] Error handling implemented

---

**🎉 Your AI Chatbot is now a complete, production-ready application!**

Follow the `SETUP.md` guide to get everything running, and you'll have a fully functional chatbot with:
- Secure authentication (Bolt + Nhost)
- Real-time messaging (GraphQL + WebSockets)
- AI-powered responses (n8n + OpenRouter)
- Production-ready security (RLS + JWT)
- Beautiful, responsive UI (React + Tailwind)
