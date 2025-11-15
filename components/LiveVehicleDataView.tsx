import React from 'react';
import { Device } from '../types';
import { ArrowLeftIcon, CheckCircleIcon } from './Icons';
import { vehicleHeaderStats, canDataDetails } from '../data/mock-live-data';

interface LiveVehicleDataViewProps {
  device: Device;
  onBack: () => void;
}

const HeaderStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

const CanDataItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-start space-x-3">
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>
            <p className="text-sm text-gray-500 leading-tight">{value}</p>
        </div>
    </div>
);

const LiveVehicleDataView: React.FC<LiveVehicleDataViewProps> = ({ device, onBack }) => {
  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    <span>Back to Device Details</span>
                </button>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">
                 {/* --- Vehicle Details Header --- */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h2>
                    <div className="border border-orange-200 rounded-md p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <HeaderStat label="Time" value={vehicleHeaderStats.time} />
                        <HeaderStat label="OBD Status" value={vehicleHeaderStats.obdStatus} />
                        <HeaderStat label="Odometer" value={vehicleHeaderStats.odometer} />
                        <HeaderStat label="Speed" value={vehicleHeaderStats.speed} />
                        <HeaderStat label="Ignition" value={vehicleHeaderStats.ignition} />
                    </div>
                </div>

                {/* --- CAN Details Grid --- */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">CAN Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                         {canDataDetails.map((item, index) => (
                            <CanDataItem key={index} label={item.label} value={item.value} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
};

export default LiveVehicleDataView;
