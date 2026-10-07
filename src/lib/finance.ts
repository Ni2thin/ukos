import type { Expense } from './mockData';

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function currentMonthExpenses(expenses: Expense[], now = new Date()): Expense[] {
  const today = localDateKey(now);
  return expenses.filter(e => e.date.slice(0, 7) === today.slice(0, 7) && e.date <= today);
}

export function lastSevenDaysExpenses(expenses: Expense[], now = new Date()): Expense[] {
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  const first = localDateKey(start);
  const today = localDateKey(now);
  return expenses.filter(e => e.date >= first && e.date <= today);
}

export function calculateMonthlyEmi(principal: number, annualRate: number, years: number): number {
  if (![principal, annualRate, years].every(Number.isFinite) || principal < 0 || annualRate < 0 || years <= 0) return 0;
  const months = years * 12;
  const rate = annualRate / 1200;
  if (rate === 0) return principal / months;
  const growth = Math.pow(1 + rate, months);
  return principal * rate * growth / (growth - 1);
}

export function parseCurrencyAmount(message: string): { amount: number; currency: 'GBP' | 'INR' } | null {
  const currency = '(£|₹|GBP|INR|pounds?|rupees?)';
  const number = '(-?[0-9][0-9,]*(?:\\.[0-9]+)?)';
  const prefix = message.match(new RegExp(currency + '\\s*' + number, 'i'));
  const suffix = message.match(new RegExp(number + '\\s*' + currency, 'i'));
  const match = prefix || suffix;
  if (!match) return null;
  const token = prefix ? match[1] : match[2];
  const amount = Number((prefix ? match[2] : match[1]).replaceAll(',', ''));
  if (!Number.isFinite(amount) || amount < 0) return null;
  return { amount, currency: /^(£|GBP|pounds?)$/i.test(token) ? 'GBP' : 'INR' };
}
