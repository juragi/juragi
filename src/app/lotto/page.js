'use client'

import { useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'

export default function LottoGenerator() {
  const [excludedNumbers, setExcludedNumbers] = useState([])
  const [fixedNumbers, setFixedNumbers] = useState([])
  const [currentResult, setCurrentResult] = useState('')
  const [history, setHistory] = useState([])
  
  const captureRef = useRef(null)
  const totalNumbers = Array.from({ length: 45 }, (_, i) => i + 1)

  // 숫자 클릭 핸들러 (순환: 기본 -> 제외 -> 고정 -> 기본)
  const handleNumberClick = (num) => {
    if (excludedNumbers.includes(num)) {
      if (fixedNumbers.length >= 5) {
        setExcludedNumbers(excludedNumbers.filter(n => n !== num))
        return
      }
      setExcludedNumbers(excludedNumbers.filter(n => n !== num))
      setFixedNumbers([...fixedNumbers, num])
    } else if (fixedNumbers.includes(num)) {
      setFixedNumbers(fixedNumbers.filter(n => n !== num))
    } else {
      if (45 - (excludedNumbers.length + 1) < 6) {
        alert("최소 6개의 번호는 남겨두어야 합니다.")
        return
      }
      setExcludedNumbers([...excludedNumbers, num])
    }
  }

  // 번호 추첨 로직
  const generateNumbers = () => {
    const available = totalNumbers.filter(
      n => !excludedNumbers.includes(n) && !fixedNumbers.includes(n)
    )
    
    const neededCount = 6 - fixedNumbers.length
    if (available.length < neededCount) {
      alert("조합 가능한 번호가 부족합니다.")
      return
    }

    const picks = [...fixedNumbers]
    const pool = [...available]
    
    while (picks.length < 6) {
      const index = Math.floor(Math.random() * pool.length)
      picks.push(pool.splice(index, 1)[0])
    }

    const resultString = picks.sort((a, b) => a - b).join(', ')
    setCurrentResult(resultString)
    setHistory([{ result: resultString, time: new Date().toLocaleString() }, ...history].slice(0, 50))
  }

  // 이미지로 저장 (잘림 방지 수정 버전)
  const saveAsImage = async () => {
    if (captureRef.current === null) return
    try {
      const dataUrl = await toPng(captureRef.current, { 
        cacheBust: true, 
        backgroundColor: '#f8fafc', // 전체 배경색 고정
      })
      const link = document.createElement('a')
      link.download = `juragi-lotto-${new Date().getTime()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-10 flex flex-col items-center font-sans select-none">
      <div className="max-w-md w-full space-y-6">
        
        {/* 헤더 섹션 */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
            Lotto <span className="text-emerald-500">Pro</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase px-1">
            juragi.vercel.app
          </p>
        </header>

        {/* 캡처를 위해 실제 UI를 감싸는 영역 */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <div ref={captureRef} className="bg-[#f8fafc] p-6 rounded-[2.2rem] space-y-5">
            
            {/* 가이드 안내문 (이미지 저장 시에도 포함됨) */}
            <div className="flex justify-center items-center gap-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">1Click: 제외</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">2Click: 고정</span>
              </div>
            </div>

            {/* 숫자판 */}
            <div className="grid grid-cols-7 gap-1.5 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              {totalNumbers.map(num => {
                const isExcluded = excludedNumbers.includes(num)
                const isFixed = fixedNumbers.includes(num)
                return (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className={`aspect-square rounded-lg font-black text-xs transition-all ${
                      isExcluded ? 'bg-rose-500 text-white shadow-md shadow-rose-100' :
                      isFixed ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-100' :
                      'bg-slate-50 text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>

            {/* 추첨 결과 출력 */}
            {currentResult ? (
              <div className="bg-slate-900 p-5 rounded-2xl text-center shadow-lg">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Selected Combination</p>
                <p className="text-xl font-black text-white tracking-wider">
                  {currentResult.split(', ').map((n, i) => (
                    <span key={i} className={fixedNumbers.includes(parseInt(n)) ? "text-emerald-400" : ""}>
                      {n}{i < 5 ? ', ' : ''}
                    </span>
                  ))}
                </p>
                <p className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter mt-3 opacity-50">
                  © juragi toolkit
                </p>
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ready to Generate</p>
              </div>
            )}
          </div>

          {/* 하단 컨트롤 버튼 (캡처 영역 외부) */}
          <div className="flex gap-2 p-4 pt-0">
            <button
              onClick={generateNumbers}
              className="flex-grow py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.95] shadow-lg shadow-emerald-100"
            >
              Generate
            </button>
            <button
              onClick={saveAsImage}
              title="이미지로 저장"
              className="px-6 py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black hover:text-slate-900 hover:border-slate-200 transition-all active:bg-slate-50 shadow-sm"
            >
              💾
            </button>
          </div>
        </div>

        {/* 히스토리 섹션 */}
        {history.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent History</span>
              <button onClick={() => setHistory([])} className="text-[9px] font-black text-rose-300 uppercase hover:text-rose-500 transition-colors">Clear All</button>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
              {history.map((item, index) => (
                <div key={index} className="px-6 py-3 flex justify-between items-center text-sm hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-600 tabular-nums tracking-tight">{item.result}</span>
                  <span className="text-[9px] text-slate-300 font-mono italic">{item.time.split(' ').slice(1, 4).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}