
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Device, FleetStatusData } from '../types';

interface FleetStatusChartProps {
    devices: Device[];
}

const FleetStatusChart: React.FC<FleetStatusChartProps> = ({ devices }) => {
    const onlineCount = devices.filter(d => d.status === 'Driving' || d.status === 'Parked').length;
    const offlineCount = devices.filter(d => d.status === 'Offline').length;
    const maintenanceCount = devices.filter(d => d.status === 'Maintenance').length;
    const storedCount = devices.filter(d => d.status === 'Stored').length;

    const data: FleetStatusData[] = [
        { name: 'Online', value: onlineCount, color: '#10B981' },
        { name: 'Offline', value: offlineCount, color: '#94A3B8' },
        { name: 'Maintenance', value: maintenanceCount, color: '#F59E0B' },
        { name: 'Stored', value: storedCount, color: '#6366F1' },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                    }}
                />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default FleetStatusChart;