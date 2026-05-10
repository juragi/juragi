import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-16 space-y-12">
      {/* 히어로 섹션 */}
      <header className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
          JURAGI <span className="text-indigo-600 font-normal not-italic">TOOL</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-md leading-relaxed">
          일상의 소소한 계산부터 투자 전략까지, <br />
          심플하지만 강력한 개인용 도구 모음입니다.
        </p>
      </header>

      {/* 도구 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 환율 계산기 */}
        <Link href="/currency">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-indigo-500 hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">💵</span>
            </div>
            <span className="text-4xl mb-6 block">💵</span>
            <h2 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Currency</h2>
            <p className="text-slate-500 text-sm mt-3 font-medium">
              소수점 낙차를 활용한 <br />최적의 환전 금액 계산기
            </p>
            <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-indigo-500">
              Launch Tool →
            </div>
          </div>
        </Link>

        {/* 로또 추첨기 */}
        <Link href="/lotto">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-500 hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">🎰</span>
            </div>
            <span className="text-4xl mb-6 block">🎰</span>
            <h2 className="text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">Lotto Pro</h2>
            <p className="text-slate-500 text-sm mt-3 font-medium">
              제외수와 고정수를 활용한 <br />전략적 번호 조합 생성기
            </p>
            <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-emerald-500">
              Launch Tool →
            </div>
          </div>
        </Link>
        
        {/* 다음 도구 예고 (Stock) */}
        <div className="bg-slate-50/50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group">
          <span className="text-4xl mb-4 grayscale opacity-30">📈</span>
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">Next Tool: Stock</p>
          <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase">Average Price Calculator</p>
        </div>

      </div>

      {/* 푸터 느낌의 하단 문구 */}
      <footer className="pt-10 border-t border-slate-100 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          Handcrafted by Juragi
        </p>
      </footer>
    </div>
  )
}