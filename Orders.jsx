import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PartyPopper, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import { useLiveShared } from '../lib/useLive'
import { useApp } from '../AppContext'
import { STATUSES, formatDA } from '../i18n'
import StatusBadge, { STATUS_STYLE } from '../components/StatusBadge'

export default function Orders() {
  const { t, lang, itemName } = useApp()
  const [params] = useSearchParams()
  const newId = params.get('new')
  const { data, loading } = useLiveShared('orders', { order: '-createdAt', limit: 100 })

  const mine = useMemo(() => {
    let ids = []
    try { ids = JSON.parse(localStorage.getItem('ye_my_orders') || '[]') } catch {}
    const set = new Set(ids)
    return data.filter((o) => set.has(o.id))
  }, [data])

  return (
    <div className="h-full overflow-y-auto atmo">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
        {newId && (
          <div className="rise mb-6 rounded-3xl p-5 md:p-6 bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white flex items-center gap-4 shadow-[0_0_40px_rgb(var(--color-primary)/0.45)]">
            <PartyPopper className="w-10 h-10 text-[#ffcc33] shrink-0" />
            <div>
              <div className="font-display text-2xl">{t('orderPlaced')}</div>
              <div className="text-white/85 text-sm">{t('orderPlacedSub')}</div>
            </div>
          </div>
        )}
        <h1 className="rise font-display text-3xl md:text-4xl neon-text mb-6">{t('myOrders')}</h1>

        {loading ? (
          <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="h-40 rounded-3xl bg-card animate-pulse" />)}</div>
        ) : mine.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-card grid place-items-center neon-box mb-4"><Receipt className="w-9 h-9 text-primary" /></div>
            <div className="font-display text-xl">{t('noOrders')}</div>
            <p className="text-muted text-sm mt-1 mb-6">{t('noOrdersSub')}</p>
            <Link to="/" className="inline-flex h-11 px-6 items-center rounded-full bg-primary text-white font-bold">{t('orderNow')}</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {mine.map((o, i) => {
              const step = Math.max(0, STATUSES.indexOf(o.status))
              return (
                <article key={o.id} className={`rise bg-card rounded-3xl border p-5 card-shadow ${o.id === newId ? 'border-primary neon-box' : 'border-line'}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl" dir="ltr">{o.number}</div>
                      <div className="text-xs text-muted">{o.createdAt ? format(new Date(o.createdAt), 'dd/MM/yyyy · HH:mm') : ''}</div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  <div className="mt-5 flex items-center">
                    {STATUSES.map((s, idx) => (
                      <div key={s} className="flex-1 flex items-center last:flex-none">
                        <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-extrabold transition-colors ${idx <= step ? `${STATUS_STYLE[s].dot} text-white` : 'bg-card-2 text-muted'}`}>
                          {idx + 1}
                        </div>
                        {idx < STATUSES.length - 1 && <div className={`flex-1 h-1 mx-1 rounded-full ${idx < step ? 'bg-primary' : 'bg-card-2'}`} />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 grid grid-cols-4 text-[11px] text-muted font-bold">
                    {STATUSES.map((s, idx) => <span key={s} className={`${idx === step ? 'text-main' : ''} ${idx === 3 ? 'text-end' : idx === 0 ? '' : 'text-center'}`}>{t(s)}</span>)}
                  </div>

                  <ul className="mt-4 text-sm space-y-1">
                    {(o.items || []).map((x) => (
                      <li key={x.id} className="flex justify-between gap-3">
                        <span className="truncate"><b className="text-primary">{x.qty}×</b> {itemName(x)}</span>
                        <span className="text-muted whitespace-nowrap">{formatDA(x.price * x.qty, lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-line flex justify-between items-center">
                    <span className="text-muted text-sm truncate">{o.city}</span>
                    <span className="font-display text-xl neon-yellow">{formatDA(o.total, lang)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
