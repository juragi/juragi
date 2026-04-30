import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getUserByEmail } from '@/lib/userStore';

export async function GET(request) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifySessionToken(session);
    if (!payload?.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await getUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, email: user.email }, { status: 200 });
  } catch (error) {
    console.error('API /auth/me error', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
