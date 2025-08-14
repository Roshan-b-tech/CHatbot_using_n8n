import React from 'react';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
          <img
            src="/chatbotlogo.png"
            alt="AI Assistant"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
        <p className="text-gray-500 max-w-sm">
          Send a message to begin chatting with your AI assistant. I'm here to help with any questions you have!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages
        .filter(message => message && message.id) // Filter out undefined/null messages
        .filter((message, index, array) =>
          // Remove duplicate messages based on ID
          array.findIndex(msg => msg.id === message.id) === index
        )
        .map((message, index) => (
          <MessageBubble key={`${message.id}-${index}`} message={message} />
        ))}

      {isLoading && <TypingIndicator />}
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // Safety check for message data
  if (!message || !message.content) {
    console.warn('Invalid message data:', message);
    return null; // Don't render invalid messages
  }

  const isBot = message.is_bot;
  const timestamp = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'Unknown time';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden ${isBot
          ? 'bg-white border border-gray-200'
          : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
          {isBot ? (
            <img
              src="/chatbotlogo.png"
              alt="AI Assistant"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-4 h-4 text-white mx-auto mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${isBot
            ? 'bg-white text-gray-900 border border-gray-200'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Timestamp */}
          <span className={`text-xs text-gray-400 mt-1 px-1 ${isBot ? 'ml-1' : 'mr-1'}`}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200">
          <img
            src="/chatbotlogo.png"
            alt="AI Assistant"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageList;