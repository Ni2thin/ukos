import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Send, Bot, Sparkles, User, RefreshCw } from 'lucide-react';
import { Expense, LoanDetails, CalendarEvent, SavingsGoal } from '@/lib/mockData';

interface AIAssistantProps {
  exchangeRate: number;
  loanDetails: LoanDetails;
  expenses: Expense[];
  events: CalendarEvent[];
  savings: SavingsGoal[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  exchangeRate,
  loanDetails,
  expenses,
  events,
  savings,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your **UKOS AI Companion**. I have real-time access to your expenses, loan accounts, savings goals, and calendar deadlines. Ask me anything about your finances or MSc schedule!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Generate Current Context to feed the API
  const getContextPayload = () => {
    // 1. Calculate Monthly Spend (GBP)
    const monthlySpend = expenses.reduce((sum, e) => sum + e.amountGbp, 0);

    // 2. Calculate Weekly Spend (last 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklySpend = expenses
      .filter(e => new Date(e.date).getTime() >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.amountGbp, 0);

    // 3. Category breakdowns
    const expensesByCategory: { [key: string]: number } = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amountGbp;
    });

    // 4. Upcoming events
    const upcomingEvents = events
      .filter(e => new Date(e.date).getTime() >= now - 24 * 60 * 60 * 1000)
      .slice(0, 5);

    return {
      exchangeRate,
      loan: loanDetails,
      monthlySpend,
      weeklySpend,
      expensesByCategory,
      recentExpenses: expenses,
      upcomingEvents,
      savings
    };
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        messages: [...messages, userMessage],
        context: getContextPayload()
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Chat API failed');
      }

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('Invalid chat response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Suggestion prompts from specification
  const suggestions = [
    'How much did I spend this month?',
    'How much loan remains?',
    'Convert £450 to INR',
    'How much have I spent on food?'
  ];

  // Helper function to render simple inline bold tags inside chats
  const renderMessageContent = (text: string) => {
    // Standard quick formatting
    let formatted = text;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.split('\n').join('<br />');

    return (
      <div 
        className="text-xs leading-relaxed select-text" 
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  return (
    <Card className="h-full select-none flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-zinc-150 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/10">
        <Bot className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
        <div>
          <CardTitle className="flex items-center gap-1.5">
            UKOS AI Companion <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400" />
          </CardTitle>
          <p className="text-[10px] text-zinc-500 mt-0.5">Contextual study-abroad & finance chatbot</p>
        </div>
      </CardHeader>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-850 flex flex-col">
        {/* Spacer to push short message histories to the bottom */}
        <div className="flex-1" />
        
        <div className="space-y-3.5">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div 
                key={index} 
                className={`flex gap-2.5 max-w-[85%] ${
                  isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Profile icon bubble */}
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isBot 
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300/50 dark:border-white/5 text-zinc-750 dark:text-zinc-300'
                }`}>
                  {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Chat bubble body */}
                <div className={`p-3 rounded-2xl border ${
                  isBot 
                    ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 text-zinc-850 dark:text-zinc-100 rounded-tl-sm shadow-sm' 
                    : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-lg shadow-indigo-600/5'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            );
          })}

          {/* Loading/Typing pulse state */}
          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border bg-indigo-600/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 rounded-tl-sm flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips and Input bottom panel */}
      <div className="p-3 border-t border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-2.5">
        {/* Suggestion chips (only when chat is idle) */}
        {!isLoading && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg whitespace-nowrap transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Companion..."
            disabled={isLoading}
            className="flex-1 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 placeholder-zinc-500 dark:placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/10"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </Card>
  );
};
