

import React, { useState } from 'react';
import { SearchIcon, BellIcon, UserCircleIcon, SwitchProfileIcon, RefreshIcon } from './Icons';
import { Member } from '../types';

interface HeaderProps {
    currentUser: Member;
    onChangeProfile: () => void;
    title: string;
    onRefresh?: () => Promise<void> | void;
    lastSyncTime?: string | null;
    isSidebarVisible: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onChangeProfile, title, onRefresh, lastSyncTime, isSidebarVisible, toggleSidebar }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setTimeout(() => setIsRefreshing(false), 500); // Minimum spin time for visual feedback
            }
        }
    };

    return (
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 flex-shrink-0 z-10">
            <div className="flex items-center space-x-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all"
                    aria-label={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">System: Active • {currentUser.role}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-8">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <SearchIcon className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search devices, alerts, or logs..." 
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400 w-full ml-3" 
                    />
                </div>

                <div className="flex items-center space-x-4">
                    {onRefresh && (
                        <button 
                            onClick={handleRefresh}
                            className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all p-2.5 rounded-xl hover:bg-blue-50 group"
                            aria-label="Sync Data"
                            disabled={isRefreshing}
                        >
                            <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                        </button>
                    )}
                    
                    <button 
                        onClick={onChangeProfile} 
                        className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all p-2.5 rounded-xl hover:bg-blue-50 group"
                        aria-label="Change Profile"
                    >
                        <SwitchProfileIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    </button>

                    <button className="text-slate-400 hover:text-blue-600 transition-all p-2.5 rounded-xl hover:bg-blue-50 relative group">
                        <BellIcon className="w-6 h-6" />
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                </div>

                <div className="h-10 w-px bg-slate-200"></div>

                <div className="flex items-center space-x-4 pl-2">
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] font-medium text-slate-500">{currentUser.email}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-white">
                        <span className="text-white font-bold text-lg">{currentUser.name.charAt(0)}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;