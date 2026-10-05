import { useEffect, useState } from 'react'
import { X, ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { team } from '../lib/team'
import { useApp } from '../AppContext'
import { OWNER_HANDLE, prepareStaffAccess } from '../staffGroup'

function Field({ label, value, onChange, show, autoComplete }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold text-muted">{label}</span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        dir="ltr"
        className="input-field mt-1 font-bold tracking-wider"
      />
    </label>
  )
}

export default function OwnerCodeModal({ onClose }) {
  const { t, isOwner } = useApp()
  const [member, setMember] = useState(undefined) // current team seat (null = Google owner session)
  const [hasCode, setHasCode] = useState(null)
  const [current, setCurrent] = useState('')
  const [code, setCode] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    team.currentMember().then((m) => setMember(m)).catch(() => setMember(null))
    if (isOwner) {
      team.listMembers()
        .then((list) => setHasCode(list.some((m) => m.handle?.toLowerCase() === OWNER_HANDLE)))
        .catch(() => setHasCode(false))
    }
  }, [isOwner])

  // Owner signed in with the platform account → can set/reset the code directly.
  // Signed in with a code/password seat → changes its own password (needs the current one).
  const ownerMode = isOwner && !member
  const isPatronSeat = member?.handle?.toLowerCase() === OWNER_HANDLE

  const save = async () => {
    setErr('')
    if (code.length < 6) return setErr(t('codeTooShort'))
    if (code !== confirm) return setErr(t('codeMismatch'))
    if (!ownerMode && !current) return setErr(t('required'))
    setBusy(true)
    try {
      if (ownerMode) {
        await prepareStaffAccess()
        const list = await team.listMembers()
        const existing = list.find((m) => m.handle?.toLowerCase() === OWNER_HANDLE)
        if (existing) {
          if (existing.status === 'disabled') await team.enableMember(existing.userId)
          if (existing.role !== 'manager') await team.setRole(existing.userId, 'manager')
          await team.resetPassword(existing.userId, code)
        } else {
          await team.createMember({ handle: OWNER_HANDLE, password: code, role: 'manager', displayName: 'Propriétaire' })
        }
      } else {
        await team.changePassword(current, code)
      }
      setOk(true)
      setHasCode(true)
      setCurrent(''); setCode(''); setConfirm('')
    } catch (e) {
      setErr(e?.message || t('codeError'))
    }
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-6"
      style={{ height: 'var(--visual-height, 100dvh)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="rise w-full md:max-w-md bg-card border border-line rounded-t-[2rem] md:rounded-[2rem] p-6 card-shadow overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary grid place-items-center neon-box shrink-0"><ShieldCheck className="w-6 h-6 text-white" /></div>
          <button onClick={onClose} aria-label={t('cancel')} className="w-11 h-11 rounded-full grid place-items-center text-muted hover:text-main hover:bg-line/40"><X className="w-5 h-5" /></button>
        </div>
        <h2 className="font-display text-2xl mt-4">{ownerMode || isPatronSeat ? t('ownerCodeTitle') : t('myPassword')}</h2>
        <p className="text-sm text-muted mt-1">{ownerMode || isPatronSeat ? t('ownerCodeSub') : t('myPasswordSub')}</p>

        {member === undefined ? (
          <div className="py-10 grid place-items-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : ok ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold">{t('codeSaved')}</div>
              <p className="text-sm text-muted mt-1">{ownerMode || isPatronSeat ? t('codeSavedSub') : t('passwordSavedSub')}</p>
              <button onClick={onClose} className="mt-3 h-11 px-5 rounded-xl bg-primary text-white font-extrabold hover:brightness-110">OK</button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {ownerMode && hasCode !== null && (
              <div className="text-xs font-bold px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/40">
                {hasCode ? t('codeExists') : t('codeNone')}
              </div>
            )}
            {!ownerMode && <Field label={t('currentCode')} value={current} onChange={setCurrent} show={show} autoComplete="current-password" />}
            <Field label={t('newCode')} value={code} onChange={setCode} show={show} autoComplete="new-password" />
            <Field label={t('confirmCode')} value={confirm} onChange={setConfirm} show={show} autoComplete="new-password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="h-10 flex items-center gap-2 text-sm font-bold text-muted hover:text-main">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{show ? t('hideCode') : t('showCode')}
            </button>
            <p className="text-xs text-muted">{t('codeRule')}</p>
            {err && <p className="text-sm font-bold text-rose-400">{err}</p>}
            <button onClick={save} disabled={busy}
              className="w-full h-12 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t('saveCode')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
