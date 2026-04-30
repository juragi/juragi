"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          setUserEmail(null);
          return;
        }

        const data = await response.json();
        setUserEmail(data.email || null);
      } catch (fetchError) {
        setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">
            {userEmail ? `${userEmail}님, 환영합니다!` : '자체 회원가입 & 로그인 예제'}
          </h1>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            {userEmail
              ? '로그인 상태가 유지되고 있습니다.'
              : 'Supabase 없이 자체 인증 API를 이용한 흐름을 시작합니다.'}
          </p>

          {loading ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">사용자 정보를 불러오는 중...</p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/signup"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center text-black transition hover:border-black hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-white dark:hover:bg-zinc-800"
          >
            회원가입
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center text-black transition hover:border-black hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-white dark:hover:bg-zinc-800"
          >
            로그인
          </Link>

          <Link
            href="/board"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center text-black transition hover:border-black hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-white dark:hover:bg-zinc-800"
          >
            게시판
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <p className="mb-2 font-semibold">현재 구현된 기능</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>서버 API 기반 회원가입</li>
            <li>암호 해시 저장</li>
            <li>세션 쿠키 기반 로그인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
