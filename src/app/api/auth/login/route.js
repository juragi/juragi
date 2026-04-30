import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/userStore';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. 입력값 검증 (trim 추가로 공백 실수 방지)
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return NextResponse.json({ error: '정보를 모두 입력해주세요.' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 2. 유저 조회 (반드시 관리자 권한 클라이언트 사용 확인!)
    const user = await getUserByEmail(cleanEmail);

    // 보안 팁: 유저가 없더라도 바로 401을 내보내 유저 존재 여부를 유추하지 못하게 함
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 3. 토큰 생성
    const token = createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json(
      { message: '로그인에 성공했습니다.' },
      { status: 200 }
    );

// 4. 쿠키 설정 강화
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션에선 HTTPS만
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('API /auth/login error', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
