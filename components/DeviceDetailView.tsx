
import React from 'react';
import { Device } from '../types';
import { ArrowLeftIcon, EllipsisVerticalIcon, ReportsIcon } from './Icons';

interface DeviceDetailViewProps {
  device: Device;
  onBack: () => void;
  onViewLiveData: () => void;
}

const InfoItem: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-green-600' : 'text-primary-600'}`}>{value || '-'}</p>
    </div>
);

const MapPlaceholder: React.FC = () => (
    <div className="w-full h-full bg-gray-200 relative overflow-hidden flex items-center justify-center text-gray-700">
        {/* Placeholder for map background */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-40">
            <defs>
                <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Mock map elements */}
        <div className="absolute top-8 left-4 text-xl font-bold opacity-50">Faridabad</div>
        <div className="absolute bottom-12 right-10 text-lg font-bold opacity-50">Palwal</div>
        <div className="absolute bottom-4 right-2 text-xs text-gray-500 opacity-60">
             Google | Map Data
        </div>

        {/* Vehicle Icon on Map */}
        <img src="https://i.imgur.com/eB4BCi3.png" alt="Vehicle" className="w-20 h-auto z-10 transform -rotate-45" />

        {/* Fullscreen button */}
        <button className="absolute top-2 right-2 bg-white p-1.5 rounded-sm shadow-md z-20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m4.5 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
        </button>
    </div>
);

const DeviceDetailView: React.FC<DeviceDetailViewProps> = ({ device, onBack, onViewLiveData }) => {
    const isOnline = device.status === 'Driving' || device.status === 'Parked';
  
    return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
             <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
            </button>
            <button
                onClick={onViewLiveData}
                className="flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
                <ReportsIcon className="w-5 h-5 mr-2" />
                View Live CAN Data
            </button>
        </div>

        <div className="bg-card border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-stretch gap-4">
            {/* Vehicle Image & Status */}
            <div className="relative flex-shrink-0 w-full md:w-56 h-48 bg-gray-50 rounded-l-md">
                <div className={`absolute left-0 top-0 bottom-0 w-10 bg-pink-600 rounded-l-md flex items-center justify-center`}>
                    <span className="text-white font-bold tracking-widest uppercase transform -rotate-90 whitespace-nowrap">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                 <img src={device.imageUrl || 'https://via.placeholder.com/200'} alt={device.vehicleModel} className="w-full h-full object-contain pl-10" />
            </div>

            {/* Vehicle Details */}
            <div className="flex-1 text-gray-800 relative">
                 <button className="absolute top-0 right-0 text-gray-500 hover:text-gray-800">
                    <EllipsisVerticalIcon className="w-6 h-6" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 h-full content-center">
                    <InfoItem label="Owner Name" value={device.ownerName} />
                    <InfoItem label="Manufacturing Year" value={device.manufacturingYear} />
                    <InfoItem label="VIN No." value={device.vin} />
                    <InfoItem label="Fleet" value={device.fleet} />
                    <InfoItem label="Registration No" value={device.registrationNo} />
                    <InfoItem label="Location of Origin" value={device.locationOfOrigin} />
                    <InfoItem label="Chassis No" value={device.chassisNo} />
                    <InfoItem label="Last Updated" value={device.lastUpdated} />
                    <InfoItem label="Battery UID" value={device.batteryUID} />
                    {/* Show Server Timestamp if available to prove server data source */}
                    {device._serverTimestamp ? (
                        <InfoItem label="Server Timestamp" value={new Date(device._serverTimestamp).toLocaleTimeString()} highlight />
                    ) : (
                        <InfoItem label="CAN Timestamp" value={device.canTimestamp} />
                    )}
                    <InfoItem label="Vehicle Model" value={device.vehicleModel} />
                    <InfoItem label="GPS Timestamp" value={device.gpsTimestamp} />
                </div>
            </div>

            {/* Map */}
            <div className="flex-shrink-0 w-full md:w-80 h-64 rounded-lg overflow-hidden">
                <MapPlaceholder />
            </div>
        </div>
    </main>
  );
};

export default DeviceDetailView;
