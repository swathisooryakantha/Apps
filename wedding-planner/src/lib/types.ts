export interface WeddingSettings {
  id: string
  bride_name: string | null
  groom_name: string | null
  wedding_date: string | null
  total_budget: number
  theme_color: string | null
}

export interface EventRow {
  id: string
  name: string
  event_date: string | null
  start_time: string | null
  end_time: string | null
  venue: string | null
  notes: string | null
  sort_order: number
}

export type BudgetSide = 'bride' | 'groom' | 'gift'

export interface BudgetItem {
  id: string
  parent_id: string | null
  category: string
  item_name: string
  estimated_cost: number
  actual_cost: number
  paid: boolean
  side: BudgetSide
  notes: string | null
}

export type RsvpStatus = 'pending' | 'yes' | 'no'
export type Side = 'bride' | 'groom' | 'both'

export interface Guest {
  id: string
  name: string
  side: Side
  group_name: string | null
  rsvp_status: RsvpStatus
  plus_one_count: number
  phone: string | null
  needs_stay: boolean
  invite_sent: boolean
  notes: string | null
}

export interface StayVenue {
  id: string
  name: string
  address: string | null
  contact: string | null
  notes: string | null
}

export interface StayRoom {
  id: string
  stay_venue_id: string
  room_label: string
  capacity: number
  notes: string | null
}

export interface StayAssignment {
  id: string
  stay_room_id: string
  guest_id: string
}

export type VendorStatus = 'considering' | 'contacted' | 'booked'

export interface Vendor {
  id: string
  name: string
  category: string | null
  contact_name: string | null
  phone: string | null
  price: number | null
  status: VendorStatus
  notes: string | null
}

export interface Task {
  id: string
  parent_id: string | null
  title: string
  timeframe: string | null
  due_date: string | null
  done: boolean
  owner: string | null
  notes: string | null
}

export type ShoppingStatus = 'to_do' | 'in_progress' | 'done'

export interface ShoppingItem {
  id: string
  item_name: string
  category: string | null
  status: ShoppingStatus
  store_or_vendor: string | null
  cost: number | null
  due_date: string | null
  notes: string | null
}

export interface InspirationItem {
  id: string
  title: string
  category: string | null
  image_url: string | null
  source_link: string | null
  notes: string | null
}

export interface Gift {
  id: string
  giver_name: string
  relation: string | null
  category: string | null
  gift_description: string | null
  amount: number | null
  notes: string | null
}

export type JournalPerson = 'bride' | 'groom'

export interface MoodEntry {
  id: string
  person: JournalPerson
  entry_date: string
  mood: string
  quote: string | null
  note: string | null
}

export interface PostWeddingItem {
  id: string
  parent_id: string | null
  title: string
  category: string | null
  cost: number | null
  done: boolean
  owner: string | null
  notes: string | null
}
