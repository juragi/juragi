"use client"; // 클라이언트 컴포넌트임을 선언

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  // 상태 관리 (C#의 필드/프로퍼티 역할)
  const [testItems, setTestItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. 데이터 가져오기 함수 (async/await)
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("test")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTestItems(data);
    }
    setLoading(false);
  };

  // 3. 페이지 로드 시 최초 1회 실행 (무한 루프 방지)
  useEffect(() => {
    fetchItems();
  }, []); // 의존성 배열을 비워두어 단 한 번만 실행되게 합니다.

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-24 px-16 bg-white dark:bg-black sm:items-start">
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

          {loading ? (
            <p className="text-zinc-500 italic">데이터를 불러오는 중입니다...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 w-full">
              데이터를 불러오지 못했습니다: {error}
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
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-blue-500">ID: {item.id}</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 mt-1">
                        {item.content || "내용 없음"}
                      </p>
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
            onClick={fetchItems} // 새로고침 시 함수 재호출
          > 
            데이터 새로고침 
          </button>
        </div>
      </main>
    </div>
  );
}