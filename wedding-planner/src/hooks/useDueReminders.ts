import { useEffect } from 'react'
import type { EventRow, Task } from '../lib/types'
import { getNotificationPermission, hasNotified, markNotified, sendNotification } from '../lib/notifications'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useDueReminders(events: EventRow[], tasks: Task[]) {
  useEffect(() => {
    function check() {
      if (getNotificationPermission() !== 'granted') return
      const today = todayStr()

      for (const event of events) {
        if (event.event_date !== today) continue
        const tag = `event:${event.id}:${today}`
        if (hasNotified(tag)) continue
        sendNotification('Event today 🎉', `${event.name}${event.venue ? ` at ${event.venue}` : ''}`, tag)
        markNotified(tag)
      }

      for (const task of tasks) {
        if (task.done || !task.due_date) continue
        if (task.due_date > today) continue
        const tag = `task:${task.id}:${today}`
        if (hasNotified(tag)) continue
        const overdue = task.due_date < today
        sendNotification(overdue ? 'Task overdue ⏰' : 'Task due today ✅', task.title, tag)
        markNotified(tag)
      }
    }

    check()
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [events, tasks])
}
