
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FleetStatusData } from '../types';

const data: FleetStatusData[] = [
    { name: 'Online', value: 1180, color: '#10B981' },
    { name: 'Offline', value: 50, color: '#F59E0B' },
    { name: 'Maintenance', value: 20, color: '#EF4444' },
];

const FleetStatusChart: React.FC = () => {
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