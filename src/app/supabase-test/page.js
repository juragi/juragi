'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseTestPage() {
  const [tableName, setTableName] = useState('profiles')
  const [status, setStatus] = useState('checking')
  const [message, setMessage] = useState('Supabase 연결을 확인하는 중입니다...')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const runTest = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setStatus('checking')
    setMessage('Supabase 연결을 확인하는 중입니다...')

    try {
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.')
      }

      const { data, error: supabaseError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (supabaseError) {
        throw supabaseError
      }

      setStatus('connected')
      setMessage(`연결 성공! ${tableName} 테이블에서 1건을 읽어왔습니다.`)
      setResult(data)
    } catch (err) {
      const detail = err?.message || '알 수 없는 오류가 발생했습니다.'
      setStatus('error')
      setMessage(`연결 테스트 실패: ${detail}`)
      setError(detail)
    } finally {
      setLoading(false)
    }
  }, [tableName])

  useEffect(() => {
    void runTest()
  }, [runTest])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-indigo-500">Supabase Test</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">DB 연결 테스트</h1>
          <p className="text-sm text-slate-500">
            입력한 테이블에서 1건을 조회해서 Supabase 연결 상태를 확인합니다.
          </p>
        </header>

        <label className="space-y-2 text-sm font-semibold text-slate-600">
          <span>테이블 이름</span>
          <input
            value={tableName}
            onChange={(event) => setTableName(event.target.value.trim() || 'profiles')}
            placeholder="예: profiles"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0"
          />
        </label>

        <button
          type="button"
          onClick={() => void runTest()}
          disabled={loading}
          className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? '확인 중...' : '테스트 다시 실행'}
        </button>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <p className="text-sm font-semibold text-slate-700">{message}</p>
          </div>

          {error ? (
            <pre className="whitespace-pre-wrap break-words text-sm text-rose-600">{error}</pre>
          ) : null}

          {result ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">조회 결과</p>
              <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
