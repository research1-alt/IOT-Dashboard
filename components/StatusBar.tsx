
import React from 'react';
import { CheckCircleIcon } from './Icons';

const StatusBar: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-8 bg-sidebar text-gray-300 flex items-center justify-between px-4 text-xs font-mono z-50 border-t border-gray-700">
            <div className="flex items-center space-x-4">
                {/* System Connectivity Status */}
                <div className="flex items-center text-green-400">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    <span>System:</span>
                    <span className="ml-2 font-bold">Active</span>
                </div>
                <div className="h-4 w-px bg-gray-600"></div>
                {/* Data Mode */}
                <div className="flex items-center text-gray-400">
                    <span>Mode:</span>
                    <span className="ml-2">Local Storage</span>
                </div>
            </div>
            <div className="text-gray-500">
                <span>&copy; {new Date().getFullYear()} Telematics Inc.</span>
            </div>
        </footer>
    );
};

export default StatusBar;
