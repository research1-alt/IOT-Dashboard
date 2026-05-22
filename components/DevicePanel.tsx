import React, { useState } from 'react';
import { Device } from '../types';
import { SearchIcon, MapPinIcon, DeviceIcon } from './Icons';

const statusColors = {
    'Driving': 'bg-emerald-500',
    'Parked': 'bg-blue-500',
    'Offline': 'bg-slate-300',
    'Maintenance': 'bg-amber-500',
    'Stored': 'bg-indigo-500',
};

const DeviceItem: React.FC<{ device: Device; onSelect: (device: Device) => void }> = ({ device, onSelect }) => (
    <button 
        onClick={() => onSelect(device)} 
        className="w-full text-left p-6 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
    >
        <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col">
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{device.id}</p>
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <MapPinIcon className="w-3 h-3 mr-1"/>
                    <span className="truncate max-w-[120px]">{device.location}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{device.status}</span>
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${statusColors[device.status]} ${device.status === 'Driving' ? 'animate-pulse' : ''}`}></div>
                </div>
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            {device.speed && (
                <div className="flex items-center bg-blue-50 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600">
                    <span className="mr-1">⚡</span>
                    <span>{device.speed}</span>
                </div>
            )}
            {(device.battery || device.soc) && (
                <div className="flex items-center bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600">
                    <span className="mr-1">🔋</span>
                    <span>{device.battery || device.soc}{!String(device.battery || device.soc).includes('%') ? '%' : ''}</span>
                </div>
            )}
            <div className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-bold ${device.ignition === 'On' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <span className="mr-1">{device.ignition === 'On' ? '🟢' : '🔴'}</span>
                <span>Vehicle {device.ignition === 'On' ? 'On' : 'Off'}</span>
            </div>
        </div>
    </button>
);

interface DevicePanelProps {
    devices: Device[];
    onSelectDevice: (device: Device) => void;
}

const DevicePanel: React.FC<DevicePanelProps> = ({ devices, onSelectDevice }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDevices = devices.filter(device => 
        device.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="relative group">
                     <input 
                        type="text" 
                        placeholder="Search device ID..." 
                        className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full text-sm text-slate-700 placeholder:text-slate-400 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {devices.length > 0 ? (
                    filteredDevices.length > 0 ? (
                        filteredDevices.map(device => <DeviceItem key={device.id} device={device} onSelect={onSelectDevice} />)
                    ) : (
                        <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                <SearchIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">No results found</p>
                            <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                        </div>
                    )
                ) : (
                    <div className="p-10 text-center h-full flex flex-col justify-center items-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                            <DeviceIcon className="w-10 h-10 text-slate-300" />
                         </div>
                         <p className="font-black text-slate-900 uppercase tracking-tight">No Devices Assigned</p>
                         <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">Your administrator has not assigned any devices to your profile yet.</p>
                    </div>
                )}
            </div>
             <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filteredDevices.length} of {devices.length} devices
                </p>
            </div>
        </div>
    );
};

export default DevicePanel;