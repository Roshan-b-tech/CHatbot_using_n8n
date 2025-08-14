import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $userId: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $userId }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($chatId: uuid!, $content: String!, $isBot: Boolean = false) {
    insert_messages_one(object: { 
      chat_id: $chatId, 
      content: $content, 
      is_bot: $isBot 
    }) {
      id
      content
      is_bot
      created_at
      user_id
      chat_id
    }
  }
`;

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chatId: uuid!, $content: String!) {
    sendMessage(chat_id: $chatId, content: $content) {
      success
      message
      error
    }
  }
`;