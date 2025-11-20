
import React, { useState, useEffect, useRef } from 'react';
import { getAppConfig } from '../services/api';
import { WifiIcon, RefreshIcon, CheckCircleIcon } from './Icons';

const ServerDataPage: React.FC = () => {
    const [config, setConfig] = useState(getAppConfig());
    const [rawData, setRawData] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(false);
    const autoRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
            // Keep old data visible even if fetch fails, but maybe gray it out or show error
        } finally {
            setIsFetching(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchLiveData();
        return () => stopAutoRefresh();
    }, []);

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
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Connected Server Endpoint</p>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-300">
                                    {displayUrl}/devices
                                </code>
                            </div>
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
