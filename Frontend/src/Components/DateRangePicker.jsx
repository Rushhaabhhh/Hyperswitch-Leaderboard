import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, isSameDay, isAfter, isBefore } from 'date-fns';

const DateRangePicker = ({ onConfirm, initialRange }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedStart, setSelectedStart] = useState(initialRange?.from);
  const [selectedEnd, setSelectedEnd] = useState(initialRange?.to);
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (date) => {
    if (!tempStart) {
      setTempStart(date);
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    if (isSameDay(date, tempStart)) return;

    if (isBefore(date, tempStart)) {
      setTempEnd(tempStart);
      setTempStart(date);
    } else {
      setTempEnd(date);
    }
  };

  const isDateInRange = (date) => tempStart && tempEnd && (
    (isAfter(date, tempStart) || isSameDay(date, tempStart)) &&
    (isBefore(date, tempEnd) || isSameDay(date, tempEnd))
  );

  const isStartOrEnd = (date) => isSameDay(date, tempStart) || isSameDay(date, tempEnd);

  const confirmRange = () => {
    if (tempStart && tempEnd) {
      setSelectedStart(tempStart);
      setSelectedEnd(tempEnd);
      onConfirm({ from: tempStart, to: tempEnd });
    }
  };

  const clearSelection = () => {
    setTempStart(null);
    setTempEnd(null);
  };

  const daysInMonth = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
  );
  const leadingBlanks = Array.from({ length: getFirstDayOfMonth(currentMonth) });

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl w-80">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-700 rounded">
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <span className="text-gray-200 font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-700 rounded">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-gray-400 text-sm">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-8" />
        ))}
        {daysInMonth.map(date => {
          const inRange = isDateInRange(date);
          const isBoundary = isStartOrEnd(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center transition-colors
                ${isBoundary ? 'bg-blue-600 text-white' : ''}
                ${inRange ? 'bg-blue-600/30 text-white' : ''}
                ${!isBoundary && !inRange ? 'text-gray-300 hover:bg-gray-700' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Range Feedback */}
      <div className="mt-4 space-y-2">
        {tempStart && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">
              Start Date: {format(tempStart, 'MMM d, yyyy')}
            </span>
            <button onClick={clearSelection} className="text-red-400 hover:text-red-300 text-sm">
              Clear
            </button>
          </div>
        )}

        {tempEnd && (
          <div className="text-sm text-gray-300">
            End Date: {format(tempEnd, 'MMM d, yyyy')}
          </div>
        )}

        {tempStart && tempEnd && (
          <button 
            onClick={confirmRange}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            Confirm Date Range
          </button>
        )}

        {!tempStart && (
          <div className="text-sm text-gray-400 text-center">
            Select a start date
          </div>
        )}

        {tempStart && !tempEnd && (
          <div className="text-sm text-gray-400 text-center">
            Now select an end date
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
