"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// 샘플 게시글 상세 데이터
const samplePostDetails = {
  1: {
    id: 1,
    title: "Next.js 16 새로운 기능 소개",
    thumbnail: "https://picsum.photos/800/400?random=1",
    createdAt: "2024-01-15T10:30:00Z",
    author: "개발자",
    content: `
# Next.js 16 새로운 기능 소개

Next.js 16이 드디어 출시되었습니다! 이번 버전에서는 개발자 경험을 크게 향상시키는 여러 새로운 기능들이 추가되었습니다.

## 주요 업데이트 사항

### 1. 향상된 React Server Components
- 서버 컴포넌트의 성능이 크게 개선되었습니다.
- 클라이언트와 서버 컴포넌트 간의 데이터 흐름이 더욱 원활해졌습니다.

### 2. 새로운 빌드 시스템
- Turbopack의 안정성이 향상되었습니다.
- 더 빠른 개발 서버 시작 시간
- 개선된 핫 리로딩 기능

### 3. 향상된 이미지 최적화
- WebP 지원 강화
- 더 나은 lazy loading
- 자동 이미지 포맷 변환

## 마이그레이션 가이드

기존 Next.js 15 프로젝트에서 16으로 업그레이드하려면:

\`\`\`bash
npm install next@latest react@latest react-dom@latest
\`\`\`

주요 변경사항:
- Node.js 18.17 이상 필요
- 일부 API의 시그니처 변경
- 새로운 환경변수 설정 필요

## 결론

Next.js 16은 현대적인 웹 개발을 위한 강력한 도구를 제공합니다. 새로운 기능들을 적극적으로 활용하여 더 나은 사용자 경험을 만들어 보세요!
    `,
    tags: ["Next.js", "React", "웹개발"]
  },
  2: {
    id: 2,
    title: "React 19의 새로운 훅들",
    thumbnail: "https://picsum.photos/800/400?random=2",
    createdAt: "2024-01-14T14:20:00Z",
    author: "프론트엔드 개발자",
    content: `
# React 19의 새로운 훅들

React 19에서 추가된 새로운 훅들을 소개합니다. 이러한 훅들은 복잡한 상태 관리를 더욱 쉽게 만들어줍니다.

## 새로운 훅 소개

### useOptimistic
비동기 작업의 결과를 미리 예측하여 UI를 업데이트합니다.

\`\`\`jsx
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => ({ ...currentState, ...optimisticValue })
);
\`\`\`

### useFormState
폼 상태 관리를 위한 새로운 훅입니다.

\`\`\`jsx
const [state, formAction] = useFormState(action, initialState);
\`\`\`

### useFormStatus
폼 제출 상태를 추적합니다.

## 기존 훅 개선사항

### useEffect
더 나은 의존성 추적
자동 클린업 기능 강화

### useMemo / useCallback
메모이제이션 알고리즘 개선

## 실전 예제

다음은 새로운 훅들을 활용한 실전 예제입니다:

\`\`\`jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, newTodo]
  );

  const addTodo = async (text) => {
    addOptimisticTodo({ id: Date.now(), text, completed: false });

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      const newTodo = await response.json();
      setTodos(current => [...current, newTodo]);
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <div>
      {optimisticTodos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
\`\`\`

React 19의 새로운 기능들을 활용하여 더 효율적이고 사용자 친화적인 애플리케이션을 만들어 보세요!
    `,
    tags: ["React", "Hooks", "JavaScript"]
  },
  3: {
    id: 3,
    title: "Tailwind CSS 최적화 기법",
    thumbnail: "https://picsum.photos/800/400?random=3",
    createdAt: "2024-01-13T09:15:00Z",
    author: "UI/UX 개발자",
    content: `
# Tailwind CSS 최적화 기법

Tailwind CSS를 더 효율적으로 사용하는 방법들을 알아보겠습니다.

## CSS 번들 크기 최적화

### 1. PurgeCSS 설정
사용하지 않는 CSS 클래스를 자동으로 제거합니다.

\`\`\`js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
}
\`\`\`

### 2. JIT 모드 활용
Just-In-Time 컴파일러를 사용하여 필요한 CSS만 생성합니다.

### 3. @apply 지양
가능한 @apply 대신 유틸리티 클래스를 직접 사용하세요.

## 성능 향상 팁

### 1. 컴포넌트별 스타일 분리
\`\`\`jsx
// ❌ 좋지 않은 예
<div className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">

// ✅ 좋은 예
const Button = ({ children }) => (
  <button className="btn-primary">
    {children}
  </button>
);
\`\`\`

### 2. 반응형 디자인
모바일 퍼스트 접근법을 사용하세요.

\`\`\`jsx
// 모바일 우선
<div className="text-sm md:text-base lg:text-lg">
  반응형 텍스트
</div>
\`\`\`

### 3. 다크 모드 지원
\`\`\`jsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  다크 모드 지원
</div>
\`\`\`

## 커스텀 유틸리티 클래스

자주 사용하는 패턴을 커스텀 클래스로 정의하세요.

\`\`\`css
/* globals.css */
@layer components {
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }

  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
}
\`\`\`

## 개발 생산성 향상

### 1. VS Code 확장
Tailwind CSS IntelliSense 확장을 설치하세요.

### 2. 디자인 시스템 구축
일관된 디자인을 위한 컴포넌트 라이브러리를 구축하세요.

### 3. 자동 정렬
Prettier와 Tailwind CSS 정렬 플러그인을 사용하세요.

Tailwind CSS의 강력한 기능을 최대한 활용하여 아름답고 효율적인 UI를 만들어 보세요!
    `,
    tags: ["Tailwind CSS", "CSS", "프론트엔드"]
  },
  4: {
    id: 4,
    title: "Supabase로 풀스택 앱 만들기",
    thumbnail: "https://picsum.photos/800/400?random=4",
    createdAt: "2024-01-12T16:45:00Z",
    author: "풀스택 개발자",
    content: `
# Supabase로 풀스택 앱 만들기

Supabase를 활용하여 현대적인 풀스택 애플리케이션을 구축하는 방법을 알아보겠습니다.

## Supabase란?

Supabase는 Firebase의 오픈소스 대안으로, PostgreSQL 데이터베이스와 실시간 기능을 제공합니다.

## 시작하기

### 1. 프로젝트 생성
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm install @supabase/supabase-js
\`\`\`

### 2. 환경변수 설정
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. 클라이언트 초기화
\`\`\`js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
\`\`\`

## 데이터베이스 작업

### 테이블 생성
Supabase 대시보드에서 SQL 편집기를 사용하여 테이블을 생성합니다.

\`\`\`sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
\`\`\`

### 데이터 조회
\`\`\`js
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
\`\`\`

### 데이터 삽입
\`\`\`js
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: '새 글', content: '내용입니다.' }
  ])
\`\`\`

## 인증 구현

### 회원가입
\`\`\`js
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
\`\`\`

### 로그인
\`\`\`js
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
\`\`\`

### 현재 사용자 확인
\`\`\`js
const { data: { user } } = await supabase.auth.getUser()
\`\`\`

## 실시간 기능

Supabase의 실시간 기능을 활용하여 실시간 채팅이나 협업 기능을 구현할 수 있습니다.

\`\`\`js
const channel = supabase
  .channel('posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'posts'
  }, (payload) => {
    console.log('새 글이 추가되었습니다:', payload.new)
  })
  .subscribe()
\`\`\`

## 보안

### RLS (Row Level Security)
Supabase의 RLS를 사용하여 데이터 접근을 제어합니다.

\`\`\`sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 글만 볼 수 있음" ON posts
  FOR SELECT USING (auth.uid() = user_id);
\`\`\`

## 배포

Vercel에 쉽게 배포할 수 있습니다.

\`\`\`bash
npm run build
npm run start
\`\`\`

Supabase를 활용하면 백엔드 개발 없이도 강력한 풀스택 애플리케이션을 구축할 수 있습니다!
    `,
    tags: ["Supabase", "PostgreSQL", "풀스택"]
  },
  5: {
    id: 5,
    title: "TypeScript 마이그레이션 가이드",
    thumbnail: "https://picsum.photos/800/400?random=5",
    createdAt: "2024-01-11T11:30:00Z",
    author: "TypeScript 전문가",
    content: `
# TypeScript 마이그레이션 가이드

JavaScript 프로젝트를 TypeScript로 마이그레이션하는 방법을 단계별로 알아보겠습니다.

## 왜 TypeScript인가?

TypeScript는 다음과 같은 이점을 제공합니다:

- **타입 안전성**: 런타임 에러 감소
- **개발자 경험 향상**: IntelliSense, 리팩토링 지원
- **유지보수성**: 코드의 의도가 명확해짐
- **대규모 프로젝트 적합**: 복잡한 코드베이스 관리 용이

## 마이그레이션 전략

### 단계적 마이그레이션
한 번에 모든 파일을 변환하지 말고, 점진적으로 진행하세요.

### 1. TypeScript 설치
\`\`\`bash
npm install --save-dev typescript @types/node @types/react @types/react-dom
\`\`\`

### 2. tsconfig.json 생성
\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
\`\`\`

### 3. 파일 확장자 변경
.js → .ts, .jsx → .tsx로 변경하세요.

### 4. 타입 정의

#### 기본 타입
\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
}

type Status = 'active' | 'inactive' | 'pending';
\`\`\`

#### 함수 타입
\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const greetArrow = (name: string): string => \`Hello, \${name}!\`;
\`\`\`

#### 제네릭
\`\`\`ts
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("Hello");
\`\`\`

### 5. React 컴포넌트 타입화

#### 함수 컴포넌트
\`\`\`tsx
interface Props {
  title: string;
  onClick: () => void;
}

const Button: React.FC<Props> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};
\`\`\`

#### 커스텀 훅
\`\`\`ts
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return { count, increment, decrement };
}
\`\`\`

## 일반적인 문제 해결

### 1. any 타입 피하기
가능한 한 구체적인 타입을 사용하세요.

### 2. 엄격 모드 활용
tsconfig.json에서 "strict": true를 유지하세요.

### 3. 유틸리티 타입 활용
\`\`\`ts
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;
\`\`\`

## 도구와 팁

### ESLint + TypeScript
\`\`\`bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
\`\`\`

### VS Code 설정
- TypeScript Importer 확장 설치
- 자동 타입 가져오기 설정

### 테스트
Jest와 함께 @types/jest를 사용하여 타입 안전한 테스트 작성.

## 결론

TypeScript 마이그레이션은 처음에는 부담스러울 수 있지만, 장기적으로는 큰 이득을 가져다줍니다. 작은 규모부터 시작하여 점진적으로 확장해 나가세요!
    `,
    tags: ["TypeScript", "JavaScript", "마이그레이션"]
  }
};

export default function BoardDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      // 실제로는 API에서 데이터를 가져올 수 있음
      await new Promise(resolve => setTimeout(resolve, 300));

      const postId = params.id;
      const postData = samplePostDetails[postId];

      if (postData) {
        setPost(postData);
      }
      setLoading(false);
    };

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
            게시글을 찾을 수 없습니다
          </h1>
          <Link
            href="/board"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            게시판으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <article className="mx-auto max-w-4xl px-6 py-16">
        {/* 헤더 */}
        <header className="mb-12">
          <div className="mb-6">
            <Link
              href="/board"
              className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← 게시판으로 돌아가기
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>작성자: {post.author}</span>
            <span>•</span>
            <time>{formatDate(post.createdAt)}</time>
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 썸네일 이미지 */}
        <div className="mb-12">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div
            className="text-zinc-800 dark:text-zinc-200 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
                .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mt-4 mb-2">$1</h3>')
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 overflow-x-auto my-4"><code>$2</code></pre>')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/\n/g, '<br>')
            }}
          />
        </div>

        {/* 푸터 */}
        <footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <div className="flex justify-between items-center">
            <Link
              href="/board"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              목록으로 돌아가기
            </Link>

            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              이 글을 공유해보세요
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}