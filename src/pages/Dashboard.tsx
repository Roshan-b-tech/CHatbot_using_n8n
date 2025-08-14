import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHATS } from '../graphql/queries';
import { CREATE_CHAT } from '../graphql/mutations';
import ChatInterface from '../components/Chat/ChatInterface';
import { EmptyState } from '../components/Dashboard/EmptyState';
import { Sidebar } from '../components/Layout/Sidebar';
import { useAuthenticationStatus, useUserData } from '@nhost/react';

const Dashboard: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const user = useUserData();

  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery(GET_CHATS, {
    variables: { userId: user?.id },
    skip: !isAuthenticated || !user?.id,
  });

  const [createChat] = useMutation(CREATE_CHAT);

  useEffect(() => {
    if (chatsData?.chats && chatsData.chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chatsData.chats[0].id);
    }
  }, [chatsData, selectedChatId]);

  const handleCreateChat = async () => {
    if (isCreatingChat || !user?.id) return;

    setIsCreatingChat(true);
    try {
      const result = await createChat({
        variables: {
          title: `New Chat ${new Date().toLocaleDateString()}`,
          userId: user.id
        }
      });

      if (result.data?.insert_chats_one) {
        const newChat = result.data.insert_chats_one;
        setSelectedChatId(newChat.id);
        refetchChats();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (chatsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  const chats = chatsData?.chats || [];

  if (chats.length === 0) {
    return (
      <EmptyState onCreateChat={handleCreateChat} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={(chatId) => {
            setSelectedChatId(chatId);
            setIsSidebarOpen(false); // Close sidebar on mobile after chat selection
          }}
          onCreateChat={handleCreateChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">

          {selectedChatId ? (
            <ChatInterface
              chatId={selectedChatId}
              onSidebarToggle={() => setIsSidebarOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a chat</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;