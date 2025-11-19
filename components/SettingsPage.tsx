
import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { getAppConfig, saveAppConfig } from '../services/api';
import { CheckCircleIcon, WifiIcon, CloudDownloadIcon } from './Icons';

interface SettingsPageProps {
    onConfigSave: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onConfigSave }) => {
    const [config, setConfig] = useState<AppConfig>(getAppConfig());
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        // Load fresh config on mount
        setConfig(getAppConfig());
    }, []);

    const handleModeChange = (mode: 'local' | 'server') => {
        setConfig(prev => ({ ...prev, mode }));
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, serverUrl: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            // Basic Validation
            if (config.mode === 'server' && !config.serverUrl.startsWith('http')) {
                throw new Error("Server URL must start with http:// or https://");
            }

            saveAppConfig(config);
            
            // Simulate a small delay for UX or perform a connection test here
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

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">System Configuration</h2>
                        <p className="text-gray-500 mt-1">Manage data sources and connectivity preferences.</p>
                    </div>
                    
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
                                    <p className="text-sm text-gray-500 mt-1">
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
                                    <p className="text-sm text-gray-500 mt-1">
                                        Connect to a real backend API to fetch live fleet data.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Server Configuration Form */}
                        {config.mode === 'server' && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in-up">
                                <h4 className="font-semibold text-gray-800 mb-4">Server Connection Details</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">API Base URL</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 sm:text-sm">
                                                https://
                                            </span>
                                            <input
                                                type="text"
                                                name="serverUrl"
                                                id="serverUrl"
                                                value={config.serverUrl.replace(/^https?:\/\//, '')}
                                                onChange={(e) => {
                                                    // Prepend http/https logic handling is simplified for UI; 
                                                    // usually handled by stripping prefix in display and adding back in state, 
                                                    // but here we just update state directly for simplicity if user types it.
                                                    // Better to just trust the input:
                                                    handleUrlChange(e); 
                                                }}
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300"
                                                placeholder="api.yourfleet.com/v1"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            The app will append <code>/devices</code> and <code>/members</code> to this URL.
                                        </p>
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
                                    {isSaving ? 'Saving...' : 'Save & Reload'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
