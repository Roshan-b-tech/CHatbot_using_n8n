import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_CHAT_MESSAGES, MESSAGES_SUBSCRIPTION } from '../../graphql/queries';
import { CREATE_MESSAGE, SEND_MESSAGE_ACTION } from '../../graphql/mutations';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { SendMessageInput } from '../../types';
import { apolloClient } from '../../config/apollo';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ChatInterfaceProps {
  chatId: string;
  onSidebarToggle?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, onSidebarToggle }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION);
  const { theme, toggleTheme } = useTheme();

  // Function to refresh messages from database
  const refreshMessages = async () => {
    try {
      console.log('Refreshing messages from database for chat:', chatId);
      const { data } = await apolloClient.query({
        query: GET_CHAT_MESSAGES,
        variables: { chatId },
        fetchPolicy: 'network-only' // Force fresh data
      });

      if (data?.chats_by_pk?.messages) {
        console.log('Refreshed messages from database:', data.chats_by_pk.messages);
        console.log('Previous messages in state:', messages);
        setMessages(data.chats_by_pk.messages);
        console.log('Messages updated in state');
      } else {
        console.log('No messages found when refreshing');
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  };

  // Fetch initial messages and chat info
  const { loading: initialLoading, error: initialError, data: chatData } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId },
    onCompleted: (data) => {
      console.log('Chat data received:', data);
      if (data?.chats_by_pk?.messages) {
        console.log('Messages found:', data.chats_by_pk.messages);
        setMessages(data.chats_by_pk.messages);
      } else {
        console.log('No messages found in chat data');
        setMessages([]);
      }
    },
    onError: (error) => {
      console.error('Error fetching chat messages:', error);
      setMessages([]);
    }
  });

  // Subscribe to new messages
  useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
    onData: ({ data }) => {
      console.log('Subscription data received:', data);
      if (data?.data?.messages) {
        const newMessage = data.data.messages[0];
        console.log('New message from subscription:', newMessage);

        // Only add message if it has a valid ID
        if (newMessage && newMessage.id) {
          console.log('Current messages in state:', messages);
          setMessages(prev => {
            const updated = [...prev, newMessage];
            console.log('Updated messages after subscription:', updated);
            return updated;
          });
        } else {
          console.warn('Received message without ID from subscription:', newMessage);
        }
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      // Create user message
      const userMessage = await createMessage({
        variables: {
          chatId: chatId,
          content: content.trim(),
          isBot: false
        }
      });

      if (userMessage.data?.insert_messages_one) {
        const newMessage = userMessage.data.insert_messages_one;
        // Check if message already exists to prevent duplicates
        if (!messages.some(msg => msg && msg.id && msg.id === newMessage.id)) {
          setMessages(prev => [...prev, newMessage]);
        }
      }

      // Send to AI and get response
      const aiResponse = await sendMessageAction({
        variables: {
          chatId: chatId,
          content: content.trim()
        }
      });

      console.log('AI Response received:', aiResponse);
      console.log('AI Response data:', aiResponse.data);
      console.log('AI Response message:', aiResponse.data?.sendMessage?.message);
      console.log('Full sendMessage object:', aiResponse.data?.sendMessage);
      console.log('Response structure:', JSON.stringify(aiResponse.data, null, 2));

      if (aiResponse.data?.sendMessage?.success) {
        // If the action was successful, try to get the message from the response
        let aiMessage = aiResponse.data?.sendMessage?.message;

        if (aiMessage && aiMessage.id) {
          // We have a complete message object
          console.log('Adding AI message to chat:', aiMessage);
          if (!messages.some(msg => msg && msg.id && msg.id === aiMessage.id)) {
            setMessages(prev => [...prev, aiMessage]);
          }
        } else if (aiResponse.data?.sendMessage?.message?.content) {
          // We have message content but might be missing some fields
          const messageWithDefaults = {
            id: `ai-${Date.now()}-${Math.random()}`,
            content: aiResponse.data.sendMessage.message.content,
            is_bot: true,
            created_at: new Date().toISOString(),
            chat_id: chatId,
            user_id: null
          };
          console.log('Adding AI message to chat with defaults:', messageWithDefaults);
          setMessages(prev => [...prev, messageWithDefaults]);
        }
        // Remove the fallback success message - only show real AI responses

        // Refresh messages from database to ensure UI is in sync
        setTimeout(() => {
          refreshMessages();
        }, 1000); // Wait 1 second for database to be updated
      } else {
        console.log('AI action failed, checking for errors:', aiResponse.data?.sendMessage?.error);
        // Add error message to chat
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}-${Math.random()}`,
          content: `AI Response Error: ${aiResponse.data?.sendMessage?.error || 'Unknown error'}`,
          is_bot: true,
          created_at: new Date().toISOString(),
          chat_id: chatId,
          user_id: null
        }]);
      }
    } catch (error) {
      console.error('Error calling sendMessage action:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}-${Math.random()}`, // More unique ID
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        is_bot: true,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>Error loading chat. Please try again.</p>
        </div>
      </div>
    );
  }

  const chatTitle = chatData?.chats_by_pk?.title || 'Chat';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {/* Three Dots Menu Button */}
          <button
            onClick={onSidebarToggle || (() => { })}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Open sidebar menu"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c.23 0 .45-.08.62-.23l.06-.06a.5.5 0 0 1 .7-.7l.06.06c.15.17.23.39.23.62 0 .23-.08.45-.23.62l-.06.06a.5.5 0 0 1-.7.7l-.06-.06A.5.5 0 0 1 6 5zm0 7c.23 0 .45-.08.62-.23l.06-.06a.5.5 0 0 1 .7-.7l.06.06c.15.17.23.39.23.62 0 .23-.08.45-.23.62l-.06.06a.5.5 0 0 1-.7.7l-.06-.06A.5.5 0 0 1 6 12zm0 7c.23 0 .45-.08.62-.23l.06-.06a.5.5 0 0 1 .7-.7l.06.06c.15.17.23.39.23.62 0 .23-.08.45-.23.62l-.06.06a.5.5 0 0 1-.7.7l-.06-.06A.5.5 0 0 1 6 19z" />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-white p-2">
            <img
              src="/chatbotlogo.png"
              alt="AI Assistant"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{chatTitle}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={18} className="text-gray-600" />
            ) : (
              <Sun size={18} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 px-4 py-6">
        <MessageList
          messages={messages}
          isLoading={isLoading}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;