const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
function loadSource(file, customRequire = require) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(customRequire, module, module.exports);
  return module.exports;
}
const finance = loadSource('src/lib/finance.ts');
test('monthly and seven-day totals exclude old and future entries', () => {
  const now = new Date(2026, 9, 7, 12);
  const expenses = ['2026-06-01', '2026-09-30', '2026-10-01', '2026-10-07', '2026-10-08'].map(date => ({date, amountGbp: 10}));
  assert.deepEqual(finance.currentMonthExpenses(expenses, now).map(e => e.date), ['2026-10-01', '2026-10-07']);
  assert.deepEqual(finance.lastSevenDaysExpenses(expenses, now).map(e => e.date), ['2026-10-01', '2026-10-07']);
});
test('currency parser preserves commas, decimals and source currency', () => {
  for (const [message, amount, currency] of [
    ['Convert ₹100,000 to GBP', 100000, 'INR'],
    ['Convert ₹1,00,000 to GBP', 100000, 'INR'],
    ['Convert £450.50 to INR', 450.5, 'GBP'],
    ['100000 INR to GBP', 100000, 'INR'],
    ['450 GBP to INR', 450, 'GBP'],
    ['How much is 25 rupees in pounds?', 25, 'INR'],
  ]) assert.deepEqual(finance.parseCurrencyAmount(message), {amount, currency});
  assert.equal(finance.parseCurrencyAmount('Convert 450'), null);
  assert.equal(finance.parseCurrencyAmount('Convert £-50 to INR'), null);
});
test('EMI handles real parameters, zero interest and invalid tenure', () => {
  assert.equal(Math.round(finance.calculateMonthlyEmi(4000000, 9.65, 6)), 73399);
  assert.equal(finance.calculateMonthlyEmi(1200, 0, 1), 100);
  assert.equal(finance.calculateMonthlyEmi(1200, 5, 0), 0);
});
test('offline chat converts INR to GBP and uses calculated EMI', async () => {
  const route = loadSource('src/app/api/chat/route.ts', name => name === '@/lib/finance' ? finance : require(name));
  const context = {exchangeRate: 100, loan: {loanAmountInr:4000000,amountRepaidInr:350000,interestRate:9.65,tenureYears:6}, savings:[],monthlySpend:0,weeklySpend:0,expensesByCategory:{},recentExpenses:[],upcomingEvents:[]};
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const request = content => new Request('http://localhost/api/chat', {method:'POST',body:JSON.stringify({messages:[{role:'user',content}],context})});
    const conversion = await (await route.POST(request('Convert ₹100,000 to GBP'))).json();
    assert.match(conversion.content, /£1,000\.00/);
    const loan = await (await route.POST(request('How much loan remains?'))).json();
    assert.match(loan.content, /73,399/);
    assert.doesNotMatch(loan.content, /68,000/);
  } finally { if (previousKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previousKey; }
});
