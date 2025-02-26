"use client"
import { useState } from 'react';
import { login, signup } from './action';

export default function LoginPage() {
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <form className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border rounded-md py-2 px-4"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full border rounded-md py-2 px-4"
          />
          
          <button
            formAction={login}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
          >
            Log in
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            formAction={signup}
            onClick={() => setIsSignUpSuccess(true)}
            className="w-full border-2 border-gray-900 text-gray-900 py-2 px-4 
              rounded-md hover:bg-gray-50 transition-colors focus:ring-2 
              focus:ring-gray-400 focus:ring-offset-2"
          >
            Sign up
          </button>

          {isSignUpSuccess && (
            <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">
                📬 We've sent a confirmation email to your address.<br/>
                Please check your inbox and verify your email.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Didn't receive it? Check spam folder or resend in 59s
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}