"use client"; // 이 파일은 브라우저에서 동작함을 명시

import Image from "next/image";
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 클라이언트 설정 (보통은 별도 파일로 분리하지만 테스트를 위해 상단에 배치)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. 서버 컴포넌트를 async 함수로 변경
export default async function Home() {
  
  // 3. 데이터 가져오기 (C#의 await _context.Test.ToListAsync()와 유사)
  const { data: testItems, error } = await supabase
    .from("test")
    .select("*")
    .order("created_at", { ascending: false }); // 최신순 정렬

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Supabase 데이터베이스 연동 확인
          </h1>

          {/* 4. 에러 처리 및 데이터 렌더링 */}
          {error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
              데이터를 불러오지 못했습니다: {error.message}
            </div>
          ) : (
            <div className="w-full mt-4">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Test 테이블 항목 ({testItems?.length || 0})
              </h2>
              
              <ul className="grid gap-3 w-full">
                {testItems && testItems.length > 0 ? (
                  testItems.map((item) => (
                    <li 
                      key={item.id} 
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-1"
                    >
                      <span className="font-mono text-xs text-blue-500">ID: {item.id}</span>
                      {/* 테이블의 컬럼명에 따라 item.content 혹은 item.name 등으로 수정하세요 */}
                      <p className="text-zinc-800 dark:text-zinc-200">
                        {item.content || "내용 없음"}
                      </p>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-zinc-500 italic">표시할 데이터가 없습니다. DB에 행을 추가해 보세요!</p>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button 
            className="flex h-12 items-center justify-center rounded-full bg-black text-white px-8 transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={() => window.location.reload()} // 간단한 새로고침 버튼 (클라이언트 기능이 필요하면 'use client' 추가 필요)
          >
            데이터 새로고침
          </button>
        </div>
      </main>
    </div>
  );
}