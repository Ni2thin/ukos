import { calculateMonthlyEmi, parseCurrencyAmount } from '@/lib/finance';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    
    const latestMessage = messages[messages.length - 1]?.content || '';
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Data summary to inject into the LLM context
    const dataContext = `
Current GBP/INR Exchange Rate: £1 = ₹${context.exchangeRate.toFixed(2)}
Tuition balance: Not recorded; do not infer a balance.
Total Amount Borrowed for Education Loan: ₹${context.loan.loanAmountInr.toLocaleString('en-IN')}
Total Loan Repaid: ₹${context.loan.amountRepaidInr.toLocaleString('en-IN')}
Loan Outstanding: ₹${(context.loan.loanAmountInr - context.loan.amountRepaidInr).toLocaleString('en-IN')} (approx. £${Math.round((context.loan.loanAmountInr - context.loan.amountRepaidInr) / context.exchangeRate).toLocaleString('en-GB')})
Loan Interest Rate: ${context.loan.interestRate}%
Loan Tenure: ${context.loan.tenureYears} Years

Savings Goals:
${context.savings.map((s: any) => `- ${s.title}: Target £${s.targetGbp}, Current £${s.currentGbp} (${Math.round((s.currentGbp / s.targetGbp) * 100)}% progress)`).join('\n')}

Monthly Spend Tracker (GBP):
- Total Monthly Expenses: £${context.monthlySpend.toFixed(2)}
- Weekly Spend Total: £${context.weeklySpend.toFixed(2)}
- Spending Categories:
${Object.entries(context.expensesByCategory).map(([cat, val]: any) => `  * ${cat}: £${val.toFixed(2)} (₹${Math.round(val * context.exchangeRate).toLocaleString('en-IN')})`).join('\n')}

Recent Expenses List:
${context.recentExpenses.slice(0, 5).map((e: any) => `- ${e.title}: £${e.amountGbp} (Category: ${e.category}, Date: ${e.date})`).join('\n')}

Upcoming Calendar Events:
${context.upcomingEvents.map((e: any) => `- ${e.title} (${e.category}) on ${e.date}`).join('\n')}
    `;

    // 1. Fallback: If no Gemini API Key is configured, use a rule-based helper
    if (!apiKey) {
      const reply = getRuleBasedResponse(latestMessage, context);
      return NextResponse.json({
        content: reply + '\n\n*(Note: Running in offline local mode. Configure GEMINI_API_KEY in your environment for full generative AI responses.)*'
      });
    }

    // 2. Main Gemini API Call
    const systemPrompt = `You are "UKOS AI Companion", a smart, friendly, and practical financial advisor and study-abroad assistant designed for a UK Master's student from India. 
Use the following real-time dashboard data to answer the user's queries accurately. Keep your responses concise, focused on helping them manage their budget and academic life, and format them nicely in markdown.

---
CURRENT STUDENT CONTEXT:
${dataContext}
---

Rules:
- Give figures in both GBP (£) and INR (₹) whenever helpful.
- Be encouraging and offer helpful budgeting tips (e.g. if food spend is high, suggest using student discounts or buying at Lidl/Tesco instead of eating out).
- If the user asks about something unrelated, politely steer them back to their UK master's journey, finance, loan, calendar, or notes.
`;

    // Convert messages format for Gemini (user/model)
    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add conversation history
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: geminiContents })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned code ${response.status}`);
    }

    const resData = await response.json();
    const botReply = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!botReply) {
      throw new Error('Empty response from Gemini API');
    }

    return NextResponse.json({ content: botReply });

  } catch (error: any) {
    console.error('AI API Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}

// Highly customized rule-based responder for offline testing
function getRuleBasedResponse(message: string, context: any): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('spend') || msg.includes('expense') || msg.includes('bought')) {
    if (msg.includes('food') || msg.includes('grocer')) {
      const foodSpend = context.expensesByCategory['Food'] || 0;
      return `You have spent **£${foodSpend.toFixed(2)}** (₹${Math.round(foodSpend * context.exchangeRate).toLocaleString('en-IN')}) on **Food** this month. Keep an eye out for Tesco Clubcard discounts or check out Aldi and Lidl in Guildford for cheaper options!`;
    }
    if (msg.includes('rent')) {
      const rentSpend = context.expensesByCategory['Rent'] || 0;
      return `Your **Rent** expenses registered this month total **£${rentSpend.toFixed(2)}** (₹${Math.round(rentSpend * context.exchangeRate).toLocaleString('en-IN')}). Rent is your largest fixed expense.`;
    }
    return `Your total monthly spend registered on the dashboard is **£${context.monthlySpend.toFixed(2)}** (₹${Math.round(context.monthlySpend * context.exchangeRate).toLocaleString('en-IN')}). Your weekly total is **£${context.weeklySpend.toFixed(2)}** (₹${Math.round(context.weeklySpend * context.exchangeRate).toLocaleString('en-IN')}).`;
  }

  if (msg.includes('loan') || msg.includes('debt') || msg.includes('borrow') || msg.includes('repay')) {
    const totalBorrowed = context.loan.loanAmountInr;
    const repaid = context.loan.amountRepaidInr;
    const outstandingInr = totalBorrowed - repaid;
    const outstandingGbp = Math.round(outstandingInr / context.exchangeRate);
    const progress = totalBorrowed > 0 ? Math.round((repaid / totalBorrowed) * 100) : 0;
    const emi = calculateMonthlyEmi(totalBorrowed, context.loan.interestRate, context.loan.tenureYears);
    return `### Education Loan Status
