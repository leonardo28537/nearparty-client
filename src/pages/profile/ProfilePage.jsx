import { useState } from 'react'
import { User, Mail, Calendar, Edit2, Save, Loader } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'

export const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form, setForm]       = useState({ name: user?.name || '', bio: user?.bio || '' })

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/me', form)
      updateProfile(data.user)
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-up">
        <p className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-spark mb-1">
          Cuenta
        </p>
        <h1 className="font-display font-bold text-3xl text-ink-100 mb-8">Mi perfil</h1>

        <div className="card grain-overlay p-6 mb-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spark/30 to-blaze/20
                            border border-spark/20 flex items-center justify-center
                            font-display font-bold text-2xl text-spark">
              {initials}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-ink-100">{user?.name}</h2>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>

          {/* Editable fields */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input resize-none h-20"
                  placeholder="Cuéntanos algo sobre ti…"
                  value={form.bio} onChange={set('bio')} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving
                    ? <><Loader size={13} className="animate-spin" /> Guardando…</>
                    : <><Save size={13} /> Guardar</>
                  }
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                {[
                  { icon: User,     label: 'Nombre',  value: user?.name },
                  { icon: Mail,     label: 'Email',   value: user?.email },
                  { icon: Calendar, label: 'Miembro desde',
                    value: user?.created_at
                      ? format(new Date(user.created_at), "MMMM 'de' yyyy", { locale: es })
                      : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ink-900/60 border border-[var(--border)]
                                    flex items-center justify-center">
                      <Icon size={13} className="text-ink-500" />
                    </div>
                    <div>
                      <div className="text-xs text-ink-600">{label}</div>
                      <div className="text-sm text-ink-200">{value}</div>
                    </div>
                  </div>
                ))}
                {user?.bio && (
                  <div className="mt-3 p-3 bg-ink-900/60 rounded-xl border border-[var(--border)]">
                    <p className="text-sm text-ink-400 italic">"{user.bio}"</p>
                  </div>
                )}
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary w-full gap-2">
                <Edit2 size={13} /> Editar perfil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
