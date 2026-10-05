import { useState } from 'react'
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react'
import { team } from '../lib/team'
import { useApp } from '../AppContext'
import { OWNER_HANDLE } from '../staffGroup'

// Owner's quick entry: just the personal access code (no username, no Google).
export default function OwnerCodeLogin() {
  const { t } = useApp()
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!code) return
    setErr('')
    setBusy(true)
    try {
      await team.login({ handle: OWNER_HANDLE, password: code })
    } catch (e2) {
      const m = String(e2?.message || '')
      setErr(/rate|many|429/i.test(m) ? m : t('wrongCode'))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-card rounded-[2rem] border border-line p-6 card-shadow">
      <div className="font-display text-2xl">{t('ownerCodeLogin')}</div>
      <p className="text-sm text-muted mt-1">{t('ownerCodeLoginSub')}</p>
      <div className="relative mt-5">
        <input
          type={show ? 'text' : 'password'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="current-password"
          autoFocus
          dir="ltr"
          placeholder="••••••••"
          className="input-field pe-12 text-lg font-bold tracking-widest text-center"
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t('hideCode') : t('showCode')}
          className="absolute top-1/2 -translate-y-1/2 end-1 w-11 h-11 grid place-items-center text-muted hover:text-main">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {err && <p className="text-sm font-bold text-rose-400 mt-3">{err}</p>}
      <button type="submit" disabled={busy || !code}
        className="mt-4 w-full h-12 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60">
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}{t('enter')}
      </button>
    </form>
  )
}
