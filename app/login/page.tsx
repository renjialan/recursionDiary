'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { login } from './action';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { error: undefined, success: false });
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/health`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }}
        );

        setServiceStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setServiceStatus('offline');
      }
    };

    checkSupabaseStatus();
    const interval = setInterval(checkSupabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 relative">
        {/* Service Status Indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full animate-pulse ${
            serviceStatus === 'online' ? 'bg-green-500' :
            serviceStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs text-gray-500">
            {serviceStatus.charAt(0).toUpperCase() + serviceStatus.slice(1)}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Welcome Back
        </h1>

        {serviceStatus === 'offline' && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
            Our authentication service is currently undergoing maintenance.
            Please try again later.
          </div>
        )}

        <form className="space-y-6" action={formAction}>
          {/* ... rest of your form elements ... */}
        </form>
      </div>
    </div>
  );
}