import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-black text-slate-900 mb-8">My Toolkit</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/currency">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all group">
            <span className="text-4xl mb-4 block">💵</span>
            <h2 className="text-xl font-bold group-hover:text-indigo-600">환율 계산기</h2>
            <p className="text-slate-500 text-sm mt-2">소수점 낙차를 활용한 최적의 환전 금액 계산</p>
          </div>
        </Link>
        
        {/* 새로운 도구가 생길 때마다 아래에 카드를 추가하면 됩니다 */}
        <div className="bg-slate-100 p-8 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
          <p className="font-bold">새 기능 추가 예정</p>
        </div>
      </div>
    </div>
  )
}