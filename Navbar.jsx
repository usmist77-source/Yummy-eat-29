import { NavLink, Link } from 'react-router-dom'
import { Sun, Moon, ShoppingBag, UtensilsCrossed, Receipt, LayoutDashboard } from 'lucide-react'
import { useApp } from '../AppContext'

export default function Navbar({ onOpenCart }) {
  const { t, lang, setLang, theme, setTheme, cartCount, isOwner, isStaff } = useApp()

  const links = [
    { to: '/', label: t('menu'), icon: UtensilsCrossed, end: true },
    { to: '/orders', label: t('myOrders'), icon: Receipt },
    ...(isOwner || isStaff ? [{ to: '/admin', label: t('dashboard'), icon: LayoutDashboard }] : []),
  ]

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 h-10 rounded-full text-sm font-bold transition-colors ${
      isActive ? 'bg-primary text-white shadow-[0_0_18px_rgb(var(--color-primary)/0.45)]' : 'text-muted hover:text-main hover:bg-card-2'
    }`

  return (
    <header className="shrink-0 z-20 bg-app/80 backdrop-blur-xl border-b border-line pt-[env(safe-area-inset-top)]" style={{ backgroundColor: 'rgb(var(--color-bg) / 0.85)' }}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-primary grid place-items-center neon-box">
            <span className="font-brand text-white text-lg leading-none">Y</span>
          </div>
          <div className="leading-none" dir="ltr">
            <div className="font-brand text-lg neon-text flicker">YUMMY</div>
            <div className="font-brand text-[11px] tracking-[0.35em] neon-yellow">EAT</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              <l.icon className="w-4 h-4" />{l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 ms-auto md:ms-0">
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="h-10 px-1 rounded-full bg-card-2 border border-line flex items-center text-xs font-extrabold"
            aria-label="Language"
          >
            <span className={`px-2.5 py-1.5 rounded-full transition-colors ${lang === 'fr' ? 'bg-primary text-white' : 'text-muted'}`}>FR</span>
            <span className={`px-2.5 py-1.5 rounded-full transition-colors ${lang === 'ar' ? 'bg-primary text-white' : 'text-muted'}`}>ع</span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-card-2 border border-line grid place-items-center hover:border-primary transition-colors"
            aria-label="Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
          <button
            onClick={onOpenCart}
            className="relative w-10 h-10 rounded-full bg-primary text-white grid place-items-center hover:brightness-110 transition"
            aria-label={t('cart')}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span key={cartCount} className="pop absolute -top-1 -end-1 min-w-[20px] h-5 px-1 rounded-full bg-secondary text-[#2a0a3d] text-[11px] font-extrabold grid place-items-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
            <l.icon className="w-4 h-4" />{l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
