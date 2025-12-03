
import React, { useState, useEffect, useRef } from 'react';
import { getAppConfig, saveAppConfig } from '../services/api';
import { WifiIcon, RefreshIcon, CheckCircleIcon, PencilIcon, XMarkIcon, BeakerIcon, ExclamationTriangleIcon } from './Icons';

interface DiagnosticResult {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
}

const ServerDataPage: React.FC = () => {
    const [config, setConfig] = useState(getAppConfig());
    const [rawData, setRawData] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(false);
    const autoRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState('');

    // Diagnostics State
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
    const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);

    const fetchLiveData = async () => {
        if (!config.serverUrl) {
            setError("No Server URL configured. Please set one in Settings.");
            return;
        }

        setIsFetching(true);
        // Do not clear previous data on refresh to prevent flickering
        setError(null);
        
        const baseUrl = config.serverUrl.replace(/\/$/, "");
        const endpoint = baseUrl.startsWith('http') || baseUrl.startsWith('/') 
            ? `${baseUrl}/devices` 
            : `/${baseUrl}/devices`;

        try {
            const response = await fetch(endpoint);
            const text = await response.text();
            
            try {
                const json = JSON.parse(text);
                // Pretty print JSON
                setRawData(JSON.stringify(json, null, 2));
            } catch {
                setRawData(text);
            }
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setIsFetching(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchLiveData();
        return () => stopAutoRefresh();
    }, [config]); // Refetch if config changes

    const startAutoRefresh = () => {
        setIsAutoRefresh(true);
        fetchLiveData(); // Fetch immediately
        autoRefreshInterval.current = setInterval(fetchLiveData, 2000); // Fetch every 2 seconds
    };

    const stopAutoRefresh = () => {
        setIsAutoRefresh(false);
        if (autoRefreshInterval.current) {
            clearInterval(autoRefreshInterval.current);
            autoRefreshInterval.current = null;
        }
    };

    const toggleAutoRefresh = () => {
        if (isAutoRefresh) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    };

    const displayUrl = config.serverUrl || "Not Configured";

    // --- EDIT HANDLERS ---
    const handleStartEdit = () => {
        setTempUrl(config.serverUrl);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!tempUrl.trim()) {
            alert("URL cannot be empty");
            return;
        }
        
        const newConfig = { ...config, serverUrl: tempUrl, mode: 'server' as const };
        saveAppConfig(newConfig);
        setConfig(newConfig);
        setIsEditing(false);
        // Trigger immediate fetch with new URL
        setTimeout(() => fetchLiveData(), 100);
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // --- DIAGNOSTICS LOGIC ---
    const runDiagnostics = async () => {
        setIsRunningDiagnostics(true);
        setDiagnosticResults([]);
        setShowDiagnostics(true);
        
        const results: DiagnosticResult[] = [];
        const baseUrl = config.serverUrl.replace(/\/$/, "");
        
        // Check 1: HTTPS Protocol
        if (window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
             results.push({ name: "Protocol Security", status: "fail", details: "Mixed Content Error. Your dashboard is on HTTPS but server is HTTP. Browsers block this." });
        } else {
             results.push({ name: "Protocol Security", status: "pass", details: "Protocol matches or is compatible." });
        }

        // Check 2: Connectivity & CORS (Devices)
        try {
            const devicesRes = await fetch(`${baseUrl}/devices`);
            if (devicesRes.ok) {
                results.push({ name: "Connection & CORS", status: "pass", details: "Successfully reached server." });
                
                // Check 3: JSON Content Type
                const contentType = devicesRes.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                     results.push({ name: "Content Type", status: "pass", details: "Server returned application/json." });
                     
                     // Check 4: Data Structure
                     try {
                         const data = await devicesRes.json();
                         if (Array.isArray(data)) {
                             results.push({ name: "Data Structure (Devices)", status: "pass", details: `Valid Array received with ${data.length} items.` });
                         } else {
                             results.push({ name: "Data Structure (Devices)", status: "fail", details: "Expected a JSON Array, got an Object." });
                         }
                     } catch {
                         results.push({ name: "JSON Parsing", status: "fail", details: "Response was not valid JSON." });
                     }

                } else {
                    results.push({ name: "Content Type", status: "fail", details: `Expected JSON, got ${contentType}.` });
                }

            } else {
                results.push({ name: "Connection & CORS", status: "fail", details: `Server responded with ${devicesRes.status} ${devicesRes.statusText}.` });
            }
        } catch (err: any) {
            results.push({ name: "Connection & CORS", status: "fail", details: `Network Error: ${err.message}. Likely CORS or Server Offline.` });
        }

        // Check 5: Members Endpoint
        try {
             const membersRes = await fetch(`${baseUrl}/members`);
             if (membersRes.ok) {
                 results.push({ name: "Endpoint /members", status: "pass", details: "Endpoint exists and is accessible." });
             } else {
                 results.push({ name: "Endpoint /members", status: "warning", details: `Missing or Error (${membersRes.status}).` });
             }
        } catch {
             results.push({ name: "Endpoint /members", status: "fail", details: "Unreachable." });
        }

        setDiagnosticResults(results);
        setIsRunningDiagnostics(false);
    };


    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <WifiIcon className="w-8 h-8 mr-3 text-blue-600" />
                            Server Data Monitor
                        </h1>
                        <p className="text-gray-600 mt-2">
                            View live data streaming from your backend server.
                        </p>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Connected Server Endpoint (Base URL)</p>
                            </div>
                            
                            {isEditing ? (
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="text"
                                        value={tempUrl}
                                        onChange={(e) => setTempUrl(e.target.value)}
                                        placeholder="https://your-api-url.com/api"
                                        className="text-sm font-mono text-gray-800 bg-white px-3 py-1.5 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full max-w-md shadow-sm"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleSaveEdit}
                                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                        title="Save"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={handleCancelEdit}
                                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                        title="Cancel"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 group">
                                    <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                                    <code className="text-sm font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-300">
                                        {displayUrl}/devices
                                    </code>
                                    <button 
                                        onClick={handleStartEdit}
                                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors ml-2"
                                        title="Edit URL"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                             {/* Auto Refresh Toggle */}
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${isAutoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
                                    {isAutoRefresh ? 'Live Updates ON' : 'Live Updates OFF'}
                                </span>
                                <button 
                                    onClick={toggleAutoRefresh}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isAutoRefresh ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoRefresh ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            <button
                                onClick={runDiagnostics}
                                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-sm text-sm"
                                title="Run Connection Diagnostics"
                            >
                                <BeakerIcon className="w-4 h-4 mr-2" />
                                Diagnostics
                            </button>

                            <button
                                onClick={fetchLiveData}
                                disabled={isFetching || isAutoRefresh}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                            >
                                {isFetching ? (
                                    <>
                                        <RefreshIcon className="w-4 h-4 mr-2 animate-spin" /> Fetching...
                                    </>
                                ) : (
                                    <>
                                        <RefreshIcon className="w-4 h-4 mr-2" /> Manual Fetch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Diagnostics Panel */}
                {showDiagnostics && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Server Diagnostics Report</h3>
                            <button onClick={() => setShowDiagnostics(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {isRunningDiagnostics ? (
                            <div className="text-center py-8">
                                <RefreshIcon className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                                <p className="text-gray-600">Running system checks...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {diagnosticResults.map((result, idx) => (
                                    <div key={idx} className={`flex items-start p-3 rounded border ${
                                        result.status === 'pass' ? 'bg-green-50 border-green-200' : 
                                        result.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex-shrink-0 mt-0.5">
                                            {result.status === 'pass' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                                            {result.status === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />}
                                            {result.status === 'fail' && <XMarkIcon className="w-5 h-5 text-red-600" />}
                                        </div>
                                        <div className="ml-3">
                                            <h4 className={`text-sm font-bold ${
                                                result.status === 'pass' ? 'text-green-800' : 
                                                result.status === 'warning' ? 'text-yellow-800' : 'text-red-800'
                                            }`}>{result.name}</h4>
                                            <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Data Display Area */}
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700 flex flex-col h-[600px]">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center">
                            <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Received Payload</span>
                        </div>
                        {lastUpdated && (
                            <span className="text-xs text-green-400 font-mono">
                                Last received: {lastUpdated}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-auto relative custom-scrollbar">
                        {error ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                                <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/50">
                                    <div className="inline-block p-3 bg-red-500/10 rounded-full mb-4">
                                        <WifiIcon className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-red-400 font-bold mb-2 text-lg">Connection Failed</h3>
                                    <p className="text-red-200 text-sm max-w-md mx-auto">{error}</p>
                                    <button 
                                        onClick={fetchLiveData}
                                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {rawData ? (
                            <pre className="text-green-400 font-mono text-xs p-6 leading-relaxed">
                                {rawData}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <RefreshIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Waiting for data...</p>
                                <p className="text-xs mt-2">Click 'Manual Fetch' or enable 'Live Updates'</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ServerDataPage;
