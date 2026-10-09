import { useWedding } from '../context/wedding'
import { currencyFor, formatMoney } from '../lib/money'

/** Formats amounts in the wedding's chosen currency. */
export function useMoney() {
  const currency = currencyFor(useWedding().wedding?.currency)
  return { money: (amount: number) => formatMoney(amount, currency), symbol: currency.symbol.trim() }
}
