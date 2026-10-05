import { Pizza, UtensilsCrossed, Beef, Utensils, Flame, Soup, Baby, PlusCircle, CupSoda, Sparkles } from 'lucide-react'

const MAP = {
  pizzas: Pizza, sandwiches: UtensilsCrossed, burgers: Beef, plats: Utensils, tacos: Flame,
  poutine: Soup, kids: Baby, supplements: PlusCircle, boissons: CupSoda,
}

export const CAT_GRADIENT = {
  pizzas: 'from-fuchsia-600 to-orange-400',
  sandwiches: 'from-purple-700 to-pink-500',
  burgers: 'from-rose-600 to-amber-400',
  plats: 'from-violet-700 to-fuchsia-500',
  tacos: 'from-orange-600 to-yellow-400',
  poutine: 'from-amber-600 to-pink-500',
  kids: 'from-sky-500 to-fuchsia-500',
  supplements: 'from-emerald-500 to-purple-600',
  boissons: 'from-cyan-500 to-violet-600',
}

export default function CategoryIcon({ id, className = 'w-5 h-5', strokeWidth = 2 }) {
  const Icon = MAP[id] || Sparkles
  return <Icon className={className} strokeWidth={strokeWidth} />
}
