import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  user: any;
  isAuthenticated: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLogin, user, isAuthenticated }) => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-[#1F1F1F] bg-white">
      {/* Navbar */}
      <div className="fixed top-0 w-full z-50 bg-white dark:bg-[#1F1F1F] border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-x-2">
            <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl text-gray-900 dark:text-gray-100">Success Diary</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.email}
                </span>
                <button
                  onClick={onEnter}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg transition-colors"
                >
                  Enter App
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEnter}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  Preview
                </button>
                <button
                  onClick={onLogin}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-y-8 px-6 pt-20 pb-10">
        {/* Heading */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">
            Your Thoughts, Dreams, & Revelations. Captured. Welcome to{' '}
            <span className="underline decoration-gray-400">Success Diary</span>
          </h1>
          <h3 className="text-base sm:text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300">
            Success Diary is the reflective journal where{' '}
            <br className="hidden sm:block" />
            your journey toward success unfolds with AI insights.
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Your Journey
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <>
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  Preview Demo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Sign In & Start
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Images */}
        <div className="flex flex-col items-center justify-center max-w-5xl">
          <div className="flex items-center">
            <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
              <img
                src="/yoga.png"
                className="w-full h-full object-contain dark:hidden rounded-xl"
                alt="Mindful reflection"
              />
              <img
                src="/yoga.png"
                className="w-full h-full object-contain hidden dark:block rounded-xl"
                alt="Mindful reflection"
              />
            </div>
            <div className="relative h-[400px] w-[400px] hidden md:block">
              <img
                src="/grow.png"
                className="w-full h-full object-contain dark:hidden rounded-xl"
                alt="Personal growth"
              />
              <img
                src="/grow.png"
                className="w-full h-full object-contain hidden dark:block rounded-xl"
                alt="Personal growth"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Built with love for personal growth and reflection
        </p>
      </div>
    </div>
  );
};

export default LandingPage;