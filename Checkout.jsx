import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Banknote, Loader2, User, Phone, MapPin, Home, MessageSquare } from 'lucide-react'
import { db } from '../lib/db'
import { useApp } from '../AppContext'
import { formatDA, dayKey } from '../i18n'
import CartPanel from '../components/CartPanel'
import { getStaffGroupId } from '../staffGroup'

const PHONE_RE = /^(?:0|\+213|00213)[5-7]\d{8}$/

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold mb-1.5"><Icon className="w-4 h-4 text-primary" />{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-400 mt-1 font-bold">{error}</span>}
    </label>
  )
}

export default function Checkout() {
  const { t, lang, cart, cartTotal, clearCart, itemName } = useApp()
  const navigate = useNavigate()
  const saved = (() => { try { return JSON.parse(localStorage.getItem('ye_customer') || '{}') } catch { return {} } })()
  const [form, setForm] = useState({ name: saved.name || '', phone: saved.phone || '', city: saved.city || '', address: saved.address || '', notes: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    const phone = form.phone.replace(/[\s.-]/g, '')
    if (!form.name.trim()) errs.name = t('required')
    if (!PHONE_RE.test(phone)) errs.phone = t('phoneInvalid')
    if (!form.city.trim()) errs.city = t('required')
    if (!form.address.trim()) errs.address = t('required')
    setErrors(errs)
    if (Object.keys(errs).length || !cart.length) return
    setBusy(true); setFail('')
    try {
      const number = 'YE-' + Date.now().toString().slice(-5)
      const order = {
        number,
        customerName: form.name.trim(),
        phone,
        city: form.city.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        items: cart.map((x) => ({ id: x.id, nameFr: x.nameFr, nameAr: x.nameAr, price: x.price, qty: x.qty })),
        itemCount: cart.reduce((s, x) => s + x.qty, 0),
        total: cartTotal,
        status: 'pending',
        payment: 'cash',
        lang,
        day: dayKey(),
      }
      const newId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const gid = await getStaffGroupId()
      if (!gid) throw new Error(lang === 'ar' ? 'تعذّر إرسال الطلب، حاول مرة أخرى.' : "Impossible d'envoyer la commande, réessayez.")
      const row = await db.insertShared('orders', order, newId, {
        groupId: gid, visibleTo: 'creator-and-admin', writableBy: 'admins',
      })
      const id = row?.id || newId
      const mine = JSON.parse(localStorage.getItem('ye_my_orders') || '[]')
      if (id) localStorage.setItem('ye_my_orders', JSON.stringify([id, ...mine].slice(0, 50)))
      localStorage.setItem('ye_customer', JSON.stringify({ name: order.customerName, phone, city: order.city, address: order.address }))
      clearCart()
      navigate(`/orders?new=${id || ''}`)
    } catch (err) {
      setFail(err?.message || 'Error')
      setBusy(false)
    }
  }

  if (!cart.length) {
    return (
      <div className="h-full overflow-y-auto atmo">
        <div className="max-w-xl mx-auto px-4 py-16">
          <CartPanel />
          <Link to="/" className="mt-6 mx-auto flex w-max items-center gap-2 h-11 px-5 rounded-full bg-primary text-white font-bold"><Back className="w-4 h-4" />{t('menu')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto atmo">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
        <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-main font-bold text-sm mb-4"><Back className="w-4 h-4" />{t('back')}</Link>
        <h1 className="rise font-display text-3xl md:text-4xl neon-text mb-6">{t('checkoutTitle')}</h1>

        <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
          <form onSubmit={submit} className="rise bg-card rounded-3xl border border-line p-5 md:p-7 space-y-4 card-shadow" style={{ animationDelay: '80ms' }}>
            <h2 className="font-display text-xl">{t('yourInfo')}</h2>
            <Field icon={User} label={t('name')} error={errors.name}>
              <input className="input-field" value={form.name} onChange={set('name')} autoComplete="name" />
            </Field>
            <Field icon={Phone} label={t('phone')} error={errors.phone}>
              <input className="input-field" dir="ltr" inputMode="tel" placeholder="0550 12 34 56" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </Field>
            <Field icon={MapPin} label={t('city')} error={errors.city}>
              <input className="input-field" value={form.city} onChange={set('city')} placeholder={lang === 'ar' ? 'الجزائر، باب الزوار' : 'Alger, Bab Ezzouar'} />
            </Field>
            <Field icon={Home} label={t('address')} error={errors.address}>
              <textarea rows={2} className="input-field resize-none" value={form.address} onChange={set('address')} autoComplete="street-address" />
            </Field>
            <Field icon={MessageSquare} label={t('notes')}>
              <textarea rows={2} className="input-field resize-none" value={form.notes} onChange={set('notes')} placeholder={t('notesPh')} />
            </Field>

            <div className="flex items-center gap-3 rounded-2xl bg-secondary/15 border border-secondary/40 px-4 py-3">
              <Banknote className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm font-bold">{t('payCash')}</span>
            </div>

            {fail && <p className="text-sm text-rose-400 font-bold">{fail}</p>}

            <button disabled={busy} className="w-full py-4 rounded-2xl bg-primary text-white font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-110 transition shadow-[0_0_30px_rgb(var(--color-primary)/0.5)]">
              {busy ? <><Loader2 className="w-5 h-5 animate-spin" />{t('placing')}</> : <>{t('placeOrder')} · {formatDA(cartTotal, lang)}</>}
            </button>
          </form>

          <aside className="rise bg-card rounded-3xl border border-line p-5 card-shadow md:sticky md:top-4" style={{ animationDelay: '160ms' }}>
            <h2 className="font-display text-xl mb-3">{t('cart')}</h2>
            <ul className="space-y-2">
              {cart.map((x) => (
                <li key={x.id} className="flex justify-between gap-3 text-sm">
                  <span className="truncate"><b className="text-primary">{x.qty}×</b> {itemName(x)}</span>
                  <span className="font-bold whitespace-nowrap">{formatDA(x.price * x.qty, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line mt-4 pt-4 flex justify-between items-end">
              <span className="text-muted font-bold">{t('total')}</span>
              <span className="font-display text-2xl neon-yellow">{formatDA(cartTotal, lang)}</span>
            </div>
            <p className="text-xs text-muted mt-2">{t('deliveryNote')}</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
