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
const companion = loadSource('src/lib/companion.ts', name => name === './finance' ? finance : require(name));
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
  const route = loadSource('src/app/api/chat/route.ts', name => name === '@/lib/companion' ? companion : name === '@/lib/finance' ? finance : require(name));
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
const contextFixture = () => ({exchangeRate:100, rateSource:'cache',currentDate:'2026-10-07',monthlyBudget:1000,loan:{loanAmountInr:4000000,amountRepaidInr:350000,interestRate:9.65,tenureYears:6},monthlySpend:300,weeklySpend:100,expensesByCategory:{Food:50,Rent:250},recentExpenses:[],upcomingEvents:[{title:'Assignment',category:'University',date:'2026-10-10'}],savings:[{title:'Emergency Fund',targetGbp:1000,currentGbp:500}]});
const ask = (content, context = contextFixture()) => companion.localReply([{role:'user',content}],context);
test('companion answers budget, savings scenarios and deadlines from recorded values', () => {
  assert.match(ask('Break down my spending and budget'), /700\.00/);
  assert.match(ask('If I save £100 per month, how long until my goals?'), /5 months/);
  assert.match(ask('What deadlines are coming up?'), /Assignment/);
  assert.match(ask('Give me my dashboard brief'), /300\.00/);
  assert.match(ask('food spending', {...contextFixture(),expensesByCategory:{}}), /0\.00/);
});
test('follow-up category question inherits spending intent; substring greetings do not hijack questions', () => {
  const response = companion.localReply([{role:'user',content:'What did I spend?'},{role:'assistant',content:'Spending summary'},{role:'user',content:'What about food?'}], contextFixture());
  assert.match(response, /50\.00/);
  assert.equal(ask('Which app should I use?'), null);
});
test('chat rejects malformed data and refuses external calls without opt-in', async () => {
  const route = loadSource('src/app/api/chat/route.ts', name => name === '@/lib/companion' ? companion : require(name));
  assert.equal((await route.POST(new Request('http://localhost/api/chat',{method:'POST',body:'{'}))).status,400);
  assert.equal((await route.POST(new Request('http://localhost/api/chat',{method:'POST',body:JSON.stringify({messages:[],context:{}})}))).status,400);
  const originalKey=process.env.GEMINI_API_KEY;
  const originalFetch=global.fetch;
  process.env.GEMINI_API_KEY='test-only-key';
  let calls=0;
  global.fetch=async () => { calls++; throw new Error('Provider failed'); };
  try {
    const request = useCloudAI => new Request('http://localhost/api/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:'Design a study routine for exams'}],context:contextFixture(),useCloudAI})});
    const local=await (await route.POST(request(false))).json();
    assert.equal(local.mode,'local'); assert.equal(calls,0);
    const fallback=await (await route.POST(request(true))).json();
    assert.equal(calls,1); assert.equal(fallback.mode,'local'); assert.match(fallback.notice,/unavailable/);
  } finally { global.fetch=originalFetch; if(originalKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=originalKey; }
});
test('cloud request uses selected context fields and preserves genuine conversation roles', async () => {
  const route = loadSource('src/app/api/chat/route.ts', name => name === '@/lib/companion' ? companion : require(name));
  const originalKey=process.env.GEMINI_API_KEY, originalFetch=global.fetch;
  process.env.GEMINI_API_KEY='test-only-key';
  global.fetch=async (url, options) => {
    assert.doesNotMatch(url,/test-only-key/);
    assert.equal(options.headers['x-goog-api-key'],'test-only-key');
    const body=JSON.parse(options.body);
    assert.equal(body.contents[0].role,'user');
    assert.doesNotMatch(body.systemInstruction.parts[0].text,/private-passport-value/);
    return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Make a study plan.'}]}}]}),{status:200});
  };
  try {
    const response=await route.POST(new Request('http://localhost/api/chat',{method:'POST',body:JSON.stringify({messages:[{role:'assistant',content:'Hello'},{role:'user',content:'Design a study routine for exams'}],context:{...contextFixture(),passport:'private-passport-value'},useCloudAI:true})}));
    assert.deepEqual(await response.json(),{content:'Make a study plan.',mode:'cloud'});
  } finally {global.fetch=originalFetch; if(originalKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=originalKey;}
});
