import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, UtensilsCrossed, BarChart3, LogOut, Lock, KeyRound, Loader2, Sparkles, ShieldCheck, ChevronDown } from 'lucide-react'
import { auth } from '../lib/auth'
import { team } from '../lib/team'
import { useLiveShared } from '../lib/useLive'
import { useApp } from '../AppContext'
import TeamLogin from '../components/TeamLogin'
import AdminOrders from '../components/AdminOrders'
import AdminMenu from '../components/AdminMenu'
import AdminAnalytics from '../components/AdminAnalytics'
import OwnerCodeModal from '../components/OwnerCodeModal'
import OwnerCodeLogin from '../components/OwnerCodeLogin'
import { prepareStaffAccess, STAFF_ROLES, OWNER_HANDLE } from '../staffGroup'

function OrdersFeed({ tab }) {
  const { data: orders, loading } = useLiveShared('orders', { order: '-createdAt', limit: 300 })
  const version = orders.map((o) => o.id + o.status).join('|')
  if (tab === 'orders') return <AdminOrders orders={orders} loading={loading} />
  return <AdminAnalytics version={version} />
}

function Brand() {
  return (
    <div className="text-center" dir="ltr">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary grid place-items-center neon-box"><Lock className="w-8 h-8 text-white" /></div>
      <div className="font-brand text-3xl neon-text flicker mt-4">YUMMY <span className="neon-yellow">EAT</span></div>
    </div>
  )
}

export default function Admin() {
  const { t, lang, isOwner, isStaff, user } = useApp()
  const [tab, setTab] = useState('orders')
  const [prep, setPrep] = useState(false)
  const [noCode, setNoCode] = useState(false)
  const [codeOpen, setCodeOpen] = useState(false)
  const [otherLogin, setOtherLogin] = useState(false)

  const checkRoster = useCallback(() => {
    if (!isOwner) return
    team.listMembers().then((m) => setNoCode(!m.some((x) => x.handle?.toLowerCase() === OWNER_HANDLE))).catch(() => {})
  }, [isOwner])
  useEffect(() => { checkRoster() }, [checkRoster])

  const openTeam = async () => {
    setPrep(true)
    try {
      // Publish the staff group for checkout and bind the menu to it so manager logins can edit dishes.
      if (isOwner) await prepareStaffAccess()
    } catch {}
    setPrep(false)
    await team.openAdmin({ roles: STAFF_ROLES })
    checkRoster()
  }

  // Not signed in → username + password gate
  if (!user) {
    return (
      <div className="h-full overflow-y-auto atmo">
        <div className="min-h-full flex flex-col items-center justify-center gap-6 px-4 py-10 pb-[calc(env(safe-area-inset-bottom,0px)+2.5rem)]">
          <div className="rise"><Brand /></div>
          <div className="rise w-full max-w-sm" style={{ animationDelay: '80ms' }}>
            <OwnerCodeLogin />
          </div>
          <button onClick={() => setOtherLogin((v) => !v)}
            className="rise h-11 px-4 rounded-full text-sm font-bold text-muted hover:text-main flex items-center gap-2" style={{ animationDelay: '120ms' }}>
            {t('otherLogin')}<ChevronDown className={`w-4 h-4 transition-transform ${otherLogin ? 'rotate-180' : ''}`} />
          </button>
          {otherLogin && (
          <div className="rise w-full max-w-sm">
            <TeamLogin
              appName="Yummy Eat"
              labels={{
                title: t('staffLogin'),
                subtitle: t('staffLoginSub'),
                username: t('username'),
                password: t('password'),
                submit: t('enter'),
                ownerButton: t('ownerFirst'),
                ownerHint: t('ownerFirstHint'),
              }}
            />
          </div>
          )}
          <Link to="/" className="h-11 px-5 rounded-full bg-card border border-line text-sm font-bold text-muted hover:text-main flex items-center">{t('backToMenu')}</Link>
        </div>
      </div>
    )
  }

  if (isStaff === null) {
    return <div className="h-full grid place-items-center atmo"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!isStaff && !isOwner) {
    return (
      <div className="h-full overflow-y-auto atmo grid place-items-center px-4">
        <div className="rise max-w-sm w-full text-center bg-card rounded-[2rem] border border-line p-8 card-shadow">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary grid place-items-center neon-box"><Lock className="w-8 h-8 text-white" /></div>
          <h1 className="font-display text-2xl mt-5">{t('adminOnly')}</h1>
          <p className="text-rose-400 text-sm font-bold mt-3">{t('noAccess')}</p>
          <button onClick={() => auth.signOut()} className="mt-6 w-full h-12 rounded-2xl bg-primary text-white font-extrabold hover:brightness-110 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" />{t('logout')}</button>
          <Link to="/" className="mt-3 block text-sm font-bold text-muted hover:text-main">{t('backToMenu')}</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'orders', label: t('liveOrders'), icon: ClipboardList },
    { id: 'menu', label: t('menuMgmt'), icon: UtensilsCrossed },
    { id: 'stats', label: t('analytics'), icon: BarChart3 },
  ]

  return (
    <div className="h-full overflow-y-auto atmo">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-extrabold tracking-widest neon-yellow uppercase" dir="ltr">Yummy Eat · Merchant</div>
            <h1 className="font-display text-3xl md:text-4xl neon-text">{t('dashboard')}</h1>
            <div className="text-xs text-muted mt-1 font-bold" dir="auto">{user?.displayName || user?.email || ''}</div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-1 bg-card rounded-2xl border border-line p-1 gap-1 sm:flex-none">
              {tabs.map((tb) => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  className={`flex-1 sm:flex-none h-11 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${tab === tb.id ? 'bg-primary text-white' : 'text-muted hover:text-main'}`}>
                  <tb.icon className="w-4 h-4 shrink-0" /><span className="truncate">{tb.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setCodeOpen(true)} title={t('ownerCodeTitle')} aria-label={t('ownerCodeTitle')}
              className="shrink-0 w-12 h-12 rounded-2xl bg-card border border-line grid place-items-center text-muted hover:text-primary hover:border-primary/60 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </button>
            <button onClick={openTeam} disabled={prep} title={t('teamAccess')} aria-label={t('teamAccess')}
              className="shrink-0 w-12 h-12 rounded-2xl bg-card border border-line grid place-items-center text-muted hover:text-secondary hover:border-secondary/60 transition-colors disabled:opacity-60">
              {prep ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
            </button>
            <button onClick={() => auth.signOut()} title={t('logout')} aria-label={t('logout')}
              className="shrink-0 w-12 h-12 rounded-2xl bg-card border border-line grid place-items-center text-muted hover:text-rose-400 hover:border-rose-400/60 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isOwner && noCode && (
          <div className="rise mb-6 rounded-3xl p-5 border border-secondary/50 bg-secondary/10 flex flex-col sm:flex-row sm:items-center gap-4">
            <Sparkles className="w-8 h-8 text-secondary shrink-0" />
            <div className="flex-1">
              <div className="font-display text-xl">{t('setupTitle')}</div>
              <p className="text-sm text-muted mt-1">{t('setupBody')}</p>
            </div>
            <button onClick={() => setCodeOpen(true)} className="h-12 px-5 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center gap-2 hover:brightness-110">
              <ShieldCheck className="w-4 h-4" />{t('setupBtn')}
            </button>
          </div>
        )}

        {tab === 'menu' ? <AdminMenu /> : <OrdersFeed tab={tab} />}
        {codeOpen && <OwnerCodeModal onClose={() => { setCodeOpen(false); checkRoster() }} />}
      </div>
    </div>
  )
}
