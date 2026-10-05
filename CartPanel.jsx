import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../AppContext'
import { formatDA } from '../i18n'

export default function CartPanel({ onCheckout, compact = false }) {
  const { t, lang, cart, setQty, cartTotal, cartCount, itemName, clearCart } = useApp()
  const navigate = useNavigate()

  if (!cart.length) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-4">
        <div className="w-20 h-20 rounded-full bg-card-2 grid place-items-center mb-4 neon-box">
          <ShoppingBag className="w-9 h-9 text-primary" />
        </div>
        <div className="font-display text-lg">{t('emptyCart')}</div>
        <p className="text-muted text-sm mt-1">{t('emptyCartSub')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-sm">{cartCount} {t('items')}</span>
        <button onClick={clearCart} className="text-muted hover:text-primary p-2 -m-2" aria-label="clear">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <ul className={`space-y-2.5 ${compact ? '' : 'overflow-y-auto'} min-h-0`}>
        {cart.map((x) => (
          <li key={x.id} className="flex items-center gap-3 bg-card-2 rounded-2xl p-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{itemName(x)}</div>
              <div className="text-sm neon-yellow font-bold">{formatDA(x.price * x.qty, lang)}</div>
            </div>
            <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-line">
              <button onClick={() => setQty(x.id, x.qty - 1)} className="w-8 h-8 rounded-full grid place-items-center hover:bg-card-2"><Minus className="w-4 h-4" /></button>
              <span className="w-6 text-center font-extrabold">{x.qty}</span>
              <button onClick={() => setQty(x.id, x.qty + 1)} className="w-8 h-8 rounded-full grid place-items-center bg-primary text-white"><Plus className="w-4 h-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex items-end justify-between">
          <span className="text-muted font-bold">{t('total')}</span>
          <span className="font-display text-2xl neon-yellow">{formatDA(cartTotal, lang)}</span>
        </div>
        <p className="text-xs text-muted mt-1">{t('deliveryNote')}</p>
        <button
          onClick={() => { onCheckout?.(); navigate('/checkout') }}
          className="mt-4 w-full h-13 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-base hover:brightness-110 active:scale-[.98] transition shadow-[0_0_28px_rgb(var(--color-primary)/0.45)]"
        >
          {t('checkout')}
        </button>
      </div>
    </div>
  )
}
