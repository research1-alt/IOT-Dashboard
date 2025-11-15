
import React from 'react';
import { StatCardProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">{value}</p>
                    {change && (
                        <span className={`text-sm font-semibold ${changeColor}`}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;