
import React from 'react';
import { StatCardProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50';

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
            <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <div className="flex items-baseline space-x-3">
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                        {change && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${changeColor}`}>
                                {isIncrease ? '↑' : '↓'} {change}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};

export default StatCard;