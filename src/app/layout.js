'use client' // 경로 확인을 위해 추가

import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // 링크 스타일을 결정하는 함수
  const getLinkStyle = (path) => {
    const baseStyle = "transition-colors hover:text-indigo-600"
    const activeStyle = "text-indigo-600 font-black"
    const inactiveStyle = "text-slate-400"
    
    return pathname === path ? `${baseStyle} ${activeStyle}` : `${baseStyle} ${inactiveStyle}`
  }

  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-800 overflow-x-hidden min-h-screen font-sans">
        <nav className="h-16 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-black italic tracking-tighter text-slate-900">
              JURAGI <span className="text-indigo-600">TOOL</span>
            </Link>
            
            <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest">
              <Link href="/currency" className={getLinkStyle('/currency')}>
                Currency
              </Link>
              <Link href="/lotto" className={getLinkStyle('/lotto')}>
                Lotto
              </Link>
              <Link href="/stock" className={getLinkStyle('/stock')}>
                Stock(준비중)
              </Link>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
      </body>
    </html>
  )
}