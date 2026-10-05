import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { DICT } from './i18n'
import { auth } from './lib/auth'
import { team } from './lib/team'

const Ctx = createContext(null)

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => load('ye_lang', 'fr'))
  const [theme, setTheme] = useState(() => load('ye_theme', 'dark'))
  const [cart, setCart] = useState(() => load('ye_cart', []))
  const [user, setUser] = useState(() => auth.getCurrentUser())
  const [isOwner, setIsOwner] = useState(() => auth.isAppOwner())
  // null = checking, true/false = server answer (owner or a manager login)
  const [isStaff, setIsStaff] = useState(() => (auth.getCurrentUser() ? null : false))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ye_theme', JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
    localStorage.setItem('ye_lang', JSON.stringify(lang))
  }, [lang])

  useEffect(() => { localStorage.setItem('ye_cart', JSON.stringify(cart)) }, [cart])

  useEffect(() => auth.onAuthChange((u) => {
    setUser(u)
    setIsOwner(auth.isAppOwner())
    if (!u) { setIsStaff(false); return }
    setIsStaff(null)
    team.canManage().then((ok) => setIsStaff(ok || auth.isAppOwner())).catch(() => setIsStaff(auth.isAppOwner()))
  }), [])

  const t = useCallback((k) => DICT[lang][k] ?? k, [lang])

  const addToCart = useCallback((item) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === item.id)
      if (ex) return c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
      return [...c, { id: item.id, nameFr: item.nameFr, nameAr: item.nameAr, price: Number(item.price), qty: 1 }]
    })
  }, [])
  const setQty = useCallback((id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x))))
  }, [])
  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, x) => s + x.qty, 0)
  const cartTotal = cart.reduce((s, x) => s + x.qty * x.price, 0)

  const value = useMemo(() => ({
    lang, setLang, theme, setTheme, t, cart, addToCart, setQty, clearCart, cartCount, cartTotal, user, isOwner, isStaff,
    itemName: (it) => (lang === 'ar' ? it.nameAr || it.nameFr : it.nameFr || it.nameAr),
  }), [lang, theme, t, cart, addToCart, setQty, clearCart, cartCount, cartTotal, user, isOwner, isStaff])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
