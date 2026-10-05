import { Clock, ChefHat, PackageCheck, CheckCircle2 } from 'lucide-react'
import { useApp } from '../AppContext'

export const STATUS_STYLE = {
  pending: { cls: 'bg-amber-400/15 text-amber-500 border-amber-400/40', dot: 'bg-amber-400', icon: Clock },
  preparing: { cls: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/40', dot: 'bg-fuchsia-500', icon: ChefHat },
  ready: { cls: 'bg-sky-400/15 text-sky-400 border-sky-400/40', dot: 'bg-sky-400', icon: PackageCheck },
  delivered: { cls: 'bg-emerald-400/15 text-emerald-500 border-emerald-400/40', dot: 'bg-emerald-400', icon: CheckCircle2 },
}

export default function StatusBadge({ status }) {
  const { t } = useApp()
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-extrabold ${s.cls}`}>
      <Icon className="w-3.5 h-3.5" />{t(status || 'pending')}
    </span>
  )
}
