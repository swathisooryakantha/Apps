export interface Currency {
  code: string
  symbol: string
  label: string
  locale: string
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'en-IE' },
  { code: 'AED', symbol: 'AED ', label: 'UAE Dirham (AED)', locale: 'en-AE' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)', locale: 'en-SG' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)', locale: 'en-AU' },
]

export function currencyFor(code: string | null | undefined): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${currency.symbol}${amount.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
}
