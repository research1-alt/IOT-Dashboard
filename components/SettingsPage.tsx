
import React, { useState, useEffect } from 'react';
import { AppConfig, Device, Member } from '../types';
import { getAppConfig, saveAppConfig } from '../services/api';
import { CheckCircleIcon, WifiIcon, CloudDownloadIcon, RefreshIcon } from './Icons';

interface SettingsPageProps {
    onConfigSave: () => void;
    devices: Device[];
    members: Member[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onConfigSave, devices, members }) => {
    const [config, setConfig] = useState<AppConfig>(getAppConfig());
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'config' | 'inspector' | 'docs'>('config');
    
    // Testing State (Configuration Tab)
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    // Inspector State (Data Tab)
    const [rawServerData, setRawServerData] = useState<string | null>(null);
    const [isFetchingRaw, setIsFetchingRaw] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState<string | null>(null);

    useEffect(() => {
        // Load fresh config on mount
        setConfig(getAppConfig());
    }, []);

    const handleModeChange = (mode: 'local' | 'server') => {
        setConfig(prev => ({ ...prev, mode }));
        setTestResponse(null); // Clear test results when switching modes
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, serverUrl: e.target.value }));
    };

    const handleTestConnection = async () => {
        if (!config.serverUrl) {
            setMessage({ text: "Please enter a URL to test.", type: 'error' });
            return;
        }

        setIsTesting(true);
        setTestResponse(null);
        setMessage(null);

        const baseUrl = config.serverUrl.replace(/\/$/, "");
        // Handle relative vs absolute testing
        const testEndpoint = baseUrl.startsWith('http') || baseUrl.startsWith('/')
            ? `${baseUrl}/devices`
            : `/${baseUrl}/devices`;

        try {
            const response = await fetch(testEndpoint, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const status = response.status;
            const statusText = response.statusText;
            const contentType = response.headers.get("content-type");
            
            let body;
            let isJson = false;

            if (contentType && contentType.includes("application/json")) {
                body = await response.json();
                isJson = true;
            } else {
                body = await response.text();
                // Preview first 200 chars if HTML
                if (body.length > 200) body = body.substring(0, 200) + "...(truncated)";
            }

            const debugResult = {
                requestUrl: testEndpoint,
                status: `${status} ${statusText}`,
                contentType: contentType,
                data: body
            };

            setTestResponse(JSON.stringify(debugResult, null, 2));

            if (response.ok && isJson) {
                setMessage({ text: "Connection successful!", type: 'success' });
            } else if (!isJson) {
                setMessage({ text: "Warning: Endpoint returned HTML/Text, not JSON. Check URL.", type: 'error' });
            } else {
                setMessage({ text: `Connected, but server returned status: ${status}`, type: 'error' });
            }

        } catch (error: any) {
            const errorResult = {
                requestUrl: testEndpoint,
                error: error.message || "Network Error",
                hint: "Check CORS settings on your server if fetching from localhost."
            };
            setTestResponse(JSON.stringify(errorResult, null, 2));
            setMessage({ text: "Connection failed. Check the preview for details.", type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleFetchRawInspectorData = async () => {
        if (!config.serverUrl) return;
        setIsFetchingRaw(true);
        setRawServerData(null);
        setFetchTimestamp(null);

        try {
            const baseUrl = config.serverUrl.replace(/\/$/, "");
             const endpoint = baseUrl.startsWith('http') || baseUrl.startsWith('/')
            ? `${baseUrl}/devices`
            : `/${baseUrl}/devices`;

            const response = await fetch(endpoint);
            const text = await response.text();
            
            setFetchTimestamp(new Date().toLocaleTimeString());

            try {
                const json = JSON.parse(text);
                setRawServerData(JSON.stringify(json, null, 2));
            } catch {
                setRawServerData(text); // Fallback to text if not JSON
            }
        } catch (e: any) {
            setRawServerData(`Error fetching from server: ${e.message}`);
        } finally {
            setIsFetchingRaw(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            // Basic Validation
            if (config.mode === 'server' && !config.serverUrl.trim()) {
                throw new Error("Please enter a valid Server URL.");
            }
            if (config.mode === 'server' && !config.serverUrl.startsWith('http') && !config.serverUrl.startsWith('/')) {
                throw new Error("Server URL must start with http://, https://, or /");
            }

            saveAppConfig(config);
            
            // Simulate a small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setMessage({ text: "Settings saved successfully! Reloading data...", type: 'success' });
            
            setTimeout(() => {
                onConfigSave(); // Trigger app reload
            }, 1000);

        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Failed to save settings";
            setMessage({ text: errMsg, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to display clean example URLs
    const displayUrl = config.serverUrl ? config.serverUrl.replace(/\/$/, '') : 'http://localhost:3000/api';

    // Warning detection
    const showUrlWarning = config.mode === 'server' && config.serverUrl && (
        config.serverUrl.includes('google.com') || 
        config.serverUrl.includes('drive')
    );

    // Example JSON structure for docs
    const exampleDeviceJson = `[
  {
    "id": "OSM01",
    "status": "Driving",
    "location": "New York, USA",
    "ownerName": "John Doe",
    "vehicleModel": "Rage+125",
    "manufacturingYear": 2024,
    "batteryUID": "BATT-001",
    "imageUrl": "https://example.com/car.png"
  }
]`;

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                            <p className="text-gray-500 mt-1">Manage configuration and view data.</p>
                        </div>
                        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                            <button 
                                onClick={() => setActiveTab('config')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'config' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Configuration
                            </button>
                            <button 
                                onClick={() => setActiveTab('inspector')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inspector' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Received Data
                            </button>
                            <button 
                                onClick={() => setActiveTab('docs')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'docs' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                API Docs
                            </button>
                        </div>
                    </div>
                    
                    {activeTab === 'config' && (
                        <div className="p-8 space-y-8">
                            {/* Mode Selection */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Source</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleModeChange('local')}
                                        className={`relative flex flex-col p-4 border-2 rounded-xl transition-all ${
                                            config.mode === 'local' 
                                            ? 'border-primary-600 bg-primary-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <CloudDownloadIcon className={`w-8 h-8 ${config.mode === 'local' ? 'text-primary-600' : 'text-gray-400'}`} />
                                            {config.mode === 'local' && <CheckCircleIcon className="w-6 h-6 text-primary-600" />}
                                        </div>
                                        <span className="font-bold text-gray-800">Local Simulation</span>
                                        <p className="text-sm text-gray-500 mt-1 text-left">
                                            Use browser storage and mock data. Ideal for demos and offline testing.
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => handleModeChange('server')}
                                        className={`relative flex flex-col p-4 border-2 rounded-xl transition-all ${
                                            config.mode === 'server' 
                                            ? 'border-primary-600 bg-primary-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <WifiIcon className={`w-8 h-8 ${config.mode === 'server' ? 'text-primary-600' : 'text-gray-400'}`} />
                                            {config.mode === 'server' && <CheckCircleIcon className="w-6 h-6 text-primary-600" />}
                                        </div>
                                        <span className="font-bold text-gray-800">Remote Server</span>
                                        <p className="text-sm text-gray-500 mt-1 text-left">
                                            Connect to a real backend API (e.g., Vercel, AWS) to fetch live fleet data.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Server Configuration Form */}
                            {config.mode === 'server' && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in-up space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Server Connection Details</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Enter the base URL where your API is hosted.
                                        </p>
                                        
                                        <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">API Base URL</label>
                                        <div className="mt-1 flex gap-2">
                                            <input
                                                type="text"
                                                name="serverUrl"
                                                id="serverUrl"
                                                value={config.serverUrl}
                                                onChange={handleUrlChange}
                                                className="flex-1 block w-full px-3 py-2 rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="https://your-project.vercel.app/api"
                                            />
                                            <button
                                                onClick={handleTestConnection}
                                                disabled={isTesting || !config.serverUrl}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
                                            >
                                                {isTesting ? (
                                                    <RefreshIcon className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <WifiIcon className="w-4 h-4 mr-2" />
                                                )}
                                                Test
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            <strong>Tip:</strong> If using Vercel serverless functions in an <code>/api</code> folder, your URL likely ends with <code>/api</code>.
                                        </p>
                                        {showUrlWarning && (
                                            <p className="text-yellow-600 text-xs mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <strong>Warning:</strong> This looks like a website URL (e.g., Google Drive/AI Studio). Ensure you are using a valid API endpoint that returns JSON, not a web page.
                                            </p>
                                        )}
                                    </div>
                                    
                                    {testResponse && (
                                        <div className="mt-4">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Server Response Preview</h5>
                                            <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-64 border border-gray-700 whitespace-pre-wrap break-all">
                                                {testResponse}
                                            </pre>
                                        </div>
                                    )}

                                    {/* URL Guide for the User */}
                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm mt-4">
                                        <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                            <WifiIcon className="w-4 h-4 mr-2 text-primary-600"/>
                                            Required Server Endpoints
                                        </h5>
                                        <p className="text-xs text-gray-500 mb-3">
                                            To receive data, configure your server to respond to these exact URLs:
                                        </p>
                                        <div className="space-y-3 font-mono text-xs">
                                            <div className="group relative">
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                                                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold text-[10px] tracking-wide">GET</span>
                                                    <span className="text-gray-700 break-all">{displayUrl}/devices</span>
                                                </div>
                                            </div>
                                            <div className="group relative">
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                                                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold text-[10px] tracking-wide">GET</span>
                                                    <span className="text-gray-700 break-all">{displayUrl}/members</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Actions */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                 {message && (
                                    <div className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div className="flex ml-auto space-x-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isSaving ? 'Saving...' : 'Save & Connect'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inspector' && (
                        <div className="p-8 bg-gray-50 min-h-[400px]">
                            {/* Active Source Indicator */}
                            <div className={`mb-6 p-4 rounded-lg border flex items-center ${config.mode === 'server' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                                <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                                    {config.mode === 'server' ? <WifiIcon className="w-6 h-6 text-blue-600"/> : <CloudDownloadIcon className="w-6 h-6 text-gray-500"/>}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-75">Active Data Source</p>
                                    <h3 className="text-lg font-bold">
                                        {config.mode === 'server' ? 'Remote Server' : 'Local Storage / Mock'}
                                    </h3>
                                    {config.mode === 'server' && <p className="text-sm opacity-75 font-mono mt-1">{config.serverUrl}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Column 1: App State */}
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                                            Processed Dashboard Data
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            This is the data currently loaded into the Dashboard memory.
                                            {config.mode === 'server' 
                                                ? " It represents the last successful fetch from your server." 
                                                : " It is currently reading from Local Storage."}
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Devices Payload ({devices.length})</label>
                                            <textarea 
                                                readOnly
                                                className="w-full h-64 p-3 text-xs font-mono bg-white border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                value={JSON.stringify(devices, null, 2)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Live Server Check */}
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <WifiIcon className="w-5 h-5 mr-2 text-blue-600" />
                                            Direct Server Response (Raw)
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Fetch data directly from <strong>{displayUrl}</strong> right now, ignoring the app's current mode.
                                            This helps verify what the server is actually sending.
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                        <button
                                            onClick={handleFetchRawInspectorData}
                                            disabled={isFetchingRaw}
                                            className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {isFetchingRaw ? (
                                                <>
                                                    <RefreshIcon className="w-4 h-4 mr-2 animate-spin" /> Fetching...
                                                </>
                                            ) : (
                                                <>
                                                    <WifiIcon className="w-4 h-4 mr-2" /> Fetch Raw Server Data
                                                </>
                                            )}
                                        </button>

                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">
                                                    Raw JSON Response
                                                </label>
                                                {fetchTimestamp && (
                                                    <span className="text-xs text-gray-400">Fetched at {fetchTimestamp}</span>
                                                )}
                                            </div>
                                            
                                            {rawServerData ? (
                                                <textarea 
                                                    readOnly
                                                    className="w-full h-96 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-700 rounded-md"
                                                    value={rawServerData}
                                                />
                                            ) : (
                                                <div className="w-full h-96 bg-gray-100 border border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                                    <WifiIcon className="w-12 h-12 mb-2 opacity-20"/>
                                                    <p className="text-sm">Click the button above to inspect raw JSON from <strong>{displayUrl}</strong></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="p-8 bg-white min-h-[400px] space-y-8">
                            <div className="prose max-w-none text-gray-600">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Integration Guide: How to Connect Your Website</h3>
                                <p>
                                    To use your own website as the backend server for this dashboard, your website needs to act as an API. 
                                    This means it must respond to HTTP requests with JSON data in a specific format.
                                </p>
                                
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                                    <h4 className="font-bold text-yellow-800">Important Security Requirements</h4>
                                    <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                                        <li><strong>CORS:</strong> Your server MUST allow Cross-Origin Resource Sharing (CORS). You must set the header <code>Access-Control-Allow-Origin: *</code> (or match this dashboard's domain).</li>
                                        <li><strong>HTTPS:</strong> If this dashboard is running on HTTPS (secure), your server URL MUST also start with <code>https://</code>. Browsers block Mixed Content (HTTP) requests from secure pages.</li>
                                        <li><strong>JSON:</strong> Your endpoints must return <code>Content-Type: application/json</code>.</li>
                                    </ul>
                                </div>

                                <hr className="my-8 border-gray-200"/>

                                <h4 className="text-lg font-bold text-gray-800 mb-2">Endpoint 1: GET /devices</h4>
                                <p className="text-sm mb-4">This endpoint should return a list of all vehicles in your fleet.</p>
                                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                    <pre className="text-xs font-mono">{`// GET /devices
// Response Body (Array of Objects):
${exampleDeviceJson}`}</pre>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Fields: <code>id</code> (required, unique), <code>status</code> (Driving/Parked/Offline/Maintenance), 
                                    and other optional details like <code>location</code>, <code>ownerName</code>, etc.
                                </p>

                                <hr className="my-8 border-gray-200"/>

                                <h4 className="text-lg font-bold text-gray-800 mb-2">Endpoint 2: GET /members</h4>
                                <p className="text-sm mb-4">This endpoint should return a list of users who can access the fleet.</p>
                                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                    <pre className="text-xs font-mono">{`// GET /members
// Response Body:
[
  {
    "id": "user-01",
    "name": "Jane Admin",
    "email": "jane@example.com",
    "role": "Admin",
    "assignedDevices": []
  },
  {
    "id": "user-02",
    "name": "Bob Driver",
    "email": "bob@example.com",
    "role": "Member",
    "assignedDevices": ["OSM01"]
  }
]`}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
