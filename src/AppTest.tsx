import React from 'react';

const AppTest: React.FC = () => {
  console.log('🧪 AppTest component rendering...');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 App Test - Success Diary
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the basic React setup is working!
        </p>
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Environment:</strong> {import.meta.env.MODE}
          </div>
          <div className="text-sm">
            <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
          </div>
          <div className="text-sm">
            <strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
          </div>
        </div>
        <button 
          onClick={() => console.log('Button clicked!')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default AppTest; 