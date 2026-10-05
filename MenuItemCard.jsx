import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../AppContext'
import { formatDA } from '../i18n'
import { itemImage } from '../menuImages'
import CategoryIcon, { CAT_GRADIENT } from './CategoryIcon'

export function DishPhoto({ item, className = '', credit = true }) {
  const img = itemImage(item)
  const [state, setState] = useState(img ? 'loading' : 'error')
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${CAT_GRADIENT[item.category] || 'from-purple-700 to-pink-500'} ${className}`}>
      {state !== 'loaded' && (
        <CategoryIcon id={item.category} className={`absolute inset-0 m-auto w-1/2 h-1/2 text-white/30 ${state === 'loading' ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
      )}
      {img && state !== 'error' && (
        <img
          key={img.src}
          src={img.src}
          alt={item.nameFr || ''}
          loading="lazy"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {credit && img?.by && state === 'loaded' && (
        <span className="absolute bottom-1.5 end-2 text-[9px] leading-none text-white/80 bg-black/40 rounded px-1 py-0.5" dir="ltr">
          📷 {img.by} / Unsplash
        </span>
      )}
    </div>
  )
}

export default function MenuItemCard({ item, index = 0 }) {
  const { lang, t, addToCart, cart, itemName } = useApp()
  const inCart = cart.find((x) => x.id === item.id)?.qty || 0
  const [bump, setBump] = useState(0)
  const off = item.available === false
  const name = itemName(item)
  const sub = lang === 'ar' ? item.nameFr : item.nameAr

  return (
    <div
      className={`rise group relative bg-card rounded-3xl border border-line overflow-hidden card-shadow transition-all duration-300 ${off ? 'opacity-55' : 'hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(var(--color-primary)/0.5),0_0_26px_rgb(var(--color-primary)/0.35)]'}`}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="relative">
        <DishPhoto item={item} className="aspect-[4/3]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/45 to-transparent" />
        <span className="absolute top-3 start-3 font-brand text-white/90 text-[10px] tracking-widest drop-shadow" dir="ltr">YUMMY EAT</span>
        {inCart > 0 && (
          <span key={inCart} className="pop absolute top-3 end-3 min-w-[26px] h-[26px] px-1.5 rounded-full bg-secondary text-[#2a0a3d] text-xs font-extrabold grid place-items-center">
            ×{inCart}
          </span>
        )}
      </div>
      <div className="p-3.5 md:p-4">
        <div className="font-display text-base md:text-lg leading-tight truncate">{name}</div>
        <div className="text-xs text-muted truncate h-4">{sub}</div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="font-extrabold text-lg neon-yellow whitespace-nowrap">{formatDA(item.price, lang)}</span>
          {off ? (
            <span className="text-xs font-bold text-muted">{t('unavailable')}</span>
          ) : (
            <button
              key={bump}
              onClick={() => { addToCart(item); setBump((b) => b + 1) }}
              className={`${bump ? 'pop' : ''} w-11 h-11 rounded-2xl bg-primary text-white grid place-items-center hover:brightness-110 active:scale-90 transition shadow-[0_0_16px_rgb(var(--color-primary)/0.5)]`}
              aria-label={t('add')}
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
