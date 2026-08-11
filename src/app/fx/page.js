'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
  let v = 6.26
  if (usd + multiple * 2.62 / 2 > 1350) v = 5.9
  return v;
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
  const [saveState, setSaveState] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadLatestValues = async () => {
      let initialValues = defaultValues

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          initialValues = { ...initialValues, ...parsed }
        }
      } catch (error) {
        console.error('Failed to parse saved FX inputs.', error)
      }

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('fx_snapshots')
            .select('values')
            .order('saved_at', { ascending: false })
            .limit(1)

          if (!error && data?.[0]?.values) {
            initialValues = { ...initialValues, ...data[0].values }
          }
        } catch (error) {
          console.error('Failed to load latest FX snapshot from Supabase.', error)
        }
      }

      setValues(initialValues)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialValues))
    }

    void loadLatestValues()
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  const sellCandidates = useMemo(() => getSellCandidates(values.usdSell, values.eur), [values.usdSell, values.eur])
  const buyCandidates = useMemo(() => getBuyCandidates(values.usdBuy, values.eur), [values.usdBuy, values.eur])
  
  const usdMidRate = useMemo(() => (values.usdBuy + values.usdSell) / 2, [values.usdBuy, values.usdSell])
  const eurUsdRate = useMemo(() => values.eur / usdMidRate, [usdMidRate, values.eur])

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

  const handleSaveToDb = async () => {
    if (!supabase) {
      setSaveState('error')
      setSaveMessage('Supabase 클라이언트가 초기화되지 않았습니다.')
      return
    }

    const storageSnapshot = window.localStorage.getItem(STORAGE_KEY)
    const payload = {
      saved_at: new Date().toISOString(),
      storage_key: STORAGE_KEY,
      values: storageSnapshot ? JSON.parse(storageSnapshot) : values,
    }

    setIsSaving(true)
    setSaveState('saving')
    setSaveMessage('저장 중입니다...')

    try {
      const { error } = await supabase
        .from('fx_snapshots')
        .insert(payload)

      if (error) {
        throw error
      }

      setSaveState('success')
      setSaveMessage('Supabase에 저장되었습니다.')
    } catch (error) {
      setSaveState('error')
      setSaveMessage(`저장 실패: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-slate-50 px-3 py-2 text-slate-800 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">FX Optimizer</p>
              <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-900">USD ⇄ EUR 거래 후보</h1>
              <p className="mt-0.5 text-[11px] text-slate-500">환율 입력만으로 최적의 거래 금액 후보를 바로 확인합니다.</p>
            </div>
            <button
              type="button"
              onClick={handleSaveToDb}
              disabled={isSaving}
              className="rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? '저장 중...' : '현재 값 DB에 저장'}
            </button>
          </div>
          {saveMessage ? (
            <p className={`mt-2 text-[11px] ${saveState === 'error' ? 'text-rose-600' : saveState === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {saveMessage}
            </p>
          ) : null}
        </header>

        <section className="grid gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
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
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end items-center gap-2">
            <p className="text-[9px] text-slate-500">EUR / USD</p>
            <p className="text-sm font-black text-indigo-600">{formatRate(eurUsdRate)}</p>
          </div>
        </section>

        <section className="grid gap-1 grid-cols-2 min-w-0">
          <article className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-black text-slate-800">BUY 후보</h2>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">TOP 3</span>
            </div>
            <div className="grid gap-0.5">
              {buyCandidates.map((item, index) => (
                <div key={`${item.usd}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-1.5 rounded-xl bg-slate-50 px-1.5 py-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900">{formatNumber(item.usd)} USD <span className="text-[9px] text-slate-500">→ {formatNumber(item.eur)} EUR</span></p>
                    <p className="mt-0.5 text-[10px] font-black text-rose-500">{formatRate(item.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-black text-slate-800">SELL 후보</h2>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">TOP 3</span>
            </div>
            <div className="grid gap-0.5">
              {sellCandidates.map((item, index) => (
                <div key={`${item.eur}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-1.5 rounded-xl bg-slate-50 px-1.5 py-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900">{formatNumber(item.eur)} EUR <span className="text-[9px] text-slate-500">→ {formatNumber(item.usd)} USD</span></p>
                    <p className="mt-0.5 text-[10px] font-black text-emerald-500">{formatRate(item.rate)}</p>
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
