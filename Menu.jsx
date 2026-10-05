import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowDown, MapPin, Clock, Bike, ShoppingBag, Lock } from 'lucide-react'
import { useLiveShared } from '../lib/useLive'
import { useApp } from '../AppContext'
import { CATEGORIES, formatDA } from '../i18n'
import CategoryIcon from '../components/CategoryIcon'
import MenuItemCard from '../components/MenuItemCard'
import CartPanel from '../components/CartPanel'

const HERO = 'https://api.whacka.app/storage/v1/object/public/app-images/projects/8f297959-c324-4ab8-a7fc-cbc91d8b8266/gen-15b171a2-1791149983099.png'
const STORE = 'https://api.whacka.app/storage/v1/object/public/app-images/projects/8f297959-c324-4ab8-a7fc-cbc91d8b8266/gen-930e6383-1791149983118.png'

function SafeBg({ src, className }) {
  const [ok, setOk] = useState(true)
  return ok ? (
    <img src={src} alt="" onError={() => setOk(false)} className={className} />
  ) : (
    <div className={`${className} bg-gradient-to-br from-purple-900 via-fuchsia-800 to-purple-950`} />
  )
}

export default function Menu({ onOpenCart }) {
  const { t, lang, cartCount, cartTotal } = useApp()
  const { data: items, loading } = useLiveShared('menu', { limit: 500 })
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const scrollRef = useRef(null)
  const menuRef = useRef(null)

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = items.filter((it) =>
      (cat === 'all' || it.category === cat) &&
      (!needle || `${it.nameFr} ${it.nameAr}`.toLowerCase().includes(needle))
    )
    return CATEGORIES.map((c) => ({
      ...c,
      items: filtered.filter((it) => it.category === c.id).sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999) || a.price - b.price),
    })).filter((g) => g.items.length)
  }, [items, cat, q])

  const counts = useMemo(() => {
    const m = {}
    items.forEach((it) => { m[it.category] = (m[it.category] || 0) + 1 })
    return m
  }, [items])

  const goMenu = () => menuRef.current?.scrollIntoView({ behavior: 'smooth' })
  const pick = (id) => { setCat(id); goMenu() }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto atmo">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <SafeBg src={HERO} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg))] via-[rgb(var(--color-bg)/0.55)] to-[rgb(20_4_36/0.35)]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-14 md:pt-28 md:pb-24">
          <span className="rise inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur text-white text-xs font-bold border border-white/15">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> {t('heroTag')}
          </span>
          <h1 className="rise font-brand text-white text-5xl md:text-7xl lg:text-8xl mt-5 leading-[0.95]" style={{ animationDelay: '80ms' }} dir="ltr">
            <span className="block flicker" style={{ textShadow: '0 0 10px #ff3ec8, 0 0 40px #ec26a6, 0 0 80px #ec26a6' }}>YUMMY</span>
            <span className="block text-[#ffcc33]" style={{ textShadow: '0 0 12px rgba(255,204,51,.7)' }}>EAT</span>
          </h1>
          <p className="rise font-display text-2xl md:text-3xl text-white mt-5" style={{ animationDelay: '160ms' }}>{t('heroTitle')}</p>
          <p className="rise text-white/80 max-w-lg mt-2 text-base md:text-lg" style={{ animationDelay: '220ms' }}>{t('heroSub')}</p>
          <div className="rise flex flex-wrap gap-3 mt-7" style={{ animationDelay: '300ms' }}>
            <button onClick={goMenu} className="h-12 px-6 rounded-2xl bg-primary text-white font-extrabold flex items-center gap-2 hover:brightness-110 transition shadow-[0_0_30px_rgb(var(--color-primary)/0.6)]">
              {t('orderNow')} <ArrowDown className="w-4 h-4" />
            </button>
            <div className="h-12 px-4 rounded-2xl bg-black/35 backdrop-blur border border-white/15 text-white text-sm font-bold flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Bike className="w-4 h-4 text-[#ffcc33]" />30–45 min</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#ffcc33]" />11:00–00:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-4 relative">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              className={`rise flex flex-col items-center gap-2 py-3.5 rounded-2xl border transition-all ${cat === c.id ? 'bg-primary text-white border-transparent shadow-[0_0_22px_rgb(var(--color-primary)/0.5)]' : 'bg-card border-line hover:border-primary/60'}`}
              style={{ animationDelay: `${300 + i * 40}ms` }}
            >
              <CategoryIcon id={c.id} className={`w-6 h-6 ${cat === c.id ? 'text-white' : 'text-primary'}`} />
              <span className="text-xs font-extrabold text-center leading-tight px-1">{c[lang]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* MENU + CART */}
      <div ref={menuRef} className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-32 lg:pb-16 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="min-w-0">
          <div className="sticky top-0 z-10 -mx-4 px-4 md:-mx-8 md:px-8 py-3 backdrop-blur-xl" style={{ backgroundColor: 'rgb(var(--color-bg) / 0.85)' }}>
            <div className="relative mb-3">
              <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} className="input-field ps-11" />
            </div>
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
              {[{ id: 'all', fr: 'Tout', ar: 'الكل' }, ...CATEGORIES].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`shrink-0 h-10 px-4 rounded-full text-sm font-bold border transition-colors whitespace-nowrap ${cat === c.id ? 'bg-primary text-white border-transparent' : 'bg-card border-line text-muted hover:text-main'}`}
                >
                  {c.id === 'all' ? t('all') : c[lang]}
                  {c.id !== 'all' && counts[c.id] ? <span className="ms-1.5 opacity-60 text-xs">{counts[c.id]}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 rounded-3xl bg-card animate-pulse" />)}
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center text-muted py-16">—</div>
          ) : (
            <div key={cat + q} className="space-y-10 mt-4">
              {grouped.map((g) => (
                <section key={g.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 grid place-items-center"><CategoryIcon id={g.id} className="w-5 h-5 text-primary" /></div>
                    <h2 className="font-display text-2xl md:text-3xl">{g[lang]}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent rtl:bg-gradient-to-l" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {g.items.map((it, i) => <MenuItemCard key={it.id} item={it} index={i} />)}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* VISIT */}
          <section className="mt-14 relative rounded-[2rem] overflow-hidden border border-line">
            <SafeBg src={STORE} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(20_4_36/0.92)] via-[rgb(20_4_36/0.6)] to-transparent rtl:bg-gradient-to-l" />
            <div className="relative p-7 md:p-10 max-w-md text-white">
              <MapPin className="w-7 h-7 text-[#ffcc33]" />
              <h3 className="font-display text-3xl mt-3" style={{ textShadow: '0 0 18px rgba(236,38,166,.8)' }}>{t('visit')}</h3>
              <p className="text-white/80 mt-2">{t('visitSub')}</p>
            </div>
          </section>

          <footer className="mt-8 flex items-center justify-between gap-3 text-xs text-muted">
            <span dir="ltr">© Yummy Eat</span>
            <Link to="/admin" aria-label={t('staffArea')} title={t('staffArea')} className="w-9 h-9 grid place-items-center rounded-full opacity-30 hover:opacity-100 hover:text-main transition">
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </footer>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-4 bg-card rounded-3xl border border-line p-5 card-shadow max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h3 className="font-display text-2xl neon-text mb-3">{t('cart')}</h3>
            <CartPanel compact />
          </div>
        </aside>
      </div>

      {/* Floating cart bar (phones/tablets) */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] pointer-events-none">
          <button
            onClick={onOpenCart}
            className="rise pointer-events-auto w-full max-w-xl mx-auto h-14 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-between px-5 shadow-[0_8px_40px_rgb(var(--color-primary)/0.6)]"
          >
            <span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /><span className="bg-white/20 rounded-full px-2 py-0.5 text-sm">{cartCount}</span> {t('cart')}</span>
            <span>{formatDA(cartTotal, lang)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
