import React from 'react';

interface PreviewBannerProps {
  onLogin: () => void;
}

const PreviewBanner: React.FC<PreviewBannerProps> = ({ onLogin }) => {
  return (
    <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 p-3 text-center">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-medium">Preview Mode</span>
        </div>
        <span className="text-gray-400">•</span>
        <span className="text-sm">Sign in to save your work and unlock AI insights</span>
        <button
          onClick={onLogin}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default PreviewBanner;