import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  DollarSign 
} from 'lucide-react';
import { CalendarEvent } from '@/lib/mockData';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onAddEvent: (title: string, date: string, category: CalendarEvent['category'], description?: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  // Let's set the initial date to June 2026 (based on current time metadata)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 11)); // June 11, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 5, 11));
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<CalendarEvent['category']>('University');
  const [eventDesc, setEventDesc] = useState('');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday

  // Calendar cells padding
  const calendarCells = useMemo(() => {
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; dateObj: Date }[] = [];
    
    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYearIdx = month === 0 ? year - 1 : year;
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const d = new Date(prevYearIdx, prevMonthIdx, day);
      cells.push({
        dateStr: `${prevYearIdx}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayNum: day,
        isCurrentMonth: false,
        dateObj: d
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i)
      });
    }

    // Next month padding (to complete 42 cells grid)
    const remaining = 42 - cells.length;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYearIdx = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dateStr: `${nextYearIdx}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(nextYearIdx, nextMonthIdx, i)
      });
    }

    return cells;
  }, [year, month, firstDayIndex, daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formattedSelectedDate = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Selected day's events
  const dayEvents = useMemo(() => {
    return events.filter(e => e.date === formattedSelectedDate);
  }, [events, formattedSelectedDate]);

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventTitle.trim()) {
      await onAddEvent(
        eventTitle.trim(),
        formattedSelectedDate,
        eventCategory,
        eventDesc.trim() || undefined
      );
      setEventTitle('');
      setEventDesc('');
      setIsAddOpen(false);
    }
  };

  const getCategoryColor = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Urgent': return 'bg-rose-500 text-white border-rose-600/30';
      case 'Completed': return 'bg-emerald-500 text-white border-emerald-600/30';
      case 'University': return 'bg-blue-500 text-white border-blue-600/30';
      case 'Finance': return 'bg-amber-500 text-zinc-900 border-amber-600/30';
      default: return 'bg-zinc-600 text-white border-zinc-700/30';
    }
  };

  const getCategoryIcon = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Urgent': return <AlertTriangle className="h-3 w-3 text-rose-400" />;
      case 'Completed': return <CheckCircle className="h-3 w-3 text-emerald-400" />;
      case 'University': return <BookOpen className="h-3 w-3 text-blue-400" />;
      case 'Finance': return <DollarSign className="h-3 w-3 text-amber-400" />;
      default: return null;
    }
  };

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>UK Academic & Life Calendar</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">Deadlines, part-time shifts and EMI trackers</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add Event
        </button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Month Selector header */}
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl p-2">
          <button 
            onClick={handlePrevMonth} 
            className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-wider">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth} 
            className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <span key={d} className="text-[10px] uppercase font-bold text-zinc-500 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const hasEvents = events.some(e => e.date === cell.dateStr);
            const isSelected = selectedDate.getDate() === cell.dateObj.getDate() && 
                             selectedDate.getMonth() === cell.dateObj.getMonth() &&
                             selectedDate.getFullYear() === cell.dateObj.getFullYear();
            
            const cellEvents = events.filter(e => e.date === cell.dateStr);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.dateObj)}
                className={`relative min-h-[46px] p-1.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  cell.isCurrentMonth ? 'border-zinc-200/60 dark:border-white/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/30' : 'border-transparent opacity-30 hover:opacity-50'
                } ${
                  isSelected ? 'bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-500/50 hover:border-indigo-500/80' : 'bg-zinc-50 dark:bg-zinc-950/20'
                }`}
              >
                {/* Day Number */}
                <span className={`text-[10px] font-bold ${
                  isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 dark:text-zinc-400'
                }`}>
                  {cell.dayNum}
                </span>

                {/* Event indicators */}
                <div className="flex gap-0.5 mt-1 overflow-hidden h-1.5">
                  {cellEvents.slice(0, 3).map((e) => {
                    let dotColor = 'bg-zinc-500';
                    if (e.category === 'Urgent') dotColor = 'bg-rose-500 shadow-[0_0_4px_#ef4444]';
                    if (e.category === 'Completed') dotColor = 'bg-emerald-500 shadow-[0_0_4px_#10b981]';
                    if (e.category === 'University') dotColor = 'bg-blue-500 shadow-[0_0_4px_#3b82f6]';
                    if (e.category === 'Finance') dotColor = 'bg-amber-500 shadow-[0_0_4px_#f59e0b]';
                    return (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected date events list */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-3.5 space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">
              Schedule: {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">{dayEvents.length} Tasks</span>
          </div>

          <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-850">
            {dayEvents.length === 0 ? (
              <div className="text-center text-xs text-zinc-500 py-6">No events scheduled.</div>
            ) : (
              dayEvents.map((e) => (
                <div key={e.id} className="flex justify-between items-start p-2.5 rounded-xl bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 group duration-200 hover:border-indigo-500/20">
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded border ${getCategoryColor(e.category)}`}>
                        {e.category}
                      </span>
                      <h5 className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight">{e.title}</h5>
                    </div>
                    {e.description && (
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal pl-0.5">{e.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteEvent(e.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      {/* MODAL: Log event */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={`Add event on ${formattedSelectedDate}`}>
        <form onSubmit={handleAddEventSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Event Title</label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. AI Assignment Submission, Rent Payment"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category / Status</label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="University">University (Blue)</option>
              <option value="Urgent">Urgent (Red)</option>
              <option value="Completed">Completed (Green)</option>
              <option value="Finance">Finance (Yellow)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description (Optional)</label>
            <textarea
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Add details about room number, link, or notes..."
              rows={3}
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Log Event Schedule
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
