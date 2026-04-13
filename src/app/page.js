"use client"; // 클라이언트 컴포넌트임을 선언

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [testItems, setTestItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setError(null);
    setLoading(true);

    if (!supabase) {
      setError("Supabase 환경변수가 설정되지 않았습니다.");
      setTestItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("test")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestItems(data ?? []);
    } catch (fetchError) {
      setError(fetchError?.message ?? "알 수 없는 오류가 발생했습니다.");
      setTestItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
                          {item.created_at ? new Date(item.created_at).toLocaleString() : "생성일 없음"}
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
            onClick={fetchItems}
          >
            데이터 새로고침
          </button>
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-black px-8 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            회원가입 페이지 이동
          </Link>
          <Link
            href="/board"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-black px-8 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            게시판 보기
          </Link>
        </div>
      </main>
    </div>
  );
}