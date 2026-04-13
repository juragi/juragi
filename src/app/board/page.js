"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// 샘플 게시판 데이터
const samplePosts = [
  {
    id: 1,
    title: "Next.js 16 새로운 기능 소개",
    thumbnail: "https://picsum.photos/200/150?random=1",
    createdAt: "2024-01-15T10:30:00Z",
    excerpt: "Next.js 16의 주요 업데이트 사항들을 살펴보겠습니다."
  },
  {
    id: 2,
    title: "React 19의 새로운 훅들",
    thumbnail: "https://picsum.photos/200/150?random=2",
    createdAt: "2024-01-14T14:20:00Z",
    excerpt: "React 19에서 추가된 새로운 훅들의 사용법을 알아봅니다."
  },
  {
    id: 3,
    title: "Tailwind CSS 최적화 기법",
    thumbnail: "https://picsum.photos/200/150?random=3",
    createdAt: "2024-01-13T09:15:00Z",
    excerpt: "Tailwind CSS를 더 효율적으로 사용하는 방법들입니다."
  },
  {
    id: 4,
    title: "Supabase로 풀스택 앱 만들기",
    thumbnail: "https://picsum.photos/200/150?random=4",
    createdAt: "2024-01-12T16:45:00Z",
    excerpt: "Supabase를 활용한 현대적인 웹 애플리케이션 개발."
  },
  {
    id: 5,
    title: "TypeScript 마이그레이션 가이드",
    thumbnail: "https://picsum.photos/200/150?random=5",
    createdAt: "2024-01-11T11:30:00Z",
    excerpt: "JavaScript 프로젝트를 TypeScript로 마이그레이션하는 방법."
  }
];

export default function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 Supabase나 API에서 데이터를 가져올 수 있음
    const loadPosts = async () => {
      setLoading(true);
      // 샘플 데이터 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(samplePosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            게시판
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            최신 글들을 확인해보세요
          </p>
        </div>

        {/* 게시글 리스트 */}
        <div className="space-y-6">
          {loading ? (
            // 로딩 상태
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="h-24 w-32 flex-shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                      <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="group flex gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                {/* 썸네일 */}
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-32 overflow-hidden rounded-xl">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="128px"
                    />
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-black dark:text-zinc-50 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                    <Link href={`/board/${post.id}`} className="block">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                {/* 작성일 */}
                <div className="flex-shrink-0 text-right">
                  <time className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">
                아직 게시글이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}