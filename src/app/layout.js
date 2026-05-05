import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'My Personal Toolkit',
  description: '나에게 필요한 모든 도구 모음',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-800 overflow-x-hidden min-h-screen">
        <nav className="h-16 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-black italic tracking-tighter text-slate-900">
              TOOL<span className="text-indigo-600">KIT</span>
            </Link>
            <div className="flex gap-6 text-sm font-bold uppercase tracking-wider">
              <Link href="/currency" className="hover:text-indigo-600 transition-colors">Currency</Link>
              <Link href="/lotto" className="hover:text-indigo-600 transition-colors text-slate-400">Lotto(준비중)</Link>
              <Link href="/stock" className="hover:text-indigo-600 transition-colors text-slate-400">Stock(준비중)</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}