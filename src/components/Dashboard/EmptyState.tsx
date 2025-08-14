import React from 'react';

interface EmptyStateProps {
  onCreateChat: () => void;
}

export function EmptyState({ onCreateChat }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* Hero Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8">
          <img
            src="/chatbotlogo.png"
            alt="AI Assistant"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your AI Assistant
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Start a conversation with our advanced AI chatbot. Ask questions, get help, or just chat about anything on your mind.
        </p>

        {/* CTA Button */}
        <button
          onClick={onCreateChat}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start Your First Chat
        </button>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
            <p className="text-sm text-gray-500">Get instant AI responses</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure & Private</h3>
            <p className="text-sm text-gray-500">Your conversations are protected</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart AI</h3>
            <p className="text-sm text-gray-500">Powered by advanced technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}