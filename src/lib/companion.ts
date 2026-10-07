import { calculateMonthlyEmi, parseCurrencyAmount } from './finance';

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface CompanionContext {
  exchangeRate: number;
  rateSource?: string;
  currentDate?: string;
  monthlyBudget?: number;
  loan: { loanAmountInr: number; amountRepaidInr: number; interestRate: number; tenureYears: number };
  monthlySpend: number;
  weeklySpend: number;
  expensesByCategory: Record<string, number>;
  recentExpenses: { title: string; amountGbp: number; category: string; date: string }[];
  upcomingEvents: { title: string; category: string; date: string }[];
  savings: { title: string; targetGbp: number; currentGbp: number }[];
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e12;
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 500;
const date = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export function validContext(value: unknown): value is CompanionContext {
  if (!record(value) || !number(value.exchangeRate) || value.exchangeRate <= 0 || !number(value.monthlySpend) || !number(value.weeklySpend)) return false;
  if (!record(value.loan) || !['loanAmountInr', 'amountRepaidInr', 'interestRate', 'tenureYears'].every(key => number(value.loan && (value.loan as Record<string, unknown>)[key]))) return false;
  if (!record(value.expensesByCategory) || Object.entries(value.expensesByCategory).some(([key, val]) => !text(key) || !number(val))) return false;
  if (value.monthlyBudget !== undefined && !number(value.monthlyBudget)) return false;
  if (value.currentDate !== undefined && !date(value.currentDate)) return false;
  if (value.rateSource !== undefined && !text(value.rateSource)) return false;
  return [
    ['savings', (item: Record<string, unknown>) => text(item.title) && number(item.targetGbp) && number(item.currentGbp)],
    ['recentExpenses', (item: Record<string, unknown>) => text(item.title) && text(item.category) && number(item.amountGbp) && date(item.date)],
    ['upcomingEvents', (item: Record<string, unknown>) => text(item.title) && text(item.category) && date(item.date)],
  ].every(([key, check]) => {
    const items = value[key as string];
    return Array.isArray(items) && items.length <= 50 && items.every(item => record(item) && (check as (item: Record<string, unknown>) => boolean)(item));
  });
}

export function validMessages(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 30 && value.every(item => record(item) && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string' && item.content.trim().length > 0 && item.content.length <= 4000) && value[value.length - 1].role === 'user';
}

export function localReply(messages: ChatMessage[], c: CompanionContext): string | null {
  const message = messages[messages.length - 1].content;
  let msg = message.toLowerCase();
  const previous = messages.slice(0, -1).filter(m => m.role === 'user').at(-1)?.content.toLowerCase() || '';
  if (/^(and |what about |how about )/.test(msg) && /spend|expense|budget/.test(previous)) msg = `spending ${msg}`;
  const gbp = (amount: number) => `£${amount.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const inr = (amount: number) => `₹${amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
  const rateNote = c.rateSource === 'fallback' ? 'Uses the offline fallback rate; refresh before making a transfer.' : 'Uses your dashboard rate; transfer fees and provider margins are excluded.';
  const categories = Object.entries(c.expensesByCategory).sort((a, b) => b[1] - a[1]);

  if (/\b(convert|conversion|exchange|rate|gbp|inr|pounds?|rupees?)\b|£|₹/.test(msg) && !/\b(save|saving|savings|budget|afford|loan|emi|repay)\b/.test(msg)) {
    const parsed = parseCurrencyAmount(message);
    if (!parsed) return `### Currency converter\n£1 = **${inr(c.exchangeRate)}**.\nSpecify the amount and starting currency, for example “Convert ₹100,000 to GBP”.\n\n${rateNote}`;
    const converted = parsed.currency === 'GBP' ? `${gbp(parsed.amount)} = **${inr(parsed.amount * c.exchangeRate)}**` : `${inr(parsed.amount)} = **${gbp(parsed.amount / c.exchangeRate)}**`;
    return `### Currency conversion\n${converted}\n\n£1 = ${inr(c.exchangeRate)}. ${rateNote}`;
  }
  if (/\b(summary|overview|brief|today|prioriti[sz]e|priorities)\b/.test(msg)) {
    const remaining = c.monthlyBudget ? `${gbp(Math.abs(c.monthlyBudget - c.monthlySpend))} ${c.monthlySpend > c.monthlyBudget ? 'over' : 'remaining against'} your planned monthly budget.` : 'No monthly budget has been recorded.';
    const next = c.upcomingEvents[0];
    return `### Your dashboard brief\n- This month: **${gbp(c.monthlySpend)}** logged; last seven days: **${gbp(c.weeklySpend)}**.\n- Budget: ${remaining}\n- Savings: **${gbp(c.savings.reduce((sum, s) => sum + s.currentGbp, 0))}** across ${c.savings.length} goals.\n- Next event: ${next ? `**${next.title}** on ${next.date}.` : 'No upcoming events recorded.'}\n\n${c.monthlySpend === 0 ? 'Start by logging current-month expenses so your budget reflects actual spending.' : 'Review your largest expense category, then check your next deadline.'}`;
  }
  if (/\b(loan|debt|borrow|borrowed|repay|repayment|emi)\b/.test(msg)) {
    const loan = c.loan;
    const emi = calculateMonthlyEmi(loan.loanAmountInr, loan.interestRate, loan.tenureYears);
    return `### Education loan\n- Borrowed: **${inr(loan.loanAmountInr)}**\n- Payments recorded: **${inr(loan.amountRepaidInr)}**\n- Borrowed minus recorded payments: **${inr(loan.loanAmountInr - loan.amountRepaidInr)}**\n- Estimated monthly EMI: **${inr(Math.round(emi))}** (${gbp(emi / c.exchangeRate)})\n\nEMI uses ${loan.interestRate}% annual interest over ${loan.tenureYears} years. The lender’s actual outstanding balance can differ because of interest, fees and moratorium terms. Check your loan statement before planning a repayment.`;
  }
  if (/\b(saving|savings|save|goal|goals|emergency)\b/.test(msg)) {
    if (!c.savings.length) return 'No savings goals are recorded yet. Add a goal in Savings & Planning, then I can calculate the amount still needed.';
    const contribution = parseCurrencyAmount(message);
    const monthly = /per month|a month|monthly|each month/.test(msg) && contribution && contribution.amount > 0 ? (contribution.currency === 'GBP' ? contribution.amount : contribution.amount / c.exchangeRate) : null;
    const named = c.savings.filter(s => msg.includes(s.title.toLowerCase()));
    const goals = named.length ? named : c.savings;
    return `### Savings roadmap\n${goals.map(s => {
      const needed = Math.max(0, s.targetGbp - s.currentGbp);
      const progress = s.targetGbp > 0 ? Math.min(100, Math.round(s.currentGbp / s.targetGbp * 100)) : 0;
      return `- **${s.title}**: ${gbp(s.currentGbp)} of ${gbp(s.targetGbp)} (${progress}%). ${needed === 0 ? 'Target reached.' : `${gbp(needed)} still needed.${monthly ? ` About ${Math.ceil(needed / monthly)} months at ${gbp(monthly)}/month.` : ''}`}`;
    }).join('\n')}\n\n${monthly ? 'Each timeline assumes that contribution goes to that goal alone, with no interest or withdrawals.' : 'Ask “If I save £100 per month, how long until my goals?” for a contribution scenario.'}`;
  }
  if (/\b(calendar|event|events|deadline|deadlines|due|assignment|assignments|schedule)\b/.test(msg)) {
    return c.upcomingEvents.length ? `### Upcoming deadlines\n${c.upcomingEvents.map(e => `- **${e.title}** — ${e.date} (${e.category})`).join('\n')}\n\nThese are your recorded events, not university or lender confirmations.` : 'No upcoming events are recorded. Add your deadlines to the calendar and I can help you prioritise them.';
  }
  if (/\b(spend|spending|spent|expense|expenses|budget|food|groceries|rent|afford|cut|reduce|money|breakdown)\b/.test(msg)) {
    const categoryName = ['Food', 'Rent', 'Transport', 'Gym', 'Shopping', 'Travel', 'Entertainment', 'Bills', 'University'].find(name => new RegExp(`\\b${name.toLowerCase()}\\b`).test(msg) || (name === 'Food' && /grocer/.test(msg)));
    const category: [string, number] | undefined = categoryName ? [categoryName, c.expensesByCategory[categoryName] || 0] : undefined;
    if (category) return `### ${category[0]} spending\nYou have logged **${gbp(category[1])}** (${inr(category[1] * c.exchangeRate)}) for ${category[0]} this month.\n\n${category[1] === 0 ? 'No current-month entries for this category.' : 'This total includes recorded expenses only.'}`;
    const budget = c.monthlyBudget || 0;
    return `### Monthly spending\n- This month: **${gbp(c.monthlySpend)}** (${inr(c.monthlySpend * c.exchangeRate)})\n- Last seven days: **${gbp(c.weeklySpend)}**\n${budget > 0 ? `- Planned monthly budget: **${gbp(budget)}**\n- ${c.monthlySpend > budget ? 'Over plan by' : 'Remaining against plan'}: **${gbp(Math.abs(budget - c.monthlySpend))}**\n` : ''}${categories.length ? `\n### Category breakdown\n${categories.map(([name, amount]) => `- ${name}: **${gbp(amount)}**`).join('\n')}` : '\nNo expenses are logged for this month. Historical entries are excluded.'}\n\n${budget === 0 ? 'Set your planned costs in Savings & Planning to compare spending with a budget.' : 'Planned costs are a budgeting estimate; they do not establish your available cash.'}`;
  }
  if (/^(hello|hi|hey|help)\b/.test(msg)) return '### How I can help\n- Summarise your recorded spending and upcoming deadlines.\n- Compare spending with your planned monthly budget.\n- Calculate currency conversions and EMI estimates.\n- Work out a savings goal timeline.\n\nTry “Give me my dashboard brief” or “If I save £100 per month, how long until my goals?”';
  return null;
}
