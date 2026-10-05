import { team } from './lib/team'
import { db } from './lib/db'

// The restaurant's staff group: orders & menu rows are bound to it so the
// owner AND the manager logins (username + password) can run the dashboard.
let cached = null

export async function getStaffGroupId() {
  if (cached) return cached
  try { cached = await team.groupId() } catch { cached = null }
  if (!cached) {
    try { cached = (await db.getShared('storeinfo', 'team'))?.groupId || null } catch { cached = null }
  }
  if (cached) { try { localStorage.setItem('ye_gid', cached) } catch {} }
  else { try { cached = localStorage.getItem('ye_gid') } catch {} }
  return cached
}

// Fixed username of the owner's personal access-code login (lock button → code only).
export const OWNER_HANDLE = 'patron'

// Owner-only: make sure the staff group exists, is published for checkout,
// the menu is bound to it, and the 'manager' role can run the dashboard.
export async function prepareStaffAccess() {
  const gid = await getStaffGroupId()
  try { await team.setRoleAccess('manager', true) } catch {}
  if (gid) {
    try {
      await db.upsertShared('storeinfo', { groupId: gid }, 'team')
      const rows = await db.selectShared('menu', {}, { limit: 500 })
      if (rows.length) await db.migrateSharedToGroup('menu', rows.map((r) => r.id), gid)
    } catch {}
  }
  return gid
}

export const STAFF_ROLES = [
  { name: 'manager', label: 'Gérant · مسير', admin: true },
]
