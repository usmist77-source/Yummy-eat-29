import { useEffect, useMemo, useRef, useState } from 'react'
import { Phone, MapPin, StickyNote, Bell, BellOff, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { db } from '../lib/db'
import { useApp } from '../AppContext'
import { STATUSES, formatDA } from '../i18n'
import StatusBadge, { STATUS_STYLE } from './StatusBadge'

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.frequency.value = f; o.type = 'sine'
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18)
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.3)
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.32)
    })
    setTimeout(() => ctx.close(), 1000)
  } catch {}
}

export default function AdminOrders({ orders, loading }) {
  const { t, lang, itemName } = useApp()
  const [filter, setFilter] = useState('active')
  const [sound, setSound] = useState(() => localStorage.getItem('ye_sound') !== 'off')
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')
  const seen = useRef(null)

  useEffect(() => {
    if (loading) return
    const ids = new Set(orders.map((o) => o.id))
    if (seen.current && sound && orders.some((o) => !seen.current.has(o.id) && o.status === 'pending')) chime()
    seen.current = ids
  }, [orders, loading, sound])

  const counts = useMemo(() => {
    const c = { all: orders.length, active: 0 }
    STATUSES.forEach((s) => { c[s] = 0 })
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; if (o.status !== 'delivered') c.active++ })
    return c
  }, [orders])

  const shown = orders.filter((o) => filter === 'all' || (filter === 'active' ? o.status !== 'delivered' : o.status === filter))

  const setStatus = async (o, status) => {
    if (o.status === status) return
    setBusyId(o.id); setErr('')
    try { await db.updateShared('orders', o.id, { status }) } catch (e) { setErr(e?.message || 'Error') }
    setBusyId(null)
  }

  const toggleSound = () => { const n = !sound; setSound(n); localStorage.setItem('ye_sound', n ? 'on' : 'off'); if (n) chime() }

  const tabs = [
    { id: 'active', label: lang === 'ar' ? 'النشطة' : 'Actives' },
    ...STATUSES.map((s) => ({ id: s, label: t(s) })),
    { id: 'all', label: t('allStatus') },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-2 overflow-x-auto flex-1 -mx-1 px-1">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setFilter(tb.id)}
              className={`shrink-0 h-10 px-4 rounded-full text-sm font-bold border transition-colors ${filter === tb.id ? 'bg-primary text-white border-transparent' : 'bg-card border-line text-muted hover:text-main'}`}>
              {tb.label} <span className="opacity-70 text-xs ms-1">{counts[tb.id] || 0}</span>
            </button>
          ))}
        </div>
        <button onClick={toggleSound} title={sound ? t('soundOn') : t('soundOff')}
          className={`shrink-0 w-10 h-10 rounded-full grid place-items-center border ${sound ? 'bg-secondary/20 border-secondary/50 text-secondary' : 'bg-card border-line text-muted'}`}>
          {sound ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </div>
      {err && <p className="text-sm text-rose-400 font-bold mb-3">{err}</p>}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-3xl bg-card animate-pulse" />)}</div>
      ) : shown.length === 0 ? (
        <div className="text-center text-muted py-16 font-bold">{t('noneHere')}</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((o) => (
            <article key={o.id} className={`rise bg-card rounded-3xl border p-4 card-shadow flex flex-col ${o.status === 'pending' ? 'border-amber-400/60' : 'border-line'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg" dir="ltr">{o.number || o.id.slice(-5)}</div>
                  <div className="text-xs text-muted">{o.createdAt ? format(new Date(o.createdAt), 'dd/MM · HH:mm') : ''}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="font-extrabold text-base">{o.customerName}</div>
                <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-primary font-bold hover:underline w-max" dir="ltr"><Phone className="w-4 h-4" />{o.phone}</a>
                <div className="flex items-start gap-2 text-muted"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{o.city} — {o.address}</span></div>
                {o.notes && <div className="flex items-start gap-2 rounded-xl bg-secondary/10 px-2.5 py-1.5"><StickyNote className="w-4 h-4 mt-0.5 text-secondary shrink-0" /><span>{o.notes}</span></div>}
              </div>

              <ul className="mt-3 text-sm space-y-1 bg-card-2 rounded-2xl p-3 flex-1">
                {(o.items || []).map((x) => (
                  <li key={x.id} className="flex justify-between gap-2">
                    <span className="truncate"><b className="text-primary">{x.qty}×</b> {itemName(x)}</span>
                    <span className="text-muted whitespace-nowrap">{formatDA(x.qty * x.price, lang)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-3">
                <span className="text-muted text-sm font-bold">{t('total')}</span>
                <span className="font-display text-xl neon-yellow">{formatDA(o.total, lang)}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {STATUSES.map((s) => {
                  const active = o.status === s
                  const Icon = STATUS_STYLE[s].icon
                  return (
                    <button key={s} disabled={busyId === o.id} onClick={() => setStatus(o, s)}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold border transition ${active ? `${STATUS_STYLE[s].dot} text-white border-transparent` : 'bg-card-2 border-line text-muted hover:text-main hover:border-primary/50'}`}>
                      {busyId === o.id && !active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                      <span className="leading-none truncate max-w-full px-0.5">{t(s)}</span>
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
