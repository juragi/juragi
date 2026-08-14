'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [isHydrated, setIsHydrated] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)
  const valuesRef = useRef(defaultValues)
  const saveToastTimerRef = useRef(null)
  const saveDebounceTimerRef = useRef(null)
  const isSavingRef = useRef(false)
  const hasHydratedOnceRef = useRef(false)

  const handleSaveToDb = useCallback(async () => {
    if (!supabase) {
      setSaveState('error')
      setSaveMessage('Supabase 클라이언트가 초기화되지 않았습니다.')
      return
    }

    if (isSavingRef.current) {
      return
    }

    isSavingRef.current = true

    const payload = {
      saved_at: new Date().toISOString(),
      storage_key: STORAGE_KEY,
      values: valuesRef.current,
    }

    setIsSaving(true)
    setSaveState('saving')
    setSaveMessage('저장 중입니다...')

    try {
      const { data: existingRows, error: selectError } = await supabase
        .from('fx_snapshots')
        .select('id')
        .eq('storage_key', STORAGE_KEY)
        .order('saved_at', { ascending: false })
        .limit(1)

      if (selectError) {
        throw selectError
      }

      let saveError = null

      if (existingRows?.[0]?.id) {
        const { error } = await supabase
          .from('fx_snapshots')
          .update(payload)
          .eq('id', existingRows[0].id)

        saveError = error
      } else {
        const { error } = await supabase
          .from('fx_snapshots')
          .insert(payload)

        saveError = error
      }

      if (saveError) {
        throw saveError
      }

      setSaveState('success')
      setSaveMessage('자동 저장 완료')
    } catch (error) {
      setSaveState('error')
      setSaveMessage(`저장 실패: ${error.message}`)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [])

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
            .select('id, values')
            .eq('storage_key', STORAGE_KEY)
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
      valuesRef.current = initialValues
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialValues))
      setIsHydrated(true)
      setSaveState('ready')
    }

    void loadLatestValues()
  }, [])

  useEffect(() => {
    valuesRef.current = values
  }, [values])

  useEffect(() => {
    if (!saveMessage) {
      setShowSaveToast(false)
      return
    }

    setShowSaveToast(true)

    if (saveToastTimerRef.current) {
      window.clearTimeout(saveToastTimerRef.current)
    }

    saveToastTimerRef.current = window.setTimeout(() => {
      setShowSaveToast(false)
    }, 2200)

    return () => {
      if (saveToastTimerRef.current) {
        window.clearTimeout(saveToastTimerRef.current)
      }
    }
  }, [saveMessage])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))

    if (!hasHydratedOnceRef.current) {
      hasHydratedOnceRef.current = true
      return
    }

    if (saveDebounceTimerRef.current) {
      window.clearTimeout(saveDebounceTimerRef.current)
    }

    saveDebounceTimerRef.current = window.setTimeout(() => {
      void handleSaveToDb()
    }, 1400)

    return () => {
      if (saveDebounceTimerRef.current) {
        window.clearTimeout(saveDebounceTimerRef.current)
      }
    }
  }, [values, isHydrated, handleSaveToDb])

  const sellCandidates = useMemo(() => getSellCandidates(values.usdSell, values.eur), [values.usdSell, values.eur])
  const buyCandidates = useMemo(() => getBuyCandidates(values.usdBuy, values.eur), [values.usdBuy, values.eur])
  
  const usdMidRate = useMemo(() => (values.usdBuy + values.usdSell) / 2, [values.usdBuy, values.usdSell])
  const eurUsdRate = useMemo(() => values.eur / usdMidRate, [usdMidRate, values.eur])

  const handleChange = (key) => (event) => {
    const value = event.target.value
    
    // 소수점 2자리까지만 허용
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setValues((prev) => ({ ...prev, [key]: toNumber(value) }))
    }
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
    <div className="bg-slate-50 px-3 py-2 text-slate-800 sm:px-4 lg:px-6">
      {showSaveToast && saveMessage ? (
        <div className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-lg backdrop-blur ${saveState === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : saveState === 'saving' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${saveState === 'error' ? 'bg-rose-500' : saveState === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          {saveMessage}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6 lg:max-w-5xl xl:max-w-6xl">
        <header className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-500">FX Optimizer</p>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">USD ⇄ EUR 거래 후보</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">입력 값이 자동 저장되어 어디서든 최신 상태로 불러옵니다.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2" />
          </div>
        </header>

        <section className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4">
              <label className="flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="w-36 shrink-0">USD/KRW (BUY)</span>
                <div className="relative w-full">
                  <input
                    type="number"
                    step="0.01"
                    value={values.usdBuy}
                    onChange={handleChange('usdBuy')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-12 text-sm font-semibold text-slate-700 outline-none ring-0 transition focus:border-indigo-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCalcSell}
                    aria-label="Calculate sell from buy"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7l10 10" />
                      <path d="M17 7v10H7" />
                    </svg>
                  </button>
                </div>
              </label>
              <label className="flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="w-36 shrink-0">USD/KRW (SELL)</span>
                <div className="relative w-full">
                  <input
                    type="number"
                    step="0.01"
                    value={values.usdSell}
                    onChange={handleChange('usdSell')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-12 text-sm font-semibold text-slate-700 outline-none ring-0 transition focus:border-indigo-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCalcBuy}
                    aria-label="Calculate buy from sell"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm transition hover:bg-amber-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 17l-10-10" />
                      <path d="M7 17V7h10" />
                    </svg>
                  </button>
                </div>
              </label>
              <label className="flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="w-36 shrink-0">EUR/KRW</span>
                <input
                  type="number"
                  step="0.01"
                  value={values.eur}
                  onChange={handleChange('eur')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none ring-0 transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end items-center gap-2">
            <p className="text-[9px] text-slate-500">EUR / USD</p>
            <p className="text-sm font-black text-indigo-600">{formatRate(eurUsdRate)}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 min-w-0">
          <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-slate-800">BUY </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">(USD → EUR)</span>
            </div>
            <div className="grid gap-1">
              {buyCandidates.map((item, index) => (
                <div key={`${item.usd}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-1.5 rounded-xl bg-slate-50 px-2 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{formatNumber(item.usd)} <span className="text-[10px] text-slate-500">→ {formatNumber(item.eur)}</span></p>
                    <p className="mt-0.5 text-sm font-black text-rose-500">{formatRate(item.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-slate-800">SELL</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">(EUR → USD)</span>
            </div>
            <div className="grid gap-1">
              {sellCandidates.map((item, index) => (
                <div key={`${item.eur}-${index}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-1.5 rounded-xl bg-slate-50 px-2 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-indigo-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{formatNumber(item.eur)} <span className="text-[10px] text-slate-500">→ {formatNumber(item.usd)}</span></p>
                    <p className="mt-0.5 text-sm font-black text-emerald-500">{formatRate(item.rate)}</p>
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
