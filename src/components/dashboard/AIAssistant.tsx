import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Send, Bot, Sparkles, User, RotateCcw, Square, ArrowUpRight } from 'lucide-react';
import { Expense, LoanDetails, CalendarEvent, SavingsGoal, LivingEstimate } from '@/lib/mockData';
import { currentMonthExpenses, lastSevenDaysExpenses, localDateKey } from '@/lib/finance';
import type { ChatMessage } from '@/lib/companion';

interface AIAssistantProps {
  exchangeRate: number;
  rateSource?: string;
  loanDetails: LoanDetails;
  expenses: Expense[];
  events: CalendarEvent[];
  savings: SavingsGoal[];
  estimates?: LivingEstimate[];
}
interface Message extends ChatMessage { mode?: 'local' | 'cloud' }
const suggestions = [
  ['Dashboard brief', 'Give me my dashboard brief'],
  ['Review my budget', 'Break down my spending and budget'],
  ['Savings roadmap', 'If I save £100 per month, how long until my goals?'],
  ['Upcoming deadlines', 'What deadlines are coming up?'],
  ['Convert currency', 'Convert ₹100,000 to GBP'],
  ['Loan estimate', 'Show my loan and EMI estimate'],
];
function InlineText({text}: {text: string}) {
  return <>{text.split(/(\*\*.*?\*\*|\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> :
    part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part
  )}</>;
}
function MessageContent({text}: {text: string}) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^[-*] /.test(line)) {
      const items = [];
      do { items.push(<li key={i}><InlineText text={lines[i].slice(2)} /></li>); i++; } while (i < lines.length && /^[-*] /.test(lines[i]));
      blocks.push(<ul key={`list-${i}`} className="list-disc pl-4 space-y-1.5">{items}</ul>);
      i--;
    } else if (/^#{1,3} /.test(line)) {
      blocks.push(<h4 key={i} className="font-bold text-sm"><InlineText text={line.replace(/^#{1,3} /, '')} /></h4>);
    } else {
      blocks.push(<p key={i}><InlineText text={line} /></p>);
    }
  }
  return <div className="text-sm leading-relaxed space-y-2.5 break-words select-text">{blocks}</div>;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({exchangeRate, rateSource, loanDetails, expenses, events, savings, estimates = []}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [useCloudAI, setUseCloudAI] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const retryRef = useRef('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/chat', {signal: controller.signal}).then(res => res.json()).then(data => setCloudAvailable(data.cloudAvailable === true)).catch(() => {});
    return () => { controller.abort(); requestRef.current?.abort(); };
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth', block:'nearest'}); }, [messages, isLoading]);

  const getContextPayload = () => {
    const monthlyExpenses = currentMonthExpenses(expenses);
    const expensesByCategory: Record<string, number> = {};
    monthlyExpenses.forEach(e => { expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amountGbp; });
    return {
      exchangeRate, rateSource, currentDate: localDateKey(), loan: loanDetails,
      monthlyBudget: estimates.reduce((sum, item) => sum + item.amountGbp, 0),
      monthlySpend: monthlyExpenses.reduce((sum, e) => sum + e.amountGbp, 0),
      weeklySpend: lastSevenDaysExpenses(expenses).reduce((sum, e) => sum + e.amountGbp, 0),
      expensesByCategory,
      recentExpenses: [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map(({title, amountGbp, category, date}) => ({title, amountGbp, category, date})),
      upcomingEvents: events.filter(e => e.date >= localDateKey()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(({title, category, date}) => ({title, category, date})),
      savings: savings.slice(0, 50).map(({title, targetGbp, currentGbp}) => ({title, targetGbp, currentGbp})),
    };
  };
  const handleSend = async (text: string, retry = false) => {
    const content = text.trim();
    if (!content || content.length > 2000 || requestRef.current) return;
    const history = retry ? messages : [...messages, {role:'user' as const, content}];
    if (!retry) setMessages(history.slice(-60));
    setInput(''); setError(''); setNotice(''); setIsLoading(true); retryRef.current = content;
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), 30000);
    try {
      const response = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({messages:history.slice(-30).map(({role,content}) => ({role,content:content.slice(0,4000)})), context:getContextPayload(), useCloudAI}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The companion could not answer. Try again.');
      if (typeof data.content !== 'string' || !data.content.trim()) throw new Error('No answer was received. Try again.');
      if (controller.signal.aborted) return;
      setMessages(prev => [...prev, {role:'assistant',content:data.content,mode:data.mode === 'cloud' ? 'cloud' : 'local'}].slice(-60) as Message[]);
      setNotice(data.notice || '');
    } catch (err) {
      if (controller.signal.reason === 'stopped' || controller.signal.reason === 'cleared') return;
      setError(controller.signal.aborted ? 'That took too long. Please try again.' : err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) { requestRef.current = null; setIsLoading(false); inputRef.current?.focus(); }
    }
  };
  const clearChat = () => {
    requestRef.current?.abort('cleared'); requestRef.current = null;
    setMessages([]); setError(''); setNotice(''); setInput(''); setIsLoading(false); retryRef.current = ''; inputRef.current?.focus();
  };

  return (
    <Card className="companion-card h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3 p-4 border-b border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500"><Bot className="h-5 w-5" /></div>
          <div><h3 className="card-title text-zinc-900 dark:text-white">UK101 AI Companion</h3><p className="text-xs text-zinc-500 mt-1">Budget clarity. Better plans.</p></div>
        </div>
        <button type="button" onClick={clearChat} disabled={!messages.length && !isLoading} aria-label="Start a new chat" title="Start a new chat" className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-30"><RotateCcw className="h-4 w-4" /></button>
      </header>
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-current" /> Dashboard answers</span>
        <span className="text-zinc-500">Chat stays in this tab</span>
      </div>
      <div role="log" aria-label="Companion conversation" aria-live="polite" aria-relevant="additions" className="flex-1 min-h-[320px] max-h-[480px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {!messages.length && <div className="py-4">
          <Sparkles className="h-6 w-6 text-indigo-500 mb-3" />
          <h4 className="font-bold text-zinc-900 dark:text-white">Make sense of your student life.</h4>
          <p className="text-sm leading-relaxed text-zinc-500 mt-2 mb-5">Ask about recorded expenses, savings goals, loan estimates or deadlines. I can explain your numbers and help you plan your next step.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{suggestions.map(([label, prompt]) => <button key={label} onClick={() => handleSend(prompt)} className="flex items-center justify-between gap-2 p-3 text-left text-sm rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-500/10 hover:border-indigo-500/30"><span>{label}</span><ArrowUpRight className="h-3 w-3 shrink-0 text-indigo-500" /></button>)}</div>
        </div>}
        {messages.map((message, index) => <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <div className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-500">{message.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}</div>
          <div className={`max-w-[88%] min-w-0 rounded-2xl p-3 ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'}`}>
            <MessageContent text={message.content} />
            {message.role === 'assistant' && <p className="mt-2.5 text-xs text-zinc-500">{message.mode === 'cloud' ? 'Cloud AI · verify important decisions' : 'Based on your recorded dashboard data'}</p>}
          </div>
        </div>)}
        {isLoading && <p role="status" className="text-sm text-indigo-500 animate-pulse">Checking your question…</p>}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-zinc-200 dark:border-white/5 space-y-2.5">
        {notice && <p role="status" className="text-sm text-amber-600 dark:text-amber-400">{notice}</p>}
        {error && <div role="alert" className="flex items-center justify-between gap-2 rounded-lg bg-rose-500/10 p-2.5 text-sm text-rose-600 dark:text-rose-400"><span>{error}</span><button onClick={() => handleSend(retryRef.current, true)} className="font-bold underline shrink-0">Retry</button></div>}
        {!!messages.length && !isLoading && !error && <div className="flex gap-2 overflow-x-auto pb-1">{suggestions.slice(0,4).map(([label,prompt]) => <button key={label} onClick={() => handleSend(prompt)} className="text-xs whitespace-nowrap text-zinc-500 hover:text-indigo-500 border border-zinc-200 dark:border-white/10 px-2 py-1 rounded-lg">{label}</button>)}</div>}
        {cloudAvailable && <label className="flex items-start gap-2 text-xs text-zinc-500"><input type="checkbox" checked={useCloudAI} disabled={isLoading} onChange={e => setUseCloudAI(e.target.checked)} className="mt-0.5" /><span>Use cloud AI for broader questions. This shares this conversation and your budget, loan, savings and calendar summary with Google Gemini. Identity and document fields are excluded.</span></label>}
        <form onSubmit={e => {e.preventDefault(); handleSend(input);}} className="flex gap-2">
          <input ref={inputRef} type="text" aria-label="Ask AI Companion" value={input} maxLength={2000} onChange={e => setInput(e.target.value)} placeholder="Ask about your budget or next deadline…" disabled={isLoading || !!error} className="min-w-0 flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50" />
          {isLoading ? <button type="button" aria-label="Stop response" onClick={() => {requestRef.current?.abort('stopped'); setNotice('Response stopped. Start a new chat to remove the unanswered message.');}} className="p-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"><Square className="h-4 w-4" /></button> : <button type="submit" aria-label="Send message" disabled={!input.trim() || !!error} className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30"><Send className="h-4 w-4" /></button>}
        </form>
      </div>
    </Card>
  );
};
