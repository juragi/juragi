'use client'

import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'juragi_fx_values'
const defaultValues = {
  usdBuy: 1350,
  usdSell: 1340,
  eur: 1420,
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function getUsd(eur, eurkrw, usdkrw) {
  const mod = eur * eurkrw / usdkrw - Math.floor(eur * eurkrw / usdkrw * 100) / 100
  const krw = Math.floor(eur * eurkrw)
  const usd = krw / usdkrw
  const usdFloor = Math.floor(usd * 100) / 100

  if (mod > 0.00025) {
    return Number((usdFloor + 0.01).toFixed(2))
  }

  return Number(usd.toFixed(2))
}

function getEur(usd, usdkrw, eurkrw) {
  const krw = Math.ceil(usd * usdkrw)
  let eur = krw / eurkrw
  const eurFloor = Math.floor(eur * 100) / 100
  const mod = eur - eurFloor

  if (mod > 0.00075) {
    return Number((eurFloor + 0.01).toFixed(2))
  }

  return Number(eurFloor.toFixed(2))
}

function getSellCandidates(usdkrw, eurkrw, minimumUsd = 10) {
  const rate = eurkrw / usdkrw
  let eur = Number((9.9 / rate).toFixed(2))
  const items = []

  for (let i = 0; i < 1000; i += 1) {
    const usd = getUsd(eur, eurkrw, usdkrw)
    items.push({
      eur,
      usd,
      rate: Number((usd / eur).toFixed(6)),
    })
    eur = Number((eur + 0.01).toFixed(2))
  }

  return items
    .filter((item) => item.usd >= minimumUsd)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3)
}

function getBuyCandidates(usdkrw, eurkrw, minimumUsd = 10) {
  let usd = minimumUsd
  const items = []

  for (let i = 0; i < 1000; i += 1) {
    const eur = getEur(usd, usdkrw, eurkrw)
    items.push({
      usd,
      eur,
      rate: Number((usd / eur).toFixed(6)),
    })
    usd = Number((usd + 0.01).toFixed(2))
  }

  return items
    .filter((item) => item.eur > 0)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3)
}

function getUsdOffset(usd, multiple) {
  let v = 0
  if (usd + multiple * 2.62 / 2 > 1336.5) v = 2.62
  else if (usd + multiple * 2.60 / 2 > 1325.4) v = 2.60
  else if (usd + multiple * 2.58 / 2 > 1316.4) v = 2.58
  else if (usd + multiple * 2.56 / 2 > 1306) v = 2.56
  else if (usd + multiple * 2.54 / 2 > 1295.7) v = 2.54
  else if (usd + multiple * 2.52 / 2 > 1285.51) v = 2.52
  else if (usd + multiple * 2.5 / 2 > 1275) v = 2.5
  else if (usd + multiple * 2.48 / 2 >= 1266) v = 2.48
  else if (usd + multiple * 2.46 / 2 > 1250) v = 2.46
  else v = 2
  return v
}

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatRate(value) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 6,
  }).format(value)
}

export default function FxPage() {
  const [values, setValues] = useState(defaultValues)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setValues((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse saved FX inputs.', error)
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  const sellCandidates = useMemo(() => getSellCandidates(values.usdSell, values.eur), [values.usdSell, values.eur])
  const buyCandidates = useMemo(() => getBuyCandidates(values.usdBuy, values.eur), [values.usdBuy, values.eur])

  const handleChange = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: toNumber(event.target.value) }))
  }

  const handleCalcSell = () => {
    setValues((prev) => ({
      ...prev,
      usdSell: Number((prev.usdBuy + getUsdOffset(prev.usdBuy, 1)).toFixed(2)),
    }))
  }

  const handleCalcBuy = () => {
    setValues((prev) => ({
      ...prev,
      usdBuy: Number((prev.usdSell - getUsdOffset(prev.usdSell, -1)).toFixed(2)),
    }))
  }

  return (
    <div className="bg-slate-50 px-3 py-4 text-slate-800 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">FX Optimizer</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900">USD ⇄ EUR 거래 후보</h1>
          <p className="mt-1 text-xs text-slate-500">환율 입력만으로 최적의 거래 금액 후보를 바로 확인합니다.</p>
        </header>

        <section className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="mb-1 block">USD/KRW (BUY)</span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={values.usdBuy}
                    onChange={handleChange('usdBuy')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-12 text-sm font-semibold text-slate-700 outline-none ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleCalcSell}
                    aria-label="Calculate sell from buy"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7l10 10" />
                      <path d="M17 7v10H7" />
                    </svg>
                  </button>
                </div>
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="mb-1 block">USD/KRW (SELL)</span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={values.usdSell}
                    onChange={handleChange('usdSell')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-12 text-sm font-semibold text-slate-700 outline-none ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleCalcBuy}
                    aria-label="Calculate buy from sell"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm transition hover:bg-amber-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 17l-10-10" />
                      <path d="M7 17V7h10" />
                    </svg>
                  </button>
                </div>
              </label>
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="mb-1 block">EUR/KRW</span>
                <input
                  type="number"
                  step="0.01"
                  value={values.eur}
                  onChange={handleChange('eur')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-semibold text-slate-700 outline-none ring-0"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-1 grid-cols-2 min-w-0">
          <article className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-black text-slate-800">SELL 후보</h2>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">TOP 3</span>
            </div>
            <div className="grid gap-1">
              {sellCandidates.map((item, index) => (
                <div key={`${item.eur}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-2xl bg-slate-50 px-2 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{formatNumber(item.eur)} EUR</p>
                    <p className="text-[10px] text-slate-500">→ {formatNumber(item.usd)} USD</p>
                    <p className="mt-1 text-[10px] font-black text-emerald-500">{formatRate(item.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-black text-slate-800">BUY 후보</h2>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">TOP 3</span>
            </div>
            <div className="grid gap-1">
              {buyCandidates.map((item, index) => (
                <div key={`${item.usd}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-2xl bg-slate-50 px-2 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{formatNumber(item.usd)} USD</p>
                    <p className="text-[10px] text-slate-500">→ {formatNumber(item.eur)} EUR</p>
                    <p className="mt-1 text-[10px] font-black text-amber-500">{formatRate(item.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
