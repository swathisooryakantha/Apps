import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import type { Guest, StayAssignment, StayRoom, StayVenue } from '../lib/types'
import { Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from '../components/ui'

export default function Stay() {
  const { rows: venues, insert: insertVenue, remove: removeVenue } = useTable<StayVenue>('stay_venues')
  const { rows: rooms, insert: insertRoom, remove: removeRoom } = useTable<StayRoom>('stay_rooms')
  const { rows: assignments, insert: insertAssignment, remove: removeAssignment } = useTable<StayAssignment>(
    'stay_assignments',
  )
  const { rows: guests } = useTable<Guest>('guests')

  const [showVenueForm, setShowVenueForm] = useState(false)
  const [roomFormFor, setRoomFormFor] = useState<string | null>(null)

  const guestsNeedingStay = guests.filter((g) => g.needs_stay)
  const assignedGuestIds = new Set(assignments.map((a) => a.guest_id))
  const unassignedGuests = guestsNeedingStay.filter((g) => !assignedGuestIds.has(g.id))

  return (
    <div>
      <PageHeader
        title="Stay & Accommodation"
        subtitle={`${guestsNeedingStay.length} guests need stay · ${unassignedGuests.length} unassigned`}
        action={<Button onClick={() => setShowVenueForm((s) => !s)}>{showVenueForm ? 'Close' : '+ Add stay venue'}</Button>}
      />

      {showVenueForm && (
        <Card className="mb-4">
          <VenueForm
            onSave={(v) => {
              insertVenue(v)
              setShowVenueForm(false)
            }}
          />
        </Card>
      )}

      {unassignedGuests.length > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <p className="mb-1 text-sm font-semibold text-amber-800">Unassigned guests needing stay</p>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map((g) => (
              <span key={g.id} className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                {g.name} {g.plus_one_count > 0 && `+${g.plus_one_count}`}
              </span>
            ))}
          </div>
        </Card>
      )}

      {venues.length === 0 && <EmptyState text="No stay venues added yet." />}

      <div className="space-y-4">
        {venues.map((venue) => {
          const venueRooms = rooms.filter((r) => r.stay_venue_id === venue.id)
          return (
            <Card key={venue.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-stone-800">{venue.name}</p>
                  {venue.address && <p className="text-xs text-stone-400">{venue.address}</p>}
                  {venue.contact && <p className="text-xs text-stone-400">📞 {venue.contact}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setRoomFormFor(roomFormFor === venue.id ? null : venue.id)}>
                    + Room
                  </Button>
                  <Button variant="danger" onClick={() => removeVenue(venue.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              {roomFormFor === venue.id && (
                <div className="mt-3 border-t border-rose-100 pt-3">
                  <RoomForm
                    onSave={(v) => {
                      insertRoom({ ...v, stay_venue_id: venue.id })
                      setRoomFormFor(null)
                    }}
                  />
                </div>
              )}

              <div className="mt-3 space-y-2">
                {venueRooms.map((room) => {
                  const roomAssignments = assignments.filter((a) => a.stay_room_id === room.id)
                  const occupants = roomAssignments
                    .map((a) => guests.find((g) => g.id === a.guest_id))
                    .filter(Boolean) as Guest[]
                  const occupiedCount = occupants.reduce((s, g) => s + 1 + (g.plus_one_count || 0), 0)

                  return (
                    <div key={room.id} className="rounded-lg bg-rose-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-700">
                          {room.room_label}{' '}
                          <span className="text-xs text-stone-400">
                            ({occupiedCount}/{room.capacity})
                          </span>
                        </p>
                        <Button variant="danger" onClick={() => removeRoom(room.id)}>
                          Remove
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {occupants.map((g) => {
                          const assignment = roomAssignments.find((a) => a.guest_id === g.id)!
                          return (
                            <span
                              key={g.id}
                              className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-stone-600"
                            >
                              {g.name}
                              <button onClick={() => removeAssignment(assignment.id)} className="text-stone-400 hover:text-red-500">
                                ×
                              </button>
                            </span>
                          )
                        })}
                      </div>
                      {unassignedGuests.length > 0 && (
                        <select
                          className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              insertAssignment({ stay_room_id: room.id, guest_id: e.target.value })
                            }
                          }}
                        >
                          <option value="">Assign a guest...</option>
                          {unassignedGuests.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                })}
                {venueRooms.length === 0 && <p className="text-xs text-stone-400">No rooms added yet.</p>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function VenueForm({ onSave }: { onSave: (v: Partial<StayVenue>) => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ name, address, contact, notes })
      }}
    >
      <label className="text-sm text-stone-500">
        Venue / hotel name
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="text-sm text-stone-500">
        Contact
        <Input className="mt-1" value={contact} onChange={(e) => setContact(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Address
        <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <label className="text-sm text-stone-500 md:col-span-2">
        Notes
        <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <Button type="submit" className="md:col-span-2">
        Save venue
      </Button>
    </form>
  )
}

function RoomForm({ onSave }: { onSave: (v: Partial<StayRoom>) => void }) {
  const [roomLabel, setRoomLabel] = useState('')
  const [capacity, setCapacity] = useState('2')

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ room_label: roomLabel, capacity: Number(capacity) || 2 })
        setRoomLabel('')
      }}
    >
      <label className="text-sm text-stone-500">
        Room label
        <Input className="mt-1" value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} required placeholder="e.g. Room 204" />
      </label>
      <label className="text-sm text-stone-500">
        Capacity
        <Select className="mt-1 w-24" value={capacity} onChange={(e) => setCapacity(e.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </label>
      <Button type="submit">Add room</Button>
    </form>
  )
}
