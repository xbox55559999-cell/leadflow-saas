import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { start: string; end: string }) => void;
}

const PRESETS = [
  { label: 'Сегодня', getValue: () => { const d = new Date(); return { start: d, end: d }; } },
  { label: 'Вчера', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { start: d, end: d }; } },
  { label: 'Неделя', getValue: () => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 6); return { start, end }; } },
  { label: 'Месяц', getValue: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 1); return { start, end }; } },
  { label: 'Квартал', getValue: () => { const end = new Date(); const start = new Date(); start.setMonth(start.getMonth() - 3); return { start, end }; } },
  { label: 'Год', getValue: () => { const end = new Date(); const start = new Date(); start.setFullYear(start.getFullYear() - 1); return { start, end }; } },
];

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const toLocalISOString = (date: Date | null) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(parseLocalDate(endDate) || new Date()));
  const [tempStart, setTempStart] = useState<Date | null>(parseLocalDate(startDate));
  const [tempEnd, setTempEnd] = useState<Date | null>(parseLocalDate(endDate));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen) {
      setTempStart(parseLocalDate(startDate));
      setTempEnd(parseLocalDate(endDate));
      const endD = parseLocalDate(endDate);
      setCurrentMonth(endD ? new Date(endD) : new Date());
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (tempStart && tempEnd) {
      const startStr = toLocalISOString(tempStart);
      const endStr = toLocalISOString(tempEnd);
      onChange({ start: startStr, end: endStr });
      setIsOpen(false);
    }
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    const { start, end } = preset.getValue();
    const startStr = toLocalISOString(start);
    const endStr = toLocalISOString(end);
    onChange({ start: startStr, end: endStr });
    setIsOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const renderCalendar = (monthOffset: number) => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + monthOffset);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6" />);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const isSelectedStart = tempStart && currentDate.getTime() === tempStart.getTime();
      const isSelectedEnd = tempEnd && currentDate.getTime() === tempEnd.getTime();
      
      let isInRange = false;
      if (tempStart && tempEnd) {
        isInRange = currentDate > tempStart && currentDate < tempEnd;
      } else if (tempStart && hoverDate) {
        isInRange = (currentDate > tempStart && currentDate <= hoverDate) || 
                    (currentDate < tempStart && currentDate >= hoverDate);
      }

      const isStartOrEnd = isSelectedStart || isSelectedEnd;
      
      days.push(
        <div
          key={i}
          className={`w-6 h-6 flex items-center justify-center text-[11px] cursor-pointer transition-colors relative
            ${isInRange ? 'bg-blue-50' : ''}
            ${isSelectedStart ? 'bg-blue-600 text-white rounded-l-md' : ''}
            ${isSelectedEnd ? 'bg-blue-600 text-white rounded-r-md' : ''}
            ${isStartOrEnd && tempStart?.getTime() === tempEnd?.getTime() ? 'rounded-md' : ''}
            ${!isStartOrEnd && !isInRange ? 'hover:bg-gray-100 rounded-md' : ''}
          `}
          onClick={() => {
            if (!tempStart || (tempStart && tempEnd)) {
              setTempStart(currentDate);
              setTempEnd(null);
            } else {
              if (currentDate < tempStart) {
                setTempEnd(tempStart);
                setTempStart(currentDate);
              } else {
                setTempEnd(currentDate);
              }
            }
          }}
          onMouseEnter={() => setHoverDate(currentDate)}
        >
          {i}
        </div>
      );
    }

    return (
      <div className="w-44">
        <div className="flex justify-between items-center mb-2 px-1">
          {monthOffset === 0 ? (
            <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); }} className="p-0.5 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-3 h-3" />
            </button>
          ) : <div className="w-4" />}
          <div className="font-bold text-[11px] text-gray-700">
            {MONTHS[month]} {year}
          </div>
          {monthOffset === 1 ? (
            <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); }} className="p-0.5 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : <div className="w-4" />}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 mb-1">
          {DAYS.map(day => (
            <div key={day} className="w-6 text-center text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days}
        </div>
      </div>
    );
  };

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    if (!d) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={toggleOpen}
        className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">{formatDateStr(startDate)} — {formatDateStr(endDate)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 lg:right-auto lg:left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row gap-4 w-[280px] md:w-auto">
          {/* Presets */}
          <div className="flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-3 overflow-x-auto scrollbar-hide">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-1.5 text-xs text-left hover:bg-gray-50 rounded-md whitespace-nowrap transition-colors text-gray-600 hover:text-blue-600 font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendars */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-6">
              {renderCalendar(0)}
              <div className="hidden xl:block">
                {renderCalendar(1)}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-100 mt-1 gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={toLocalISOString(tempStart)}
                  onChange={(e) => setTempStart(parseLocalDate(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-300">/</span>
                <input 
                  type="date" 
                  value={toLocalISOString(tempEnd)}
                  onChange={(e) => setTempEnd(parseLocalDate(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={handleApply}
                disabled={!tempStart || !tempEnd}
                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ОК
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
