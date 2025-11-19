
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, WifiIcon, CloudDownloadIcon } from './Icons';
import { getAppConfig } from '../services/api';

const StatusBar: React.FC = () => {
    // We use a simple local state here that updates occasionally or on mount
    // In a more complex app, this would subscribe to a context or store.
    const [mode, setMode] = useState<'local' | 'server'>('local');
    const [serverUrl, setServerUrl] = useState('');

    useEffect(() => {
        const config = getAppConfig();
        setMode(config.mode);
        setServerUrl(config.serverUrl);
        
        // Poll briefly to update status if settings change (simple approach without context)
        const interval = setInterval(() => {
            const current = getAppConfig();
            if (current.mode !== mode || current.serverUrl !== serverUrl) {
                 setMode(current.mode);
                 setServerUrl(current.serverUrl);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [mode, serverUrl]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-8 bg-sidebar text-gray-300 flex items-center justify-between px-4 text-xs font-mono z-50 border-t border-gray-700">
            <div className="flex items-center space-x-4">
                {/* System Connectivity Status */}
                <div className={`flex items-center ${mode === 'local' ? 'text-green-400' : 'text-blue-400'}`}>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    <span>System:</span>
                    <span className="ml-2 font-bold">Active</span>
                </div>
                <div className="h-4 w-px bg-gray-600"></div>
                {/* Data Mode */}
                <div className="flex items-center text-gray-400 space-x-2">
                    {mode === 'local' ? <CloudDownloadIcon className="w-4 h-4"/> : <WifiIcon className="w-4 h-4"/>}
                    <span>Mode:</span>
                    <span className="font-semibold text-white uppercase">{mode}</span>
                    {mode === 'server' && (
                        <span className="text-gray-500 max-w-[200px] truncate ml-2" title={serverUrl}>
                            ({serverUrl})
                        </span>
                    )}
                </div>
            </div>
            <div className="text-gray-500">
                <span>&copy; {new Date().getFullYear()} Telematics Inc.</span>
            </div>
        </footer>
    );
};

export default StatusBar;
