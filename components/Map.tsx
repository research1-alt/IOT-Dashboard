
import React from 'react';

const Map: React.FC = () => {
    return (
        <div className="bg-card rounded-lg shadow-sm h-full w-full p-2">
            <div className="bg-gray-200 h-full w-full flex items-center justify-center relative overflow-hidden rounded-md">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                    <defs>
                        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                <div className="z-10 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-700">Map View Placeholder</h2>
                </div>
            </div>
        </div>
    );
};

export default Map;