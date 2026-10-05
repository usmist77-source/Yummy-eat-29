import { X } from 'lucide-react'
import { useApp } from '../AppContext'
import CartPanel from './CartPanel'

export default function CartDrawer({ open, onClose }) {
  const { t } = useApp()
  return (
    <div className={`fixed inset-0 z-30 ${open ? '' : 'pointer-events-none'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        className={`absolute bg-card border-line shadow-2xl flex flex-col transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[85%] rounded-t-[2rem] border-t
          md:inset-y-0 md:bottom-auto md:end-0 md:start-auto md:w-[400px] md:max-h-none md:h-full md:rounded-none md:border-t-0 md:border-s
          ${open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:ltr:translate-x-full md:rtl:-translate-x-full'}`}
        style={!open ? { visibility: 'hidden', transitionProperty: 'transform, visibility' } : undefined}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 md:pt-[calc(env(safe-area-inset-top)+1.25rem)]">
          <h2 className="font-display text-2xl neon-text">{t('cart')}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-card-2 grid place-items-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">
          <CartPanel onCheckout={onClose} compact />
        </div>
      </aside>
    </div>
  )
}
