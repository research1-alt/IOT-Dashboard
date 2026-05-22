
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { 
  Search, 
  RotateCcw,
  ChevronRight,
  MoreVertical,
  MapPin,
  Battery,
  Zap,
  Activity,
  AlertCircle,
  Navigation,
  Info,
  Truck
} from 'lucide-react';
import { Device, TelemetryData, CANMessage } from '../types';
import * as api from '../services/api';
import { parseDbc } from '../google-service/matrix-parser';
import { decodeMessages } from '../google-service/decoder';
import { defaultDbcContent } from '../google-service/default-matrix';

// --- Custom Marker Component ---
const VehicleMarker = ({ status, id }: { status: string, id: string }) => {
  const color = status === 'Driving' ? '#10b981' : status === 'Offline' ? '#ef4444' : '#f59e0b';
  return (
    <div className="relative flex flex-col items-center group">
      {/* Label */}
      <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
        {id}
      </div>
      
      {/* Ping Animation */}
      <div className="absolute w-12 h-12 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }}></div>
      
      {/* Vehicle Symbol */}
      <div className="relative w-10 h-10 rounded-xl border-2 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: color }}>
        <Truck className="text-white w-6 h-6" />
        
        {/* Direction Indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Navigation className="w-2.5 h-2.5 transform rotate-45" style={{ color: color }} />
        </div>
      </div>
      
      {/* Pointer */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5" style={{ borderTopColor: color }}></div>
    </div>
  );
};

interface LiveMapDashboardProps {
  devices: Device[];
  initialDevice: Device;
  onBack: () => void;
}

const LiveMapDashboard: React.FC<LiveMapDashboardProps> = ({ devices, initialDevice, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device>(initialDevice);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [decodedMessages, setDecodedMessages] = useState<CANMessage[]>([]);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const matrix = useMemo(() => parseDbc(defaultDbcContent), []);

  // Stats calculation
  const stats = useMemo(() => {
    const all = devices.length;
    const running = devices.filter(d => d.status === 'Driving').length;
    const idle = devices.filter(d => d.status === 'Idle').length;
    const offline = devices.filter(d => d.status === 'Offline').length;
    const charging = devices.filter(d => d.status === 'Charging').length;
    const missingGps = devices.filter(d => 
      !d.location || 
      d.location === 'N/A' || 
      d.location === '0.000000, 0.000000'
    ).length;

    return [
      { label: 'All', count: all, color: 'bg-blue-500', textColor: 'text-blue-500' },
      { label: 'Running', count: running, color: 'bg-green-500', textColor: 'text-green-500' },
      { label: 'Idle', count: idle, color: 'bg-orange-500', textColor: 'text-orange-500' },
      { label: 'Offline', count: offline, color: 'bg-red-500', textColor: 'text-red-500' },
      { label: 'Charging', count: charging, color: 'bg-orange-400', textColor: 'text-orange-400' },
      { label: 'Missing GPS', count: missingGps, color: 'bg-red-600', textColor: 'text-red-600', isBox: true },
    ];
  }, [devices]);

  // Fetch telemetry for the selected device
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching telemetry for device:", selectedDevice.id);
        const data = await api.fetchVehicleTelemetry(selectedDevice.id);
        console.log("Telemetry data received:", data);
        setTelemetry(data);

        if (data.rawMessages) {
          console.log("Decoding raw messages:", data.rawMessages);
          const decoded = decodeMessages(data.rawMessages, matrix);
          console.log("Decoded messages:", decoded);
          
          // Filter to only show messages successfully decoded by the DBC
          const decodedOnly = decoded.filter(msg => msg.decoded && Object.keys(msg.decoded).length > 0);
          console.log("Decoded messages (filtered):", decodedOnly);
          
          // Update the state by merging with existing messages
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
        } else {
          console.warn("No rawMessages found in telemetry data.");
        }
      } catch (error) {
        console.error("Failed to fetch telemetry:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [selectedDevice.id, matrix]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.fetchVehicleTelemetry(selectedDevice.id);
      setTelemetry(data);
    } catch (error) {
      console.error("Failed to refresh telemetry:", error);
    }
    setIsRefreshing(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const match = devices.find(d => d.id.toLowerCase() === searchQuery.toLowerCase().trim());
      if (match) {
        setSelectedDevice(match);
        setSearchQuery('');
      } else {
        const partialMatch = devices.find(d => d.id.toLowerCase().includes(searchQuery.toLowerCase().trim()));
        if (partialMatch) {
          setSelectedDevice(partialMatch);
          setSearchQuery('');
        }
      }
    }
  };

  const filteredDevices = devices.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const vehiclePos = typeof telemetry?.header?.latitude === 'number' && typeof telemetry?.header?.longitude === 'number'
    ? { lat: telemetry.header.latitude, lng: telemetry.header.longitude } 
    : null;

  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.");
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* --- Top Stats Bar --- */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center space-x-2">
              {stat.isBox ? (
                <div className={`${stat.color} text-white px-2 py-0.5 rounded text-xs font-bold`}>
                  {stat.count}
                </div>
              ) : (
                <div className={`text-lg font-bold ${stat.textColor}`}>{stat.count}</div>
              )}
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* --- Search & Refresh Bar --- */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="relative w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search for VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={() => handleSearchKeyDown({ key: 'Enter' } as any)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            Select
          </button>
        </div>
        <button 
          onClick={handleRefresh}
          className={`flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
        >
          <RotateCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative bg-slate-200">
          {!vehiclePos && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
              <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 max-w-md text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">No GPS Fix Detected</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    We are receiving data from <strong>{selectedDevice.id}</strong>, but it does not contain valid GPS coordinates (Latitude/Longitude).
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Troubleshooting</p>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Ensure the vehicle is in an open area with clear sky view.</li>
                    <li>Check if the GPS antenna is connected to the telematics unit.</li>
                    <li>Verify that the CAN signals <strong>Latitude</strong> and <strong>Longitude</strong> are present in your .trc file.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <APIProvider apiKey={apiKey}>
            <GoogleMap
              center={vehiclePos || defaultCenter}
              zoom={vehiclePos ? 14 : 12}
              disableDefaultUI={false}
              mapId="fleet_live_tracking_map"
              className="w-full h-full"
            >
              {vehiclePos && (
                <AdvancedMarker 
                  position={vehiclePos} 
                  onClick={() => setInfoWindowShown(true)}
                >
                  <VehicleMarker status={selectedDevice.status} id={selectedDevice.id} />
                </AdvancedMarker>
              )}

              {infoWindowShown && vehiclePos && (
                <InfoWindow 
                  position={vehiclePos} 
                  onCloseClick={() => setInfoWindowShown(false)}
                >
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{selectedDevice.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedDevice.status === 'Driving' ? 'bg-green-100 text-green-700' : 
                        selectedDevice.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="font-semibold text-slate-900">{telemetry?.header?.speed || '0 km/h'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Battery:</span>
                        <span className="font-semibold text-slate-900">
                          {(() => {
                            const socMsg = decodedMessages.find(m => m.decoded?.State_of_Charger_SOC !== undefined);
                            console.log("Debug: All decoded messages:", decodedMessages);
                            console.log("Debug: Found SOC message:", socMsg);
                            const socValue = socMsg ? (socMsg.decoded?.State_of_Charger_SOC as number) : 0;
                            console.log("Debug: SOC value:", socValue);
                            return `${socValue}%`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ignition:</span>
                        <span className="font-semibold text-green-600 uppercase">{telemetry?.header?.ignition || 'OFF'}</span>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>

          {/* Floating Map Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-1 flex flex-col">
              <button className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors">
                <MapPin size={20} />
              </button>
              <button className="p-2 hover:bg-slate-50 text-slate-600 rounded-md transition-colors">
                <Activity size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle List Section */}
        <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Vehicle List</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredDevices.length} Vehicles</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">VIN</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SoC (%)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => (
                  <tr 
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${selectedDevice.id === device.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{device.id}</span>
                        <span className={`text-[10px] font-medium ${
                          device.status === 'Driving' ? 'text-green-500' : 
                          device.status === 'Offline' ? 'text-red-400' : 'text-orange-400'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          {(() => {
                            const socMsg = decodedMessages.find(m => m.decoded?.State_of_Charger_SOC !== undefined);
                            const socValue = socMsg ? (socMsg.decoded?.State_of_Charger_SOC as number) : 0;
                            return (
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${socValue}%` }}></div>
                            );
                          })()}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {(() => {
                            const socMsg = decodedMessages.find(m => m.decoded?.State_of_Charger_SOC !== undefined);
                            const socValue = socMsg ? (socMsg.decoded?.State_of_Charger_SOC as number) : 0;
                            return `${socValue}%`;
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-colors" title="View Details">
                          <ChevronRight size={18} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-md transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Vehicle Quick Info Footer */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedDevice.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="p-6 bg-slate-900 text-white max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900 pb-2 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{selectedDevice.id}</h4>
                    <p className="text-[10px] text-slate-400">Last updated: {telemetry?.header?.time || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                  {(() => {
                    const socMsg = decodedMessages.find(m => m.decoded?.State_of_Charger_SOC !== undefined);
                    const socValue = socMsg ? (socMsg.decoded?.State_of_Charger_SOC as number) : null;
                    return socValue !== null ? `${socValue.toFixed(0)}%` : 'N/A';
                  })()}
                </div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Battery</div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Vehicle Specifications</h5>
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">VIN / ID</p>
                    <p className="text-xs font-bold text-slate-200">{selectedDevice.id}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Model</p>
                    <p className="text-xs font-bold text-slate-200">{selectedDevice.vehicleModel || 'Omega Seiki M1KA'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Reg. No</p>
                    <p className="text-xs font-bold text-slate-200">{selectedDevice.registrationNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Fleet</p>
                    <p className="text-xs font-bold text-slate-200">{selectedDevice.fleet || 'Default Fleet'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live CAN Signals</h5>
                
                {telemetry?.error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">System Error</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{telemetry.error}</p>
                      <p className="text-[10px] text-slate-500 mt-2 italic">Tip: Ensure the file name in Drive matches the Device ID exactly (e.g. {selectedDevice.id}.trc)</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {!telemetry ? (
                    <div className="col-span-2 py-8 flex flex-col items-center justify-center space-y-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fetching Live Data...</p>
                    </div>
                  ) : (telemetry.details && telemetry.details.length > 0) || decodedMessages.length > 0 ? (
                    <>
                      {/* Standard Telemetry Details */}
                      {telemetry.details?.map((item, idx) => (
                        <div key={`det-${idx}`} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                          <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 truncate" title={item.label}>{item.label}</p>
                          <p className="text-xs font-bold text-blue-400">{item.value}</p>
                        </div>
                      ))}
                      
                      {/* DBC Decoded Signals */}
                      {(() => {
                        const allSignals: { name: string, value: number | string, unit?: string, id: string }[] = [];
                        decodedMessages.forEach(msg => {
                          if (msg.decoded) {
                            const id = parseInt(msg.id, 16);
                            const messageIdDecimal = (id > 0x7FF ? (id | 0x80000000) >>> 0 : id).toString();
                            Object.entries(msg.decoded).forEach(([name, value]) => {
                              const unit = matrix[messageIdDecimal]?.signals[name]?.unit;
                              allSignals.push({ name, value: value as number | string, unit, id: msg.id });
                            });
                          }
                        });
                        
                        return allSignals.sort((a, b) => a.name.localeCompare(b.name)).map((sig, idx) => (
                          <div key={`sig-${sig.id}-${idx}`} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 truncate" title={sig.name.replace(/_/g, ' ')}>
                              {sig.name.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs font-bold text-emerald-400">
                              {typeof sig.value === 'number' ? sig.value.toFixed(2) : sig.value}
                              {sig.unit && <span className="text-[8px] ml-1 opacity-60">{sig.unit}</span>}
                            </p>
                          </div>
                        ));
                      })()}
                    </>
                  ) : (
                    <div className="col-span-2 py-4 text-center text-slate-500 text-xs italic">
                      No live CAN data available
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Location Details</h5>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Current Coordinates</p>
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {(!telemetry?.header?.latitude && !telemetry?.header?.longitude) 
                        ? 'Waiting for GPS...' 
                        : `${telemetry?.header?.latitude?.toFixed(6)}, ${telemetry?.header?.longitude?.toFixed(6)}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Vehicle Status</h5>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-white/10 pt-4">
                  {/* Vehicle Details */}
                  <div className="col-span-2 space-y-1 mb-2">
                    <p className="text-[10px] text-slate-400">Device ID: <span className="text-blue-400 font-bold">{selectedDevice.id}</span></p>
                    <p className="text-[10px] text-slate-400">Owner Name: <span className="text-blue-400 font-bold">{selectedDevice.ownerName || 'N/A'}</span></p>
                    <p className="text-[10px] text-slate-400">Vehicle Chassis No.: <span className="text-blue-400 font-bold">{selectedDevice.chassisNo || 'N/A'}</span></p>
                  </div>

                  {/* Standard Status Fields */}
                  <div className="text-center bg-white/5 p-2 rounded">
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">SoC</p>
                    <p className="text-xs font-bold text-blue-400">{telemetry?.header?.battery || selectedDevice.soc || 'N/A'}</p>
                  </div>
                  <div className="text-center bg-white/5 p-2 rounded">
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Odometer</p>
                    <p className="text-xs font-bold text-blue-400">{telemetry?.header?.odometer || 'N/A'}</p>
                  </div>
                  <div className="text-center bg-white/5 p-2 rounded">
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Speed</p>
                    <p className="text-xs font-bold text-blue-400">{telemetry?.header?.speed || '0 km/h'}</p>
                  </div>
                  <div className="text-center bg-white/5 p-2 rounded">
                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Ignition</p>
                    <p className={`text-xs font-bold ${telemetry?.header?.ignition?.toLowerCase() === 'on' ? 'text-green-400' : 'text-red-400'}`}>
                      {telemetry?.header?.ignition || 'OFF'}
                    </p>
                  </div>

                  {/* All Decoded Signals */}
                  {(() => {
                    const allSignals: { name: string, value: number | string, unit?: string }[] = [];
                    decodedMessages.forEach(msg => {
                      if (msg.decoded) {
                        const id = parseInt(msg.id, 16);
                        const messageIdDecimal = (id > 0x7FF ? (id | 0x80000000) >>> 0 : id).toString();
                        Object.entries(msg.decoded).forEach(([name, value]) => {
                          const unit = matrix[messageIdDecimal]?.signals[name]?.unit;
                          allSignals.push({ name, value: value as number | string, unit });
                        });
                      }
                    });
                    
                    // Filter to unique signals to avoid duplicates if multiple messages have same signal
                    const uniqueSignals: { name: string, value: number | string, unit?: string }[] = Array.from(new Map(allSignals.map(s => [s.name, s])).values());

                    return uniqueSignals.sort((a, b) => a.name.localeCompare(b.name)).map((sig, idx) => (
                      <div key={`status-sig-${idx}`} className="text-center bg-white/5 p-2 rounded">
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 truncate" title={sig.name.replace(/_/g, ' ')}>
                          {sig.name.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs font-bold text-emerald-400">
                          {typeof sig.value === 'number' ? sig.value.toFixed(1) : sig.value}
                          {sig.unit && <span className="text-[8px] ml-1 opacity-60">{sig.unit}</span>}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LiveMapDashboard;
