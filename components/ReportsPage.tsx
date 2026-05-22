import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Download, 
  FileCode, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Device } from '../types';
import * as api from '../services/api';
import { DBCDecoder } from '../services/dbcDecoder';

// DBC Content based on user's provided signals and IDs
const DBC_CONTENT = `
BO_ 272170832 BattError: 8 BMS
 SG_ DTC_Count : 0|8@1+ (1,0) [0|255] "" MCU

BO_ 271061072 Batt_Live_Status: 8 BMS
 SG_ Battery_Live_Current_Amp : 0|16@1- (0.1,0) [-3276.8|3276.7] "A" MCU
 SG_ Battery_Live_Voltage_Volt : 16|16@1+ (0.01,0) [0|655.35] "V" MCU
 SG_ Battery_SOC_pct : 32|8@1+ (0.4,0) [0|100] "%" MCU
 SG_ Battery_Temp_Max_degC : 40|8@1+ (1,-40) [-40|215] "C" MCU
 SG_ Key_On_Indicator : 56|1@1+ (1,0) [0|1] "" MCU

VAL_ 271061072 Key_On_Indicator 0 "Off" 1 "On" ;

BO_ 419365728 BMS_Status: 8 BMS
 SG_ Battery_Capacity_Left_Ah_Ah : 0|16@1+ (0.1,0) [0|6553.5] "Ah" MCU
 SG_ Battery_Capacity_Total_Ah_Ah : 16|16@1+ (0.1,0) [0|6553.5] "Ah" MCU

BO_ 337854544 MCU_Status: 8 MCU
 SG_ MCU_Motor_Speed_rpm : 0|16@1- (1,0) [-32768|32767] "rpm" VCU
 SG_ MCU_Motor_Temp_degC : 16|8@1+ (1,-40) [-40|215] "C" VCU
 SG_ MCU_Inverter_Temp_degC : 24|8@1+ (1,-40) [-40|215] "C" VCU
 SG_ MCU_Precharge_Status_raw : 32|4@1+ (1,0) [0|15] "" VCU
 SG_ MCU_Ignition_Status_raw : 36|4@1+ (1,0) [0|15] "" VCU

BO_ 337920080 MCU_Config: 8 MCU
 SG_ MCU_Precharge_Voltage_Volt : 0|16@1+ (0.1,0) [0|6553.5] "V" VCU
 SG_ MCU_Capacitor_Voltage_Volt : 16|16@1+ (0.1,0) [0|6553.5] "V" VCU
 SG_ MCU_Capacitor_Current_Amp : 32|16@1- (0.1,0) [-3276.8|3276.7] "A" VCU

BO_ 338624400 VCU_Status: 8 VCU
 SG_ Vehicle_Speed_kmh : 0|16@1+ (0.1,0) [0|6553.5] "km/h" HMI
 SG_ Accelerator_Pedal_Pos_pct : 16|8@1+ (1,0) [0|100] "%" HMI
 SG_ Brake_Pedal_Pos_pct : 24|8@1+ (1,0) [0|100] "%" HMI
 SG_ Gear_Position_raw : 32|4@1+ (1,0) [0|15] "" HMI
 SG_ Hill_Hold_Flag_raw : 36|1@1+ (1,0) [0|1] "" HMI

BO_ 419365722 GPS_Status: 8 GPS
 SG_ Latitude : 0|32@1- (0.0000001,0) [-90|90] "deg" IOT
 SG_ Longitude : 32|32@1- (0.0000001,0) [-180|180] "deg" IOT
 SG_ GPS_Latitude : 0|32@1- (0.0000001,0) [-90|90] "deg" IOT
 SG_ GPS_Longitude : 32|32@1- (0.0000001,0) [-180|180] "deg" IOT

BO_ 419368538 TRC_Data_1: 8 BMS
 SG_ TRC_Signal_1 : 0|16@1+ (1,0) [0|65535] "" MCU

BO_ 419368794 TRC_Data_2: 8 BMS
 SG_ TRC_Signal_2 : 0|16@1+ (1,0) [0|65535] "" MCU

BO_ 419369050 TRC_Data_3: 8 BMS
 SG_ TRC_Signal_3 : 0|16@1+ (1,0) [0|65535] "" MCU

BO_ 419369306 TRC_Data_4: 8 BMS
 SG_ TRC_Signal_4 : 0|16@1+ (1,0) [0|65535] "" MCU
`;

