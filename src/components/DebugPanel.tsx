import React from 'react';
import { supabase } from '../services/supabase';

interface DebugPanelProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ user, onLogin, onLogout }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [sessionInfo, setSessionInfo] = React.useState<any>(null);

  const checkSession = async () => {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      setSessionInfo(data);
      console.log('🔍 Debug: Current session info:', data);
    }
  };

  const clearAllStorage = () => {
    console.log('🧹 Debug: Clearing all storage...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Debug: All storage cleared');
  };

  const showStorageInfo = () => {
    console.log('📦 Debug: LocalStorage keys:', Object.keys(localStorage));
    console.log('📦 Debug: SessionStorage keys:', Object.keys(sessionStorage));
  };

  React.useEffect(() => {
    checkSession();
  }, [user]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full text-xs z-50"
        title="Show Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🐛 Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        {user && (
          <div>
            <strong>Email:</strong> {user.email}
          </div>
        )}
        <div>
          <strong>Supabase:</strong> {supabase ? '✅ Available' : '❌ Not available'}
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex gap-1 mb-2">
            <button
              onClick={onLogin}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Login
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Logout
            </button>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={checkSession}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
            >
              Check Session
            </button>
            <button
              onClick={showStorageInfo}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
            >
              Show Storage
            </button>
            <button
              onClick={clearAllStorage}
              className="bg-orange-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear Storage
            </button>
          </div>
        </div>
        
        {sessionInfo && (
          <div className="border-t pt-2 mt-2">
            <strong>Session Info:</strong>
            <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel; 