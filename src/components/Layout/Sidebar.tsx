import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/react';
import { useSubscription } from '@apollo/client';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/queries';
import { Chat } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onCreateChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  chats,
  selectedChatId,
  onChatSelect,
  onCreateChat,
  isOpen,
  onClose
}: SidebarProps) {
  const { signOut } = useSignOut();
  const { isAuthenticated } = useAuthenticationStatus();
  const user = useUserData();
  const [isCreating, setIsCreating] = useState(false);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const { theme } = useTheme();

  // Initialize message counts from chats
  useEffect(() => {
    const counts: Record<string, number> = {};
    chats.forEach(chat => {
      counts[chat.id] = chat.messages?.length || 0;
    });
    setMessageCounts(counts);
  }, [chats]);

  // Subscribe to real-time message updates
  const { data: subscriptionData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: selectedChatId || '' },
    skip: !selectedChatId,
    onData: ({ data }) => {
      if (data?.data?.messages) {
        const newMessage = data.data.messages[0];
        if (newMessage) {
          setMessageCounts(prev => ({
            ...prev,
            [newMessage.chat_id]: (prev[newMessage.chat_id] || 0) + 1
          }));
        }
      }
    }
  });

  const handleCreateChat = async () => {
    setIsCreating(true);
    await onCreateChat();
    setIsCreating(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-full sm:w-80 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border-r border-gray-200'} flex flex-col
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
      `}>
        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 dark:bg-white p-2">
                <img
                  src="/chatbotlogo.png"
                  alt="AI Chatbot"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold">AI Chatbot</h1>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleCreateChat}
            disabled={isCreating}
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2
                     transition-colors duration-200 ${theme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800'
              }`}
          >
            <Plus size={16} />
            {isCreating ? 'Creating...' : 'New Chat'}
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 opacity-50 bg-blue-100 dark:bg-white p-2">
                <img
                  src="/chatbotlogo.png"
                  alt="No chats"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>No chats yet</p>
              <p className="text-sm">Create your first chat to get started</p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    onChatSelect(chat.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors duration-200
                    ${selectedChatId === chat.id
                      ? theme === 'dark'
                        ? 'bg-white text-gray-900'
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-white p-1">
                      <img
                        src="/chatbotlogo.png"
                        alt="Chat"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{chat.title}</p>
                      <p className={`text-xs font-medium ${selectedChatId === chat.id
                        ? 'text-black'
                        : theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                        }`}>
                        {messageCounts[chat.id] || 0} {messageCounts[chat.id] === 1 ? 'message' : 'messages'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          {/* User Profile Section */}
          <div className={`flex items-center gap-3 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'}`}>
              <span className="text-white text-sm font-medium">
                {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
              title="Sign Out"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}