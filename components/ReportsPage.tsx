

import React, { useState } from 'react';
import { Device } from '../types';

interface ReportsPageProps {
    devices: Device[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ devices }) => {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateError, setDateError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDateError('');

        if (!selectedDevice || !startDate || !endDate) {
            alert('Please fill in all fields.');
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            setDateError('End date must be after the start date.');
            return;
        }

        console.log({
            deviceId: selectedDevice,
            startTime: startDate,
            endTime: endDate,
        });
        alert(`Generating report for ${selectedDevice}... (Check console for details)`);
    };

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
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
                        
                        {/* Date Range Picker */}
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="start-date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            if (dateError) setDateError('');
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="end-date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            if (dateError) setDateError('');
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                    />
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
