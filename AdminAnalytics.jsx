import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Receipt, CalendarDays } from 'lucide-react'
import { db } from '../lib/db'
import Chart from './Chart'
import { useApp } from '../AppContext'
import { STATUSES, formatDA, dayKey } from '../i18n'

function lastDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push(d) }
  return out
}

function Stat({ icon: Icon, label, value, accent, delay }) {
  return (
    <div className="rise bg-card rounded-3xl border border-line p-4 md:p-5 card-shadow" style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${accent}`}><Icon className="w-5 h-5" /></div>
      <div className="text-muted text-xs font-bold mt-3">{label}</div>
      <div className="font-display text-xl md:text-2xl mt-0.5 truncate">{value}</div>
    </div>
  )
}

export default function AdminAnalytics({ version }) {
  const { t, lang } = useApp()
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true
    const days = lastDays(7)
    const today = dayKey()
    const start = dayKey(days[0])
    ;(async () => {
      try {
        const [todayRev, todayCnt, weekRev, weekCnt, byDay, byStatus] = await Promise.all([
          db.sumShared('orders', 'total', { day: today }),
          db.countShared('orders', { day: today }),
          db.sumShared('orders', 'total', { day: { gte: start } }),
          db.countShared('orders', { day: { gte: start } }),
          db.groupByShared('orders', 'day', { agg: 'sum', field: 'total', filters: { day: { gte: start } } }),
          db.groupByShared('orders', 'status', { filters: { day: { gte: start } } }),
        ])
        if (!alive) return
        const dm = Object.fromEntries((byDay || []).map((g) => [g.key, Number(g.value) || 0]))
        const sm = Object.fromEntries((byStatus || []).map((g) => [g.key, g.count]))
        setS({
          todayRev: Number(todayRev) || 0, todayCnt: Number(todayCnt) || 0,
          weekRev: Number(weekRev) || 0, weekCnt: Number(weekCnt) || 0,
          labels: days.map((d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`),
          values: days.map((d) => dm[dayKey(d)] || 0),
          status: STATUSES.map((x) => sm[x] || 0),
        })
        setErr('')
      } catch (e) { if (alive) setErr(e?.message || 'Error') }
    })()
    return () => { alive = false }
  }, [version])

  if (err) return <p className="text-rose-400 font-bold">{err}</p>
  if (!s) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-3xl bg-card animate-pulse" />)}</div>

  const avg = s.weekCnt ? s.weekRev / s.weekCnt : 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Stat delay={0} icon={TrendingUp} label={`${t('revenue')} · ${t('today')}`} value={formatDA(s.todayRev, lang)} accent="bg-primary/15 text-primary" />
        <Stat delay={60} icon={ShoppingBag} label={`${t('ordersCount')} · ${t('today')}`} value={s.todayCnt} accent="bg-secondary/20 text-secondary" />
        <Stat delay={120} icon={CalendarDays} label={`${t('revenue')} · ${t('week')}`} value={formatDA(s.weekRev, lang)} accent="bg-fuchsia-500/15 text-fuchsia-400" />
        <Stat delay={180} icon={Receipt} label={`${t('avgTicket')} · ${t('week')}`} value={formatDA(avg, lang)} accent="bg-sky-400/15 text-sky-400" />
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <div className="rise bg-card rounded-3xl border border-line p-4 md:p-5 card-shadow" style={{ animationDelay: '220ms' }}>
          <h3 className="font-display text-lg mb-3">{t('revenueByDay')}</h3>
          <div className="bg-white rounded-2xl p-3">
            <Chart spec={{ kind: 'bar', labels: s.labels, series: [{ name: 'DA', data: s.values, color: '#ec26a6' }] }} />
          </div>
        </div>
        <div className="rise bg-card rounded-3xl border border-line p-4 md:p-5 card-shadow" style={{ animationDelay: '280ms' }}>
          <h3 className="font-display text-lg mb-3">{t('byStatus')}</h3>
          <div className="bg-white rounded-2xl p-3">
            {s.status.some((v) => v > 0) ? (
              <Chart spec={{ kind: 'donut', labels: STATUSES.map((x) => t(x)), series: [{ name: t('ordersCount'), data: s.status }] }} />
            ) : <div className="py-16 text-center text-gray-400 font-bold">—</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
