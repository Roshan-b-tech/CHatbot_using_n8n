import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats($userId: uuid!) {
    chats(
      where: { user_id: { _eq: $userId } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      created_at
      updated_at
      messages {
        id
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      created_at
      updated_at
      user_id
      messages(
        where: { chat_id: { _eq: $chatId } }
        order_by: { created_at: asc }
      ) {
        id
        content
        is_bot
        created_at
        user_id
        chat_id
      }
    }
  }
`;

export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      user_id
      chat_id
    }
  }
`;