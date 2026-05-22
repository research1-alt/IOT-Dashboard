
import React, { useState, useEffect } from 'react';
import { AppConfig, Device, Member } from '../types';
import { getAppConfig, saveAppConfig, getEndpointUrl, resetAppConfig } from '../services/api';
import { CheckCircleIcon, WifiIcon, RefreshIcon, TrashIcon } from './Icons';

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
    
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    const [rawServerData, setRawServerData] = useState<string | null>(null);
    const [isFetchingRaw, setIsFetchingRaw] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState<string | null>(null);

    useEffect(() => {
        setConfig(getAppConfig());
    }, []);

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
        const testEndpoint = getEndpointUrl(baseUrl, 'devices');

        try {
            const response = await fetch(testEndpoint, { headers: { 'Accept': 'application/json, */*' } });
            const status = `${response.status} ${response.statusText}`;
            const contentType = response.headers.get("content-type");
            const text = await response.text();
            let data: any = text;

            try {
                data = JSON.parse(text);
            } catch {}

            setTestResponse(JSON.stringify({ requestUrl: testEndpoint, status, contentType, data }, null, 2));

            if (response.ok && contentType?.includes("application/json")) {
                setMessage({ text: "Connection successful!", type: 'success' });
            } else if (!contentType?.includes("application/json")) {
                setMessage({ text: "Warning: Server did not return JSON. Check URL.", type: 'error' });
            } else {
                setMessage({ text: `Connected, but server returned status: ${response.status}`, type: 'error' });
            }
        } catch (error: any) {
            setTestResponse(JSON.stringify({ requestUrl: testEndpoint, error: error.message, hint: "Check CORS settings or if server is online." }, null, 2));
            setMessage({ text: "Connection failed. See preview for details.", type: 'error' });
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
            const endpoint = getEndpointUrl(baseUrl, 'devices');
            const response = await fetch(endpoint);
            const text = await response.text();
            setFetchTimestamp(new Date().toLocaleTimeString());
            try {
                setRawServerData(JSON.stringify(JSON.parse(text), null, 2));
            } catch {
                setRawServerData(text);
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
            if (config.mode === 'server' && !config.serverUrl.trim()) {
                throw new Error("Please enter a valid Server URL.");
            }
            if (config.mode === 'server' && !config.serverUrl.startsWith('http')) {
                throw new Error("Server URL must start with http:// or https://");
            }

            saveAppConfig(config);
            await new Promise(resolve => setTimeout(resolve, 500));
            setMessage({ text: "Settings saved! Reloading data...", type: 'success' });
            setTimeout(() => onConfigSave(), 1000);
        } catch (err) {
            setMessage({ text: err instanceof Error ? err.message : "Failed to save", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const displayUrl = config.serverUrl ? config.serverUrl.replace(/\/$/, '') : 'http://localhost:3000/api';
    const showVercelApiWarning = config.mode === 'server' && config.serverUrl && config.serverUrl.includes('vercel.app') && !config.serverUrl.endsWith('/api');

    const exampleDeviceJson = `[
  {
    "id": "OSM01",
    "status": "Driving",
    "location": "New York, USA",
    ...
  }
]`;

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                            <p className="text-gray-500 mt-1">Manage configuration and view data.</p>
                        </div>
                        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'config' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>Configuration</button>
                            <button onClick={() => setActiveTab('inspector')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'inspector' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>Received Data</button>
                            <button onClick={() => setActiveTab('docs')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'docs' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>API Docs</button>
                        </div>
                    </div>
                    
                    {activeTab === 'config' && (
                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Source</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="relative flex flex-col p-4 border-2 rounded-xl border-primary-600 bg-primary-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <WifiIcon className="w-8 h-8 text-primary-600" />
                                            <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <span className="font-bold text-gray-800">Remote Server (Active)</span>
                                        <p className="text-sm text-gray-500 mt-1 text-left">The application is configured to only receive data from the telematics server.</p>
                                    </div>
                                </div>
                            </div>

                            {config.mode === 'server' && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Server Connection</h4>
                                        <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">API Base URL</label>
                                        <div className="mt-1 flex gap-2">
                                            <input type="text" id="serverUrl" value={config.serverUrl} onChange={handleUrlChange} className="flex-1 block w-full px-3 py-2 rounded-md border-gray-300" placeholder="https://your-project.vercel.app/api" />
                                            <button onClick={handleTestConnection} disabled={isTesting || !config.serverUrl} className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center">
                                                {isTesting ? <RefreshIcon className="w-4 h-4 mr-2 animate-spin" /> : <WifiIcon className="w-4 h-4 mr-2" />} Test
                                            </button>
                                        </div>
                                        {showVercelApiWarning && (
                                            <div className="mt-2 text-yellow-800 bg-yellow-50 p-3 rounded-md border border-yellow-200 text-xs">
                                                <strong>Vercel Tip:</strong> Your URL doesn't end with <code>/api</code>. Vercel functions are usually served from an <code>/api</code> path. This may cause connection errors.
                                            </div>
                                        )}
                                    </div>
                                    {testResponse && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Server Response Preview</h5>
                                            <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-64">{testResponse}</pre>
                                        </div>
                                    )}
                                    <div className="bg-white p-4 rounded border">
                                        <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                            <WifiIcon className="w-4 h-4 mr-2 text-primary-600"/>Required Endpoints
                                        </h5>
                                        <div className="space-y-3 font-mono text-xs">
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold text-[10px]">GET</span>
                                                <span className="text-gray-700 break-all">{displayUrl}/devices</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold text-[10px]">GET</span>
                                                <span className="text-gray-700 break-all">{displayUrl}/members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t flex items-center justify-between">
                                 {message && <div className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</div>}
                                <div className="flex ml-auto space-x-3">
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to reset the application? This will clear your custom server URL and reload the page.")) {
                                                resetAppConfig();
                                            }
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Reset to Defaults
                                    </button>
                                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-sm hover:bg-primary-700 transition-colors">
                                        {isSaving ? 'Saving...' : 'Save & Connect'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inspector' && (
                        <div className="p-8 bg-gray-50 min-h-[400px]">
                            <div className="mb-6 p-4 rounded-lg border flex items-center bg-blue-50">
                                <WifiIcon className="w-6 h-6 text-blue-600 mr-3"/>
                                <div>
                                    <h3 className="text-lg font-bold">Remote Server</h3>
                                    <p className="text-sm font-mono mt-1">{config.serverUrl}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Current App Data</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">Devices ({devices.length})</label>
                                            <textarea readOnly className="w-full h-64 p-3 text-xs font-mono" value={JSON.stringify(devices, null, 2)} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Direct Server Response</h3>
                                    <div className="bg-white p-4 border rounded-lg">
                                        <button onClick={handleFetchRawInspectorData} disabled={isFetchingRaw} className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-md">
                                            {isFetchingRaw ? <RefreshIcon className="w-4 h-4 mr-2 animate-spin" /> : <WifiIcon className="w-4 h-4 mr-2" />} Fetch Raw Server Data
                                        </button>
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold uppercase mb-2">Raw JSON Response {fetchTimestamp && `(Live @ ${fetchTimestamp})`}</label>
                                            {rawServerData ? <textarea readOnly className="w-full h-96 p-3 text-xs font-mono bg-gray-900 text-green-400" value={rawServerData} /> : <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400"><p>Click to inspect raw JSON</p></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="p-8 bg-white min-h-[400px]">
                            <div className="prose max-w-none">
                                <h3>Integration Guide</h3>
                                <p>To connect your own backend, it must act as an API and meet these requirements.</p>
                                <div className="bg-yellow-50 p-4 my-6">
                                    <h4>Important Security Rules</h4>
                                    <ul>
                                        <li><strong>CORS:</strong> Your server must allow Cross-Origin Resource Sharing. Set <code>Access-Control-Allow-Origin: *</code>.</li>
                                        <li><strong>HTTPS:</strong> If this dashboard is on HTTPS, your server must be too.</li>
                                        <li><strong>JSON:</strong> Endpoints must return <code>Content-Type: application/json</code>.</li>
                                    </ul>
                                </div>
                                <h4>Endpoint 1: GET /devices</h4>
                                <pre className="bg-gray-900 text-gray-100 p-4"><code>{`// Response Body (Array):\n${exampleDeviceJson}`}</code></pre>
                                <h4>Endpoint 2: GET /members</h4>
                                <pre className="bg-gray-900 text-gray-100 p-4"><code>{`// Response Body:\n[\n  {\n    "id": "user-01",\n    "name": "Jane Admin",\n    ...\n  }\n]`}</code></pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
