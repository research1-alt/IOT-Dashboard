
import React from 'react';
import { SearchIcon, BellIcon, UserCircleIcon, SwitchProfileIcon } from './Icons';
import { Member } from '../types';

interface HeaderProps {
    currentUser: Member;
    onChangeProfile: () => void;
    title: string;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onChangeProfile, title }) => {
    return (
        <header className="h-20 bg-card border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">Viewing as: {currentUser.role}</p>
            </div>
            <div className="flex items-center space-x-6">
                <button 
                    onClick={onChangeProfile} 
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Change Profile"
                >
                    <SwitchProfileIcon className="w-5 h-5 mr-2" />
                    <span>Change Profile</span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="relative">
                    <input type="text" placeholder="Search..." className="bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 w-56" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700 relative">
                    <BellIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-9 h-9 text-gray-400" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
