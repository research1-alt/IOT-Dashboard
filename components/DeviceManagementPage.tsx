
import React, { useState } from 'react';
import { Device } from '../types';
import { CheckCircleIcon } from './Icons';

// --- PROPS INTERFACE ---
interface DeviceManagementPageProps {
    devices: Device[];
    onAddDevice: (deviceId: string) => void;
    onAttachLog: (deviceId: string, content: string) => void;
}

// --- TYPE DEFINITIONS & CONSTANTS ---
const statusColors: { [key in Device['status']]: string } = {
    'Driving': 'bg-green-100 text-green-800', 'Parked': 'bg-blue-100 text-blue-800', 'Offline': 'bg-gray-200 text-gray-800', 'Maintenance': 'bg-yellow-100 text-yellow-800',
};
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// --- MAIN COMPONENT ---
const DeviceManagementPage: React.FC<DeviceManagementPageProps> = ({ devices, onAddDevice, onAttachLog }) => {
    // --- STATE MANAGEMENT ---
    const [newDeviceId, setNewDeviceId] = useState('');
    const [deviceError, setDeviceError] = useState('');
    
    // --- EVENT HANDLERS ---
    const handleAddDeviceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeviceId.trim()) { setDeviceError('Device ID cannot be empty.'); return; }
        if (devices.some(d => d.id === newDeviceId.trim())) { setDeviceError('This Device ID already exists.'); return; }
        onAddDevice(newDeviceId.trim());
        setNewDeviceId(''); setDeviceError('');
    };

    const handleLogFileUpload = (e: React.ChangeEvent<HTMLInputElement>, deviceId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
            const limitInMB = (MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0);
            alert(`File is too large (${sizeInMB} MB). Maximum size is ${limitInMB} MB.`);
            e.target.value = ''; // Reset file input
            return;
        }

        if (!file.name.toLowerCase().endsWith('.trc')) {
            alert('Please upload a valid CAN log file (.trc)');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                onAttachLog(deviceId, content);
            }
        };
        reader.onerror = () => {
             alert('Error reading the log file.');
        }
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    // --- RENDER ---
    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8">
            {/* SECTION: Add Device */}
            <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Add Device</h3>
                <div className="mt-4">
                    <form onSubmit={handleAddDeviceSubmit} className="flex flex-col sm:flex-row items-start gap-2 max-w-lg">
                        <div className="w-full">
                            <label htmlFor="deviceId" className="sr-only">Device ID</label>
                            <input id="deviceId" type="text" value={newDeviceId} onChange={(e) => { setNewDeviceId(e.target.value); if(deviceError) setDeviceError(''); }} placeholder="Enter new Device ID" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${deviceError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-primary-500'}`} />
                            {deviceError && <p className="text-red-500 text-sm mt-1">{deviceError}</p>}
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors flex-shrink-0">Add Device</button>
                    </form>
                </div>
            </div>

            {/* SECTION: Device List */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">Registered Devices ({devices.length})</h3>
                </div>
                <div className="overflow-auto max-h-[calc(100vh-480px)]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAN Log File</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {devices.length > 0 ? devices.map((device) => (
                            <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[device.status]}`}>{device.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {device.logFileContent ? (
                                        <div className="flex items-center space-x-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">Log Attached</span>
                                            <label className="text-primary-600 hover:text-primary-800 text-xs font-medium cursor-pointer">
                                                Replace
                                                <input type="file" className="sr-only" accept=".trc" onChange={(e) => handleLogFileUpload(e, device.id)} />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300 cursor-pointer">
                                            Upload Log
                                            <input type="file" className="sr-only" accept=".trc" onChange={(e) => handleLogFileUpload(e, device.id)} />
                                        </label>
                                    )}
                                </td>
                            </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-10 text-gray-500">No devices registered yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default DeviceManagementPage;
