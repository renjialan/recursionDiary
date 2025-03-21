'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Check project availability
  const { data: health } = await supabase.rpc('health');
  if (health?.status !== 'OK') {
    return {
      error: 'Authentication service unavailable. Please try again later.',
      success: false
    };
  }

  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'All fields are required', success: false };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error?.message.includes('invalid login credentials')) {
      return { error: 'Invalid email or password', success: false };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'Connection to authentication server failed',
      success: false
    };
  }
}