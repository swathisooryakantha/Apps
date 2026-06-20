import type { BudgetItem } from './types'

export function totals(item: BudgetItem, allItems: BudgetItem[]): { estimated: number; actual: number } {
  const children = allItems.filter((i) => i.parent_id === item.id)
  const childActual = children.reduce((sum, c) => sum + totals(c, allItems).actual, 0)
  return { estimated: item.estimated_cost, actual: item.actual_cost + childActual }
}
