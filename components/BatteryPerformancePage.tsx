import React from 'react';
import { Device } from '../types';
import { ExternalLink } from 'lucide-react';

interface BatteryPerformancePageProps {
    devices: Device[];
}

const BatteryPerformancePage: React.FC<BatteryPerformancePageProps> = ({ devices }) => {
    return (
        <div className="flex-1 p-10 bg-slate-50 overflow-y-auto">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Battery Performance</h2>
                
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-64">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Dates</label>
                        <select className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                            <option>Yesterday</option>
                            <option>Today</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <span>Show</span>
                        <select className="p-1 border border-slate-200 rounded">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">#</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">VIN</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Model</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">City</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Avg. Range (Kms)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cumulative Distance (Kms)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cumulative Charge Cycles</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cumulative SoC Rise(%)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cumulative SoC Drop(%)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cum. Energy Consumption (kWh)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Avg. Energy Consumption (kWh)</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">More Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device, index) => (
                                <tr key={device.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 text-sm text-slate-600">{index + 1}</td>
                                    <td className="p-4 text-sm font-bold text-slate-900">{device.id}</td>
                                    <td className="p-4 text-sm text-slate-600">{device.vehicleModel || 'N/A'}</td>
                                    <td className="p-4 text-sm text-slate-600">N/A</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">0</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BatteryPerformancePage;
