import React from 'react';
import { Menu, MoreVertical } from 'lucide-react';
import { useUserData } from '@nhost/react';

interface HeaderProps {
  onMenuClick: () => void;
  currentChatTitle?: string;
}

export function Header({ onMenuClick, currentChatTitle }: HeaderProps) {
  const user = useUserData();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle sidebar menu"
          >
            <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img
                src="/chatbotlogo.png"
                alt="Chat"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentChatTitle || 'Select a chat'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {user?.email}
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}