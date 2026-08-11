//import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getUserByEmail(email) {
  if (!supabaseAdmin) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, password_hash, created_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    createdAt: data.created_at,
  };
}

export async function addUser({ email, passwordHash }) {
  if (!supabaseAdmin) {
    throw new Error('Supabase client is not configured.');
  }

  const normalizedEmail = email.toLowerCase();
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingUser) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{ email: normalizedEmail, password_hash: passwordHash }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('이미 존재하는 이메일입니다.');
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    createdAt: data.created_at,
  };
}