- **Borrowed Amount**: ₹${totalBorrowed.toLocaleString('en-IN')}
- **Repaid So Far**: ₹${repaid.toLocaleString('en-IN')}
- **Outstanding Balance**: ₹${outstandingInr.toLocaleString('en-IN')} (approx. **£${outstandingGbp.toLocaleString('en-GB')}**)
- **Repayment Progress**: ${progress}% complete.

Estimated monthly EMI from your configured loan parameters: **₹${Math.round(emi).toLocaleString('en-IN')}** (approx. £${Math.round(emi / context.exchangeRate)}). This estimate excludes lender fees and moratorium interest; it is not a recorded payment due.`;
  }

  if (msg.includes('convert') || msg.includes('rate') || msg.includes('inr') || msg.includes('gbp') || msg.includes('pound')) {
    const parsed = parseCurrencyAmount(message);
    if (parsed) {
      const { amount, currency } = parsed;
      if (currency === 'GBP') {
        return `At **£1 = ₹${context.exchangeRate.toFixed(2)}**, **£${amount.toLocaleString('en-GB')}** equals **₹${(amount * context.exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}**.`;
      }
      return `At **£1 = ₹${context.exchangeRate.toFixed(2)}**, **₹${amount.toLocaleString('en-IN')}** equals **£${(amount / context.exchangeRate).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.`;
    }
    return `The current live conversion rate is **£1 = ₹${context.exchangeRate.toFixed(2)}**. You can query conversions like: "Convert £450 to INR" or "How much is ₹100,000 in GBP?".`;
  }

  if (msg.includes('calendar') || msg.includes('event') || msg.includes('due') || msg.includes('assign')) {
    if (context.upcomingEvents.length === 0) {
      return "You have no upcoming events registered in your calendar.";
    }
    const eventsStr = context.upcomingEvents.map((e: any) => `- **${e.title}** (${e.category}) on *${e.date}*`).join('\n');
    return `Here are your upcoming calendar events and deadlines:\n\n${eventsStr}`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help')) {
    return `Hello! I am your **UKOS AI Companion**. I can help you answer queries about your finances and studies, such as:
- *"How much did I spend on food this month?"*
- *"Convert £450 to INR"*
- *"Show me my loan status"*
- *"What assignments are due?"*

How can I help you with your UK MSc journey today?`;
  }

  return `I heard your request: "${message}". I can help track your expenses, convert currency, check loan progress, and list calendar events. Try asking something like: *"How much did I spend this month?"* or *"Convert £18,000 to INR"*.`;
}
