import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWedding } from '../context/wedding'

/**
 * Turns a vendor or shopping item into a budget line (estimated cost = its price),
 * so costs are entered once and count in the Budget totals.
 */
export default function AddToBudgetButton({
  linkedBudgetItemId,
  category,
  itemName,
  amount,
  onLinked,
}: {
  linkedBudgetItemId: string | null
  category: string
  itemName: string
  amount: number | null
  onLinked: (budgetItemId: string) => void
}) {
  const weddingId = useWedding().wedding?.id
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (linkedBudgetItemId) {
    return (
      <Link to="/budget" className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        ✓ In budget
      </Link>
    )
  }

  return (
    <button
      disabled={busy || !weddingId}
      title={error ?? undefined}
      onClick={async () => {
        if (!supabase || !weddingId) return
        setBusy(true)
        const { data, error } = await supabase
          .from('budget_items')
          .insert({ wedding_id: weddingId, category, item_name: itemName, estimated_cost: amount ?? 0 })
          .select('id')
          .single()
        setBusy(false)
        if (error) setError(error.message)
        else onLinked((data as { id: string }).id)
      }}
      className="rounded-full bg-[var(--accent-50)] px-2 py-1 text-xs font-medium text-[var(--accent-700)] hover:bg-[var(--accent-100)] disabled:opacity-50"
    >
      {busy ? 'Adding…' : error ? 'Retry add to budget' : '+ Add to budget'}
    </button>
  )
}
