
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface CalendarProps {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
    onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect, onClose }) => {
    const [displayDate, setDisplayDate] = useState(selectedDate || new Date());

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const calendarEl = document.getElementById('calendar-popup');
            if (calendarEl && !calendarEl.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [onClose]);

    const changeMonth = (amount: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };
    
    const changeYear = (amount: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(newDate.getFullYear() + amount);
            return newDate;
        });
    };

    const daysInMonth = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Add padding for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [displayDate]);

    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    return (
        <div id="calendar-popup" className="w-80 bg-gray-800 text-white rounded-lg shadow-2xl p-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">
                    {displayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={() => changeMonth(-1)} className="p-1 rounded-md hover:bg-gray-700"><ChevronUpIcon className="w-5 h-5 transform rotate-[-90deg]" /></button>
                     <button onClick={() => changeMonth(1)} className="p-1 rounded-md hover:bg-gray-700"><ChevronDownIcon className="w-5 h-5 transform rotate-[-90deg]" /></button>
                     <button onClick={() => changeYear(-1)} className="p-1 rounded-md hover:bg-gray-700"><ChevronUpIcon className="w-5 h-5" /></button>
                     <button onClick={() => changeYear(1)} className="p-1 rounded-md hover:bg-gray-700"><ChevronDownIcon className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => (
                    <div key={index} className="w-full h-10 flex justify-center items-center">
                        {day ? (
                            <button
                                onClick={() => onSelect(day)}
                                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                                    ${isSameDay(day, today) && !selectedDate ? 'border border-primary-500' : ''}
                                    ${selectedDate && isSameDay(day, selectedDate) ? 'bg-purple-500 text-white font-bold' : 'hover:bg-gray-700'}
                                `}
                            >
                                {day.getDate()}
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;

// Add this to your index.html or a global CSS file for the animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fade-in-up 0.2s ease-out forwards;
}
`;
document.head.appendChild(style);
