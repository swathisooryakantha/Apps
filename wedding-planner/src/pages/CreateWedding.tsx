import { useEffect, useState } from 'react'
import { signOut } from '../lib/supabase'
import { useWedding } from '../context/wedding'
import AuthShell from '../components/AuthShell'
import { Button, Input } from '../components/ui'
import ThemePicker from '../components/ThemePicker'
import { applyTheme, themeFor, type ThemeId } from '../lib/themes'

export default function CreateWedding() {
  const { createWedding } = useWedding()
  const [yourName, setYourName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [theme, setTheme] = useState<ThemeId>('blush')

  // Preview the chosen vibe right away.
  useEffect(() => {
    applyTheme(themeFor(theme), null, true)
  }, [theme])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <AuthShell title="Create your wedding" subtitle="Just the basics — you can change any of this later.">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          const err = await createWedding({
            bride_name: yourName,
            groom_name: partnerName,
            wedding_date: weddingDate || null,
            theme,
          })
          setSaving(false)
          setError(err)
        }}
      >
        <label className="text-sm text-stone-500">
          Bride's name
          <Input className="mt-1" required value={yourName} onChange={(e) => setYourName(e.target.value)} />
        </label>
        <label className="text-sm text-stone-500">
          Groom's name
          <Input className="mt-1" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
        </label>
        <label className="text-sm text-stone-500">
          Wedding date (optional)
          <Input className="mt-1" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
        </label>
        <div className="text-sm text-stone-500">
          Pick your vibe
          <div className="mt-1">
            <ThemePicker compact value={theme} onChange={setTheme} />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Creating…' : 'Create wedding'}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <button className="mt-4 w-full text-center text-xs text-stone-400 underline" onClick={() => signOut()}>
        Sign out
      </button>
    </AuthShell>
  )
}
