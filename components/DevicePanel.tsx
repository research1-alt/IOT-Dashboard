
import React, { useState } from 'react';
import { Device } from '../types';
import { SearchIcon, MapPinIcon, DeviceIcon } from './Icons';

const statusColors = {
    'Driving': 'bg-green-500',
    'Parked': 'bg-blue-500',
    'Offline': 'bg-gray-400',
    'Maintenance': 'bg-yellow-500',
};

const DeviceItem: React.FC<{ device: Device }> = ({ device }) => (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
        <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-gray-800">{device.id}</p>
            <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">{device.status}</span>
                <div className={`w-3 h-3 rounded-full ${statusColors[device.status]}`}></div>
            </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-2">
            <MapPinIcon className="w-4 h-4 mr-1"/>
            <span>{device.location}</span>
        </div>
    </div>
);

interface DevicePanelProps {
    devices: Device[];
}

const DevicePanel: React.FC<DevicePanelProps> = ({ devices }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDevices = devices.filter(device => 
        device.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-card rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-3">Devices</h3>
                <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Search device..." 
                        className="bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                 {devices.length > 0 ? (
                    filteredDevices.length > 0 ? (
                        filteredDevices.map(device => <DeviceItem key={device.id} device={device} />)
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <p>No devices match your search.</p>
                        </div>
                    )
                ) : (
                    <div className="p-6 text-center text-gray-500 h-full flex flex-col justify-center items-center">
                         <DeviceIcon className="w-12 h-12 text-gray-300 mb-2" />
                         <p className="font-semibold">No Devices Assigned</p>
                         <p className="text-sm mt-1 max-w-xs">Your administrator has not assigned any devices to your profile yet.</p>
                    </div>
                )}
            </div>
             <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                Showing {filteredDevices.length} of {devices.length} devices
            </div>
        </div>
    );
};

export default DevicePanel;
