import React, { useEffect, useState } from 'react';
import { supabase, handleAuthCallback } from '../services/supabase';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processAuthCallback = async () => {
      console.log('🔄 AuthCallback: Processing OAuth callback...');
      console.log('  - Current URL:', window.location.href);
      console.log('  - URL parameters:', window.location.search);
      
      try {
        console.log('📞 Calling handleAuthCallback...');
        
        // Handle the OAuth callback
        const result = await handleAuthCallback();
        console.log('📤 handleAuthCallback result:', result);
        
        if (result?.error) {
          console.error('❌ Auth callback error:', result.error);
          setError('Authentication failed. Please try again.');
          setStatus('error');
          return;
        }

        console.log('🔍 Checking for session...');
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Session check result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        
        if (session) {
          console.log('✅ Authentication successful, redirecting to main app...');
          setStatus('success');
          // Redirect to the main app
          window.location.href = '/';
        } else {
          console.error('❌ No session found after callback');
          setError('Authentication failed. No session found.');
          setStatus('error');
        }
      } catch (err) {
        console.error('❌ Error processing auth callback:', err);
        setError('Authentication failed. Please try again.');
        setStatus('error');
      }
    };

    processAuthCallback();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Successful!</h2>
        <p className="text-gray-600">Redirecting you to the app...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 