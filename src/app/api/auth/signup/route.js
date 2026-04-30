import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getUserByEmail, addUser } from '@/lib/userStore';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (await getUserByEmail(email)) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );

    }

    await addUser({ email, passwordHash: hashPassword(password) });
    return NextResponse.json(
      { message: '회원가입이 완료되었습니다. 로그인 페이지로 이동하세요.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /auth/signup error', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
