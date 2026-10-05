import { useMemo, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Camera, RotateCcw } from 'lucide-react'
import { db } from '../lib/db'
import { storage } from '../lib/storage'
import { DishPhoto } from './MenuItemCard'
import { useLiveShared } from '../lib/useLive'
import { useApp } from '../AppContext'
import { CATEGORIES, formatDA } from '../i18n'
import CategoryIcon from './CategoryIcon'
import { getStaffGroupId } from '../staffGroup'

function Editor({ item, onClose, nextSort }) {
  const { t, lang } = useApp()
  const [f, setF] = useState({
    nameFr: item?.nameFr || '', nameAr: item?.nameAr || '', price: item?.price ?? '',
    category: item?.category || 'pizzas', available: item?.available !== false, image: item?.image || '',
  })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef(null)
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true); setErr('')
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const { url } = await storage.upload(file, `dish-${Date.now()}.${ext}`)
      setF((s) => ({ ...s, image: url }))
    } catch (e2) { setErr(e2?.message || 'Error') }
    setUploading(false)
  }
  const save = async (e) => {
    e.preventDefault()
    const price = Number(f.price)
    if (!f.nameFr.trim() || !Number.isFinite(price) || price < 0) { setErr(t('required')); return }
    setBusy(true); setErr('')
    const data = { nameFr: f.nameFr.trim(), nameAr: f.nameAr.trim(), price, category: f.category, available: f.available, image: f.image || '' }
    try {
      if (item?.id) await db.updateShared('menu', item.id, data)
      else {
        const gid = await getStaffGroupId()
        await db.insertShared('menu', { ...data, sort: nextSort(f.category) }, undefined, gid ? { groupId: gid } : undefined)
      }
      onClose()
    } catch (e2) { setErr(e2?.message || 'Error'); setBusy(false) }
  }
  return (
    <div className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm flex items-end md:items-center justify-center md:p-6" style={{ height: 'var(--visual-height, 100dvh)' }} onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()}
        className="rise w-full max-w-md bg-card rounded-t-[2rem] md:rounded-[2rem] p-6 border border-line overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl neon-text">{item?.id ? t('edit') : t('newItem')}</h3>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-card-2 grid place-items-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-bold">{t('photo')}</span>
            <div className="mt-1 flex items-center gap-3">
              <DishPhoto key={f.image + f.category} item={{ ...item, category: f.category, image: f.image }} credit={false} className="w-24 h-24 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="h-11 px-4 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}{uploading ? t('uploading') : t('changePhoto')}
                </button>
                {f.image && (
                  <button type="button" onClick={() => setF({ ...f, image: '' })} className="h-10 px-4 rounded-xl bg-card-2 text-muted text-sm font-bold flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />{t('resetPhoto')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <label className="block"><span className="text-sm font-bold">{t('nameFr')}</span>
            <input className="input-field mt-1" dir="ltr" value={f.nameFr} onChange={(e) => setF({ ...f, nameFr: e.target.value })} /></label>
          <label className="block"><span className="text-sm font-bold">{t('nameAr')}</span>
            <input className="input-field mt-1" dir="rtl" value={f.nameAr} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-bold">{t('price')}</span>
              <input className="input-field mt-1" type="number" inputMode="numeric" min="0" step="10" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
            <label className="block"><span className="text-sm font-bold">{t('category')}</span>
              <select className="input-field mt-1" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
              </select></label>
          </div>
          <button type="button" onClick={() => setF({ ...f, available: !f.available })} className="w-full flex items-center justify-between rounded-2xl bg-card-2 px-4 py-3 border border-line">
            <span className="font-bold">{t('available')}</span>
            <span className={`w-12 h-7 rounded-full p-1 transition-colors ${f.available ? 'bg-primary' : 'bg-gray-400/40'}`}>
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${f.available ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''}`} />
            </span>
          </button>
        </div>
        {err && <p className="text-rose-400 text-sm font-bold mt-3">{err}</p>}
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-card-2 font-bold">{t('cancel')}</button>
          <button disabled={busy || uploading} className="flex-1 h-12 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminMenu() {
  const { t, lang } = useApp()
  const { data: items, loading } = useLiveShared('menu', { limit: 500 })
  const [cat, setCat] = useState('pizzas')
  const [editing, setEditing] = useState(null)
  const [err, setErr] = useState('')

  const list = useMemo(() => items.filter((i) => i.category === cat).sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999)), [items, cat])
  const nextSort = (c) => Math.max(0, ...items.filter((i) => i.category === c).map((i) => i.sort || 0)) + 1

  const toggle = async (it) => {
    setErr('')
    try { await db.updateShared('menu', it.id, { available: it.available === false }) } catch (e) { setErr(e?.message || 'Error') }
  }
  const remove = async (it) => {
    if (!window.confirm(t('confirmDel'))) return
    setErr('')
    try { await db.deleteShared('menu', it.id) } catch (e) { setErr(e?.message || 'Error') }
  }

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-5">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 h-11 px-4 rounded-2xl flex items-center gap-2.5 text-sm font-bold border transition-colors ${cat === c.id ? 'bg-primary text-white border-transparent' : 'bg-card border-line text-muted hover:text-main'}`}>
            <CategoryIcon id={c.id} className="w-4 h-4" />{c[lang]}
            <span className="ms-auto text-xs opacity-70">{items.filter((i) => i.category === c.id).length}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-2xl">{CATEGORIES.find((c) => c.id === cat)?.[lang]}</h3>
          <button onClick={() => setEditing({ category: cat })} className="h-11 px-4 rounded-2xl bg-primary text-white font-extrabold flex items-center gap-2 hover:brightness-110">
            <Plus className="w-4 h-4" />{t('newItem')}
          </button>
        </div>
        {err && <p className="text-rose-400 text-sm font-bold mb-3">{err}</p>}
        {loading ? <div className="h-40 rounded-3xl bg-card animate-pulse" /> : (
          <ul className="bg-card rounded-3xl border border-line divide-y divide-[rgb(var(--line)/var(--line-a))] overflow-hidden">
            {list.map((it) => (
              <li key={it.id} className={`flex items-center gap-3 p-3.5 ${it.available === false ? 'opacity-60' : ''}`}>
                <DishPhoto key={it.image || it.id} item={it} credit={false} className="w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{it.nameFr} <span className="text-muted font-normal">· {it.nameAr}</span></div>
                  <div className="neon-yellow font-extrabold text-sm">{formatDA(it.price, lang)}</div>
                </div>
                <button onClick={() => toggle(it)} title={t('available')}
                  className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${it.available !== false ? 'bg-primary' : 'bg-gray-400/40'}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${it.available !== false ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''}`} />
                </button>
                <button onClick={() => setEditing(it)} className="w-10 h-10 rounded-xl bg-card-2 grid place-items-center hover:text-primary" aria-label={t('edit')}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(it)} className="w-10 h-10 rounded-xl bg-card-2 grid place-items-center hover:text-rose-400" aria-label={t('del')}><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
            {list.length === 0 && <li className="p-8 text-center text-muted">—</li>}
          </ul>
        )}
      </div>
      {editing && <Editor item={editing.id ? editing : { category: editing.category }} nextSort={nextSort} onClose={() => setEditing(null)} />}
    </div>
  )
}
