export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  chat_id: string;
  user_id?: string;
  is_bot: boolean;
  created_at: string;
}

export interface CreateChatInput {
  title: string;
  userId: string;
}

export interface SendMessageInput {
  chat_id: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}