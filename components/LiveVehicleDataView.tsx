
import React, { useEffect, useState, useMemo } from 'react';
import { Device, TelemetryData, CANMessage, Message } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, WifiIcon, RefreshIcon, ActivityIcon, BotIcon, MapPinIcon } from './Icons';
import * as api from '../services/api';
import { parseDbc } from '../google-service/matrix-parser';
import { decodeMessages } from '../google-service/decoder';
import { defaultDbcContent } from '../google-service/default-matrix';
import GeminiAnalyst from './GeminiAnalyst';
import LiveMapDashboard from './LiveMapDashboard';

interface LiveVehicleDataViewProps {
  device: Device;
  devices: Device[];
  onBack: () => void;
}

const HeaderStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

const CanDataItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-start space-x-3">
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>
            <p className="text-sm text-gray-500 leading-tight">{value}</p>
        </div>
    </div>
);

const DecodedSignalItem: React.FC<{ name: string; value: number | string; unit?: string }> = ({ name, value, unit }) => (
    <div className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{name.replace(/_/g, ' ')}</span>
        <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-gray-800">{typeof value === 'number' ? value.toFixed(2) : value}</span>
            {unit && <span className="text-xs text-gray-400 font-medium">{unit}</span>}
        </div>
    </div>
);

const LiveVehicleDataView: React.FC<LiveVehicleDataViewProps> = ({ device, devices, onBack }) => {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [decodedMessages, setDecodedMessages] = useState<CANMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'map' | 'telemetry'>('map');

    const matrix = useMemo(() => parseDbc(defaultDbcContent), []);

    const fetchData = async () => {
        try {
            const telemetry = await api.fetchVehicleTelemetry(device.id);
            setData(telemetry);
            
            if (telemetry.rawMessages) {
                const decoded = decodeMessages(telemetry.rawMessages, matrix);
                
                // 1. Filter to only show messages successfully decoded by the DBC
                const decodedOnly = decoded.filter(msg => msg.decoded && Object.keys(msg.decoded).length > 0);
                
                // 2. Update the state by merging with existing messages
                setDecodedMessages(prevMessages => {
                    const latestMessagesMap = new Map<string, CANMessage>();
                    
                    // Add previous messages first (normalized IDs)
                    prevMessages.forEach(msg => {
                        const normalizedId = `0x${parseInt(msg.id, 16).toString(16)}`;
                        latestMessagesMap.set(normalizedId, msg);
                    });
                    
                    // Overwrite with new messages (normalized IDs)
                    decodedOnly.forEach(msg => {
                        const normalizedId = `0x${parseInt(msg.id, 16).toString(16)}`;
                        latestMessagesMap.set(normalizedId, msg);
                    });
                    
                    return Array.from(latestMessagesMap.values());
                });
            }

            setError(null);
        } catch (err: any) {
            setError("Failed to stream data. Connecting...");
            // Keep previous data if available to avoid flicker
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [device.id]);

    if (viewMode === 'map') {
        return (
            <div className="relative h-screen">
                <LiveMapDashboard 
                    devices={devices} 
                    initialDevice={device} 
                    onBack={onBack} 
                />
                <button 
                    onClick={() => setViewMode('telemetry')}
                    className="absolute top-20 right-6 z-[60] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-bold text-sm flex items-center gap-2"
                >
                    <ActivityIcon size={16} />
                    View CAN Telemetry
                </button>
            </div>
        );
    }

    return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        <span>Back to Device Details</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <button 
                        onClick={() => setViewMode('map')}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        <span>Back to Live Map</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div className="flex items-center text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <WifiIcon className="w-4 h-4 mr-2 animate-pulse" />
                        <span>Live Stream Active</span>
                    </div>
                 </div>
                 {error && <span className="text-red-500 text-sm animate-pulse">{error}</span>}
            </div>

            {loading && !data ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <RefreshIcon className="w-8 h-8 animate-spin mb-2 text-primary-600" />
                    <p>Establishing secure connection to vehicle...</p>
                </div>
            ) : data ? (
                <div className="bg-card p-6 rounded-lg shadow-sm border border-gray-200 space-y-8 animate-fade-in-up">
                    {/* --- Vehicle Details Header --- */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Vehicle Statistics</h2>
                            <span className="text-xs text-gray-400 font-mono">ID: {device.id}</span>
                        </div>
                        <div className="border border-orange-200 bg-orange-50/30 rounded-lg p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <HeaderStat label="Last Update" value={data.header?.time ? (data.header.time.split(',')[1] || data.header.time) : 'N/A'} />
                            <HeaderStat label="OBD Status" value={data.header?.obdStatus || 'N/A'} />
                            <HeaderStat label="Odometer" value={data.header?.odometer || 'N/A'} />
                            <HeaderStat label="Speed" value={data.header?.speed || 'N/A'} />
                            <HeaderStat label="Ignition" value={data.header?.ignition || 'N/A'} />
                        </div>
                    </div>

                    {/* --- CAN Details Grid --- */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Telemetry Messages (CAN Bus)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                            {data.details?.map((item, index) => (
                                <CanDataItem key={index} label={item.label} value={item.value} />
                            ))}
                        </div>
                    </div>

                    {/* --- DBC Decoded Signals --- */}
                    {decodedMessages.length > 0 && (
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <ActivityIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">DBC Decoded Real-time Signals</h2>
                                    <p className="text-xs text-gray-500">Decoded using vehicle-specific DBC matrix</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {decodedMessages.map((msg, msgIdx) => (
                                    <div key={msgIdx} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                                                {msg.name || "Unknown Message"}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400">DLC: {msg.dlc}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {msg.decoded && Object.entries(msg.decoded).map(([name, value], sigIdx) => {
                                                // Try to find unit from matrix
                                                const id = parseInt(msg.id, 16);
                                                const messageIdDecimal = (id > 0x7FF ? (id | 0x80000000) >>> 0 : id).toString();
                                                const unit = matrix[messageIdDecimal]?.signals[name]?.unit;
                                                return (
                                                    <DecodedSignalItem 
                                                        key={sigIdx} 
                                                        name={name} 
                                                        value={value} 
                                                        unit={unit} 
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- Gemini AI Analysis --- */}
                    {decodedMessages.length > 0 && (
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <BotIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">AI-Powered Fleet Insights</h2>
                                    <p className="text-xs text-gray-500">Ask Gemini to analyze the live CAN data and identify issues</p>
                                </div>
                            </div>
                            <GeminiAnalyst decodedMessages={decodedMessages} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Unable to load telemetry data.
                </div>
            )}
        </div>
    </main>
  );
};

export default LiveVehicleDataView;
