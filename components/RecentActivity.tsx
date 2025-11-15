
import React from 'react';
import { Alert } from '../types';
import { SpeedingIcon, HarshBrakingIcon, GeofenceIcon } from './Icons';

const mockAlerts: Alert[] = [];

const alertIcons = {
    'Speeding': <SpeedingIcon className="w-5 h-5 text-red-500" />,
    'Harsh Braking': <HarshBrakingIcon className="w-5 h-5 text-yellow-500" />,
    'Geofence Exit': <GeofenceIcon className="w-5 h-5 text-blue-500" />,
};

const RecentAlerts: React.FC = () => {
    return (
        <div className="space-y-4">
            {mockAlerts.length > 0 ? mockAlerts.map((alert, index) => (
                <div key={alert.id} className={`flex items-center space-x-4 p-3 ${index < mockAlerts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="bg-gray-100 p-2 rounded-full">
                        {alertIcons[alert.type]}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{alert.type}</p>
                        <p className="text-sm text-gray-500">Device: {alert.device}</p>
                    </div>
                    <p className="text-sm text-gray-400">{alert.timestamp}</p>
                </div>
            )) : (
                <div className="text-center py-4 text-gray-500">
                    No recent alerts.
                </div>
            )}
        </div>
    );
};

export default RecentAlerts;