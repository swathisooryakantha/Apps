import { useSearchParams } from 'react-router-dom'
import Tasks from './Tasks'
import PostWedding from './PostWedding'

/** Checklist with two tabs: planning up to the wedding, and setting up life after it. */
export default function Checklist() {
  const [params, setParams] = useSearchParams()
  const after = params.get('view') === 'after'

  const tab = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? 'bg-white text-[var(--accent-700)] shadow-sm' : 'text-stone-500'
    }`

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-xl bg-[var(--accent-50)] p-1">
        <button className={tab(!after)} onClick={() => setParams({})}>
          Before the wedding
        </button>
        <button className={tab(after)} onClick={() => setParams({ view: 'after' })}>
          After the wedding
        </button>
      </div>
      {after ? <PostWedding /> : <Tasks />}
    </div>
  )
}
