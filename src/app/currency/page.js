'use client'

import { useState, useEffect } from 'react'

export default function MultiCurrencyMaximizer() {
  const [usdBalance, setUsdBalance] = useState(100)
  const [usdRate, setUsdRate] = useState(1510.86)
  const [jpyBalance, setJpyBalance] = useState(10000)
  const [jpyRate100, setJpyRate100] = useState(915.42)

  const [usdResults, setUsdResults] = useState([])
  const [jpyResults, setJpyResults] = useState([])

  useEffect(() => {
    const savedData = localStorage.getItem('currency_calculator_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.usdBalance !== undefined) setUsdBalance(parsed.usdBalance);
        if (parsed.usdRate !== undefined) setUsdRate(parsed.usdRate);
        if (parsed.jpyBalance !== undefined) setJpyBalance(parsed.jpyBalance);
        if (parsed.jpyRate100 !== undefined) setJpyRate100(parsed.jpyRate100);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { usdBalance, usdRate, jpyBalance, jpyRate100 };
    localStorage.setItem('currency_calculator_data', JSON.stringify(dataToSave));

    setUsdResults(calculateDeals(usdBalance, usdRate, 0.01));
    setJpyResults(calculateDeals(jpyBalance, jpyRate100 / 100, 1));
  }, [usdBalance, usdRate, jpyBalance, jpyRate100]);

  const calculateDeals = (balance, unitRate, step) => {
    const MAX_ITERATIONS = 10000;
    const currentIterations = balance / step;
    if (currentIterations > MAX_ITERATIONS || balance <= 0) return [];

    const deals = [];
    for (let amt = step; amt <= balance + 0.00001; amt = parseFloat((amt + step).toFixed(2))) {
      const rawWon = amt * unitRate;
      const actualWon = Math.floor(rawWon);
      const effectiveRate = actualWon / amt;
      const remainder = rawWon - actualWon;

      deals.push({ amt, won: actualWon, effectiveRate, remainder });
    }

    return deals.sort((a, b) => {
      const rateA = a.effectiveRate.toFixed(4);
      const rateB = b.effectiveRate.toFixed(4);

      if (rateA === rateB) {
        if (Math.abs(a.amt - b.amt) > 0.000001) return b.amt - a.amt;
        return a.remainder - b.remainder;
      }
      return parseFloat(rateB) - parseFloat(rateA);
    }).slice(0, 5);
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-slate-50 font-sans text-slate-800 p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
            Currency <span className="text-indigo-600">Maximizer</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Micro-Profit Optimization</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencySection title="US Dollar" flag="🇺🇸" theme="indigo">
            <div className="grid grid-cols-2 gap-3">
              <InputBox label="Bal ($)" value={usdBalance} onChange={setUsdBalance} step={0.01} max={100} />
              <InputBox label="Rate" value={usdRate} onChange={setUsdRate} step={0.01} color="text-indigo-600" />
            </div>
            <div className="mt-6 space-y-2">
              {usdResults.map((d, i) => <ResultRow key={i} deal={d} symbol="$" fixed={2} isBest={i === 0} />)}
            </div>
          </CurrencySection>

          <CurrencySection title="JP Yen" flag="🇯🇵" theme="rose">
            <div className="grid grid-cols-2 gap-3">
              <InputBox label="Bal (¥)" value={jpyBalance} onChange={setJpyBalance} step={1} max={10000} />
              <InputBox label="Rate/100" value={jpyRate100} onChange={setJpyRate100} step={0.01} color="text-rose-500" />
            </div>
            <div className="mt-6 space-y-2">
              {jpyResults.map((d, i) => <ResultRow key={i} deal={d} symbol="¥" fixed={0} isBest={i === 0} isJpy />)}
            </div>
          </CurrencySection>
        </div>
      </div>
    </div>
  )
}

// --- 하위 컴포넌트들 ---

function CurrencySection({ title, flag, theme, children }) {
  const borderColor = theme === 'indigo' ? 'border-indigo-100' : 'border-rose-100';
  return (
    <div className={`bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border ${borderColor}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-black text-slate-700 flex items-center gap-2 uppercase text-sm">{flag} {title}</h2>
      </div>
      {children}
    </div>
  )
}

function InputBox({ label, value, onChange, step, color = "text-slate-700", max }) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-300 uppercase ml-1 mb-1 block tracking-widest">{label}</label>
      <input type="number" step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full bg-slate-50 border-none rounded-xl p-3 text-base font-black ${color} outline-none focus:ring-2 focus:ring-slate-100 transition-all`} />
      {max && value > max && <p className="text-[8px] text-rose-400 mt-1 font-bold">Max {max} Limit</p>}
    </div>
  )
}

function ResultRow({ deal, symbol, fixed, isBest, isJpy }) {
  const displayRate = isJpy ? (deal.effectiveRate * 100).toFixed(4) : deal.effectiveRate.toFixed(4);
  return (
    <div className={`flex justify-between items-center p-3 px-4 rounded-2xl border transition-all ${isBest ? 'bg-emerald-50 border-emerald-100 scale-[1.02]' : 'bg-white border-slate-50'}`}>
      <div className="flex-1"><p className="text-[8px] font-bold text-slate-300 uppercase">Sell</p><p className="font-black text-slate-700 text-sm">{symbol}{deal.amt.toFixed(fixed)}</p></div>
      <div className="flex-1 text-center"><p className="text-[8px] font-bold text-slate-300 uppercase">Won</p><p className="font-black text-indigo-600 text-sm">{deal.won.toLocaleString()}</p></div>
      <div className="flex-1 text-right"><p className="text-[8px] font-bold text-emerald-400 uppercase">Rate</p><p className="font-bold text-slate-500 text-[11px] font-mono">{displayRate}</p></div>
    </div>
  )
}