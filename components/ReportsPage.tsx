
import React, { useState } from 'react';
import { Device } from '../types';
import Calendar from './Calendar';
import { CalendarIcon } from './Icons';

interface ReportsPageProps {
    devices: Device[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ devices }) => {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [dateError, setDateError] = useState('');
    const [showCalendarFor, setShowCalendarFor] = useState<'start' | 'end' | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDateError('');

        if (!selectedDevice || !startDate || !endDate) {
            alert('Please select a device and a full date/time range.');
            return;
        }
        
        const startDateTime = new Date(startDate);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endDateTime = new Date(endDate);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);


        if (endDateTime <= startDateTime) {
            setDateError('End date and time must be after the start date and time.');
            return;
        }

        console.log({
            deviceId: selectedDevice,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
        });
        alert(`Generating report for ${selectedDevice}... (Check console for details)`);
    };
    
    const formatDateForDisplay = (date: Date | null): string => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">Generate Device Report</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Device Selector */}
                        <div>
                            <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Device
                            </label>
                            <select
                                id="device-select"
                                value={selectedDevice}
                                onChange={(e) => setSelectedDevice(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                                <option value="" disabled>Select a Device ID</option>
                                {devices.map(device => (
                                    <option key={device.id} value={device.id}>
                                        {device.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Date & Time Range Picker */}
                        <div className="relative">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date & Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date & Time
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCalendarFor(showCalendarFor === 'start' ? null : 'start')}
                                            className="flex-grow flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-left"
                                        >
                                            <span className={startDate ? 'text-gray-800' : 'text-gray-500'}>{formatDateForDisplay(startDate)}</span>
                                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        </button>
                                        <input 
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            disabled={!startDate}
                                            className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed w-32"
                                        />
                                    </div>
                                     {showCalendarFor === 'start' && (
                                        <div className="absolute top-full left-0 mt-2 z-10">
                                            <Calendar
                                                selectedDate={startDate}
                                                onSelect={(date) => { setStartDate(date); setShowCalendarFor(null); if (dateError) setDateError(''); }}
                                                onClose={() => setShowCalendarFor(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                                 {/* End Date & Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date & Time
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCalendarFor(showCalendarFor === 'end' ? null : 'end')}
                                            className="flex-grow flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-left"
                                        >
                                           <span className={endDate ? 'text-gray-800' : 'text-gray-500'}>{formatDateForDisplay(endDate)}</span>
                                           <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        </button>
                                        <input 
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            disabled={!endDate}
                                            className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed w-32"
                                        />
                                    </div>
                                    {showCalendarFor === 'end' && (
                                        <div className="absolute top-full right-0 mt-2 z-10">
                                            <Calendar
                                                selectedDate={endDate}
                                                onSelect={(date) => { setEndDate(date); setShowCalendarFor(null); if (dateError) setDateError(''); }}
                                                onClose={() => setShowCalendarFor(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 text-right">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                Generate Report
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ReportsPage;