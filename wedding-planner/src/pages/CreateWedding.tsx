import { useState } from 'react'
import { signOut } from '../lib/supabase'
import { useWedding } from '../context/wedding'
import AuthShell from '../components/AuthShell'
import { Button, Input } from '../components/ui'

export default function CreateWedding() {
  const { createWedding } = useWedding()
  const [yourName, setYourName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
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
          })
          setSaving(false)
          setError(err)
        }}
      >
        <label className="text-sm text-stone-500">
          Your name
          <Input className="mt-1" required value={yourName} onChange={(e) => setYourName(e.target.value)} />
        </label>
        <label className="text-sm text-stone-500">
          Your partner's name
          <Input className="mt-1" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
        </label>
        <label className="text-sm text-stone-500">
          Wedding date (optional)
          <Input className="mt-1" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
        </label>
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