const decoder = new DBCDecoder(DBC_CONTENT);

interface ReportsPageProps {
  devices: Device[];
}

interface ReportFile {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'raw' | 'decoded';
  content: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ devices }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    files: ReportFile[];
    isMock?: boolean;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'decoded'>('decoded');
  const [selectedFile, setSelectedFile] = useState<ReportFile | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const cleanQuery = searchQuery.toLowerCase().replace('.trc', '').trim();
    return devices.filter(d => 
      d.id.toLowerCase().includes(cleanQuery)
    ).slice(0, 5);
  }, [searchQuery, devices]);

  const handleDeviceSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(true);
    const cleanQuery = query.toLowerCase().replace('.trc', '').trim();
    const found = devices.find(d => d.id.toLowerCase() === cleanQuery);
    if (found) {
      setSelectedDevice(found);
    } else {
      setSelectedDevice(null);
    }
  };

  const selectSuggestion = (device: Device) => {
    setSearchQuery(device.id);
    setSelectedDevice(device);
    setShowSuggestions(false);
  };

  const formatLocalTimestamp = (date: Date): string => {
    const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  };

  const generateMockData = (deviceId: string, start: string, end: string, startTime: string, endTime: string, limit: number = 1000000) => {
    const header = [
      `; Telematics Trace File`,
      `; Generated: ${formatLocalTimestamp(new Date())}`,
      `; Vehicle ID: ${deviceId}`,
      `; Range: ${start} ${startTime} to ${end} ${endTime}`,
      `;-------------------------------------------------------------------------------------------------------------------`,
      `; Index) Timestamp (ms)        ID (hex) DLC Data Bytes (hex)         Cycle   Lat                  Lng`,
      `;-------------------------------------------------------------------------------------------------------------------`
    ];
    const rows = [];
    
    const startDateTime = new Date(`${start}T${startTime}`);
    const endDateTime = new Date(`${end}T${endTime}`);
    
    const canIds = ["18FF0E5A", "18FF0F5A", "18FF105A", "18FF115A", "10281050", "1038FF50", "14234050", "14244050"];

    const lastTsMap = new Map<string, number>();
    const interval = 10; 
    const totalDurationMs = endDateTime.getTime() - startDateTime.getTime();
    
    const rowsNeeded = Math.floor(totalDurationMs / interval);
    // Increased limit to 1,000,000 rows for more complete data in mock mode
    const maxRows = Math.min(rowsNeeded > 0 ? rowsNeeded : 1000, limit); 
    
    const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');
    
    for (let i = 0; i < maxRows; i++) {
      const currentMs = startDateTime.getTime() + (i * interval);
      const date = new Date(currentMs);
      
      if (date > endDateTime) break;

      const canId = canIds[i % canIds.length];
      const dlc = "8";
      
      let cycleTime = 0;
      if (lastTsMap.has(canId)) {
        cycleTime = currentMs - lastTsMap.get(canId)!;
      } else {
        cycleTime = 100 + (i % 400);
      }
      lastTsMap.set(canId, currentMs);
      
      let b = [0, 0, 0, 0, 0, 0, 0, 0];
      // Simple simulation logic
      if (canId === "10281050") {
        const current = 125; 
        const voltage = 5260 + (i % 10);
        const soc = Math.max(0, 750 - Math.floor(i / 100));
        const temp = 32 + (i % 5) + 40;
        b[0] = current & 0xFF; b[1] = (current >> 8) & 0xFF;
        b[2] = voltage & 0xFF; b[3] = (voltage >> 8) & 0xFF;
        b[4] = soc & 0xFF; b[5] = temp & 0xFF;
      } else {
        for(let j=0; j<8; j++) b[j] = Math.floor(Math.random() * 256);
      }

      const bytes = b.map(v => v.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const lat = (28.3267120185 + (i * 0.00000001)).toFixed(15);
      const lng = (77.3601420198 + (i * 0.00000001)).toFixed(15);
      
      const relativeMs = (currentMs - startDateTime.getTime()).toFixed(3);
      
      const tsDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      const tsTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
      
      rows.push(`${(i + 1).toString().padStart(7)}) ${relativeMs.padStart(14)} ${tsDate} ${tsTime} ${canId.padStart(8)}  ${dlc} ${bytes}   ${cycleTime.toString().padStart(5)}  ${lat}   ${lng}`);
    }
    
    return [...header, ...rows].join('\n');
  };

  const handleSearch = async () => {
    if (!selectedDevice || !startDate || !endDate) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      // Try real API first
      const data = await api.searchReports(selectedDevice.id, startDate, endDate, startTime, endTime);
      if (data && data.files && Array.isArray(data.files)) {
        setSearchResult({ found: true, files: data.files, isMock: false });
        setSelectedFile(data.files[0]);
        setIsSearching(false);
        return;
      }
    } catch (e) {
      console.warn("Real API search failed, using mock data.");
    }

    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hasData = (selectedDevice.id === 'OSM01' || selectedDevice.id === 'OSM03' || Math.random() > 0.3);

    if (hasData) {
      // Only generate a small preview for the UI to keep it fluent
      const previewContent1 = generateMockData(selectedDevice.id, startDate, endDate, startTime, endTime, 100);
      const previewContent2 = generateMockData(selectedDevice.id, startDate, endDate, startTime, endTime, 100);
      
      const mockFiles: ReportFile[] = [
        {
          id: 'drive-file-1',
          name: `${selectedDevice.id}_telemetry_main_${startDate}.trc`,
          date: new Date().toLocaleDateString(),
          size: `43119.8 KB`, // Simulated large size
          type: 'raw',
          content: previewContent1 // Store preview for UI
        },
        {
          id: 'drive-file-2',
          name: `${selectedDevice.id}_telemetry_backup_${endDate}.trc`,
          date: new Date().toLocaleDateString(),
          size: `43119.8 KB`,
          type: 'raw',
          content: previewContent2
        }
      ];
      setSearchResult({ found: true, files: mockFiles, isMock: true });
      setSelectedFile(mockFiles[0]);
    } else {
      setSearchResult({ found: false, files: [], isMock: true });
    }
    setIsSearching(false);
  };

  const parseTimestamp = (tsStr: string): number => {
    if (!tsStr) return Date.now();
    // Try ISO format first (replace space with T if needed)
    let date = new Date(tsStr.includes('T') ? tsStr : tsStr.replace(' ', 'T'));
    if (!isNaN(date.getTime())) return date.getTime();
    
    // Robust fallback for various formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
    const parts = tsStr.match(/(\d+)/g);
    if (parts && parts.length >= 6) {
      const p = parts.map(v => parseInt(v));
      // Try YYYY-MM-DD first
      if (parts[0].length === 4) {
        date = new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5], p[6] || 0);
      } else {
        // Try DD-MM-YYYY
        date = new Date(p[2], p[1] - 1, p[0], p[3], p[4], p[5], p[6] || 0);
      }
      if (!isNaN(date.getTime())) return date.getTime();
    }
    return Date.now();
  };

  const getDecodedContent = (file: ReportFile) => {
    const signalsMapping: Record<string, string> = {
      "Battery_Live_Current_Amp": "Battery Current",
      "Battery_Live_Voltage_Volt": "Battery Voltage",
      "Battery_SOC_pct": "SoC",
      "Battery_Temp_Max_degC": "Battery High Temp",
      "Battery_Capacity_Left_Ah_Ah": "Depth of Discharge",
      "Battery_Capacity_Total_Ah_Ah": "Total Battery AH Capacity",
      "MCU_Motor_Speed_rpm": "Motor RPM",
      "MCU_Motor_Temp_degC": "Motor Temp",
      "MCU_Inverter_Temp_degC": "Inverter Temp",
      "MCU_Precharge_Status_raw": "Precharge Status",
      "MCU_Ignition_Status_raw": "Key On Indicator",
      "MCU_Precharge_Voltage_Volt": "Precharge Voltage",
      "MCU_Capacitor_Voltage_Volt": "Capacitor Voltage",
      "MCU_Capacitor_Current_Amp": "Capacitor Current",
      "Vehicle_Speed_kmh": "Speed",
      "Accelerator_Pedal_Pos_pct": "Accelerator Pedal",
      "Brake_Pedal_Pos_pct": "Brake Pedal",
      "Gear_Position_raw": "Gear Position",
      "Hill_Hold_Flag_raw": "Hill Hold Flag",
      "DTC_Count": "DTC Count",
      "Latitude": "Latitude",
      "Longitude": "Longitude",
      "TRC_Signal_1": "TRC Signal 1",
      "TRC_Signal_2": "TRC Signal 2",
      "TRC_Signal_3": "TRC Signal 3",
      "TRC_Signal_4": "TRC Signal 4"
    };

    const lines = file.content.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    let decodedHeaders = [
      "TimeStamp", "Odometer", "Speed", "Signal Strength", "Latitude", "Longitude", 
      "Motor RPM", "Torque", "Motor Temp", "SoC", "DTE", "Time to Charge", 
      "Battery Current", "Key On Indicator", "Battery Fault", "Battery Status", 
      "Depth of Discharge", "Total Battery AH Capacity", "Total Battery KWH Capacity", 
      "Battery Fault Code", "Battery High Temp", "Battery Low Temp", "Battery Low Voltage", 
      "Battery High Voltage", "Battery (Max Cell Volt)", "Battery (Min Cell Volt)", 
      "Battery (Max Cell Temp)", "Battery (Min Cell Temp)", "Battery (Avg Cell Temp)", 
      "Output Voltage Failure", "Battery Internal Failure", "Positive Isolation Failure", 
      "Negative Isolation Failure", "Positive Contactor Status", "Negative Contactor Status", 
      "Low SOC Alarm", "Low SOC Warning", "Permanent Failure", "Permanent Failure Code", 
      "TCU Communication Failure", "EV Inverter Failure", "EV Out Speed Failure", 
      "Cell Imbalance", "Cell Under Voltage", "Cell Over Voltage", "Cell Over Temp", 
      "Cell Under Temp", "Battery Voltage", "DTC Count", "Inverter Temp", 
      "Precharge Status", "Precharge Voltage", "Capacitor Voltage", "Capacitor Current", 
      "Accelerator Pedal", "Brake Pedal", "Gear Position", "Hill Hold Flag", 
      "TRC Signal 1", "TRC Signal 2", "TRC Signal 3", "TRC Signal 4"
    ];

    if (lines.length === 0) return decodedHeaders.join(',');

    // Check if it's .trc format (starts with ;)
    const isTrc = lines.some(l => l.startsWith(';'));

    if (isTrc) {
      // Parse .trc format
      const dataRows = lines.filter(l => !l.startsWith(';') && l.includes(')'));
      
      const decodedRows = dataRows.map(line => {
        const parts = line.split(/\s+/).filter(p => p !== '');
        if (parts.length < 5) return null;

        let tsDate, tsTime, canId, dlc, bytes;
        
        // Robust detection of relative timestamp column
        // If parts[1] contains a hyphen (e.g. 2026-04-06), it's the date, so relative timestamp is missing.
        if (parts[1].includes('-')) {
          tsDate = parts[1];
          tsTime = parts[2];
          canId = "0x" + parts[3];
          dlc = parseInt(parts[4]);
          bytes = parts.slice(5, 5 + dlc);
        } else {
          tsDate = parts[2];
          tsTime = parts[3];
          canId = "0x" + parts[4];
          dlc = parseInt(parts[5]);
          bytes = parts.slice(6, 6 + dlc);
        }

        const lat = parts[parts.length - 2];
        const lng = parts[parts.length - 1];

        const msgName = decoder.getMessageName(canId) || "Unknown";
        const decodedSignals = decoder.decode(canId, bytes);

        const signals: Record<string, string> = {};
        decodedHeaders.forEach(h => { signals[h] = ""; });

        signals["TimeStamp"] = `${tsDate} ${tsTime}`;
        signals["Latitude"] = lat;
        signals["Longitude"] = lng;

        Object.entries(decodedSignals).forEach(([name, val]) => {
          const headerName = signalsMapping[name] || name;
          if (signals.hasOwnProperty(headerName)) {
            signals[headerName] = typeof val === 'number' ? val.toFixed(2).replace(/\.00$/, '') : String(val);
          }
        });

        return decodedHeaders.map(h => signals[h]).join(',');
      }).filter(row => row !== null);

      return decodedHeaders.join(',') + '\n' + decodedRows.join('\n');
    } else {
      // Fallback for CSV
      const headerRow = lines[0].split(',');
      const csvRows = lines.slice(1);
      const findIdx = (names: string[]) => headerRow.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

      const tsIdx = findIdx(['timestamp', 'time', 'date']);
      const idIdx = findIdx(['can id', 'id', 'message id']);
      const b0Idx = findIdx(['b0', 'byte0']);
      const latIdx = findIdx(['lat', 'latitude']);
      const lngIdx = findIdx(['lng', 'longitude']);
      const odoIdx = findIdx(['odo', 'odometer']);

      const decodedRows = csvRows.map((line) => {
        const parts = line.split(',');
        const tsStr = tsIdx >= 0 ? parts[tsIdx] : parts[0];
        let canId = (idIdx >= 0 ? parts[idIdx] : "0x000").trim();
        if (!canId.startsWith('0x')) canId = '0x' + canId;
        
        const msgName = decoder.getMessageName(canId) || "Unknown";
        let bytes: string[] = [];
        if (b0Idx >= 0) bytes = parts.slice(b0Idx, b0Idx + 8);

        const decodedSignals = decoder.decode(canId, bytes);
        const signals: Record<string, string> = {};
        decodedHeaders.forEach(h => { signals[h] = ""; });

        signals["TimeStamp"] = tsStr;
        if (latIdx >= 0) signals["Latitude"] = parts[latIdx];
        if (lngIdx >= 0) signals["Longitude"] = parts[lngIdx];
        if (odoIdx >= 0) signals["Odometer"] = parts[odoIdx];

        Object.entries(decodedSignals).forEach(([name, val]) => {
          const headerName = signalsMapping[name] || name;
          if (signals.hasOwnProperty(headerName)) {
            signals[headerName] = typeof val === 'number' ? val.toFixed(2).replace(/\.00$/, '') : String(val);
          }
        });

        return decodedHeaders.map(h => signals[h]).join(',');
      });

      return decodedHeaders.join(',') + '\n' + decodedRows.join('\n');
    }
  };

  const getRawContent = (file: ReportFile) => {
    return file.content;
  };

  const downloadFile = async (file: ReportFile, format: 'raw' | 'decoded' = 'decoded') => {
    setIsSearching(true); // Reuse searching state for loading

    let fullContent = file.content;

    // If it's mock data, we need to generate the FULL content now
    if (searchResult?.isMock) {
      // Generate up to 1,000,000 rows only when user clicks download
      // This ensures the user gets "all the data" for the selected range in mock mode
      fullContent = generateMockData(selectedDevice?.id || 'OSM01', startDate, endDate, startTime, endTime, 1000000);
    } else if ((file as any).downloadUrl) {
      // If it's real data and has a download URL, fetch full content for the download
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent((file as any).downloadUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const text = await response.text();
          // If the proxy returned JSON (error), it's not the content
          if (!text.trim().startsWith('{')) {
            fullContent = text;
          }
        }
      } catch (e) {
        console.error("Failed to fetch full content, using preview.", e);
      }
    }

    let content: any;
    let mimeType: string;
    let fileName: string;

    if (format === 'decoded') {
      // Add BOM for Excel compatibility
      const BOM = "\uFEFF";
      content = BOM + getDecodedContent({ ...file, content: fullContent });
      mimeType = 'text/csv;charset=utf-8';
      fileName = file.name.replace('.trc', '.csv');
    } else {
      content = getRawContent({ ...file, content: fullContent });
      mimeType = 'text/plain;charset=utf-8';
      fileName = file.name;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsSearching(false);
  };

  return (
    <div className="flex-1 flex flex-col p-10 space-y-10 bg-slate-50/50 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Search, analyze and download vehicle data reports</p>
        </div>
        <div className="flex items-center bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mr-3">
             <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" referrerPolicy="no-referrer" className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Drive Connected</span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Device Search */}
          <div className="space-y-4" ref={searchRef}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">1. Search Device</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter Device ID (e.g. OSM01)"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 placeholder:text-slate-400 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => handleDeviceSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-6 h-6" />
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 w-full mt-3 bg-white border border-slate-100 rounded-[24px] shadow-2xl shadow-slate-200/50 overflow-hidden"
                  >
                    {suggestions.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => selectSuggestion(device)}
                        className="w-full flex items-center px-6 py-4 hover:bg-blue-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{device.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{device.status}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selectedDevice ? (
              <div className="flex items-center bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-3 mt-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3" />
                <span className="text-sm font-bold text-emerald-900">Device identified: {selectedDevice.id}</span>
              </div>
            ) : searchQuery.length > 0 && (
              <div className="flex items-center bg-amber-50/50 border border-amber-100 rounded-2xl px-5 py-3 mt-4">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
                <span className="text-sm font-bold text-amber-900">Searching for device...</span>
              </div>
            )}
          </div>

          {/* Date Range */}
          <AnimatePresence>
            {selectedDevice && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date & Time</label>
                    <span className="text-[10px] text-slate-400 font-medium">Format: YYYY-MM-DD</span>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <input
                      type="time"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">End Date & Time</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <input
                      type="time"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={handleSearch}
            disabled={isSearching || !selectedDevice || !startDate || !endDate}
            className={`
              flex items-center px-12 py-4 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all shadow-xl
              ${isSearching || !selectedDevice || !startDate || !endDate
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0'}
            `}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-3" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {!searchResult.found ? (
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-20 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8">
                  <AlertCircle className="w-12 h-12 text-slate-200" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">No Data Available</h4>
                <p className="text-slate-400 mt-2 max-w-md leading-relaxed">We couldn't find any telemetry logs for <b>{selectedDevice?.id}</b> in the selected date range on Google Drive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                {/* File List */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Available Files</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{searchResult.files.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {searchResult.files.map(file => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all group ${
                          selectedFile?.id === file.id 
                            ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20' 
                            : 'bg-white border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedFile?.id === file.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className={`font-bold text-sm truncate ${selectedFile?.id === file.id ? 'text-white' : 'text-slate-900'}`}>{file.name}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedFile?.id === file.id ? 'text-white/60' : 'text-slate-400'}`}>{file.size} • {file.date}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Preview */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  {selectedFile ? (
                    <>
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center">
                            <FileText className="text-blue-600 w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedFile.name}</h3>
                            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {selectedFile.date}</span>
                              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {selectedFile.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => downloadFile(selectedFile, 'decoded')}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                            title="Download as CSV (Excel compatible)"
                          >
                            <Download className="w-4 h-4" />
                            Save Decoded
                          </button>
                          <button 
                            onClick={() => downloadFile(selectedFile, 'raw')}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                            title="Download original .trc file"
                          >
                            <FileCode className="w-4 h-4" />
                            Save Raw
                          </button>
                          {(selectedFile as any).downloadUrl && (
                            <button 
                              onClick={() => window.open((selectedFile as any).downloadUrl, '_blank')}
                              className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-slate-500/20 hover:bg-slate-900 transition-all"
                              title="Download directly from Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Drive Link
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-8 space-y-8">
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                          <button 
                            onClick={() => setViewMode('decoded')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              viewMode === 'decoded' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            Decoded View
                          </button>
                          <button 
                            onClick={() => setViewMode('raw')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              viewMode === 'raw' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <FileCode className="w-4 h-4" />
                            Raw Data
                          </button>
                        </div>

                        <div className="bg-slate-900 rounded-[24px] p-8 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px] shadow-inner custom-scrollbar relative">
                          {selectedFile.content && !selectedFile.content.endsWith('\n') && !searchResult?.isMock && (
                            <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                              <AlertCircle className="w-3 h-3" />
                              Content may be truncated by server
                            </div>
                          )}
                          <pre className="text-blue-300/90 leading-relaxed">
                            {viewMode === 'decoded' 
                              ? getDecodedContent(selectedFile) 
                              : getRawContent(selectedFile)
                            }
                          </pre>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">Select a file to preview</h4>
                      <p className="text-slate-400 mt-2">Choose a file from the list on the left to see its content.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
