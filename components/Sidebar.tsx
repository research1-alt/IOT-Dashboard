
import React from 'react';
import { DashboardIcon, ManageIcon, ReportsIcon, SettingsIcon, LogoutIcon, ConverterIcon, BillingIcon, ServerIcon } from './Icons';
import { NavView, Member } from '../types';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${active ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} ${!onClick ? 'cursor-not-allowed opacity-60' : ''}`}>
        {icon}
        <span className="ml-4">{label}</span>
    </button>
);

interface SidebarProps {
    currentUser: Member;
    onLogout: () => void;
    onNavigate: (view: NavView) => void;
    activeView: NavView;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout, onNavigate, activeView }) => {
    const userRole = currentUser.role;

    return (
        <aside className="w-64 bg-sidebar text-white flex flex-col">
            <div className="h-20 flex items-center justify-center border-b border-gray-700">
                <h1 className="text-2xl font-bold tracking-wider">TELEMATICS</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <NavItem icon={<DashboardIcon className="w-6 h-6" />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                
                {(userRole === 'Admin' || userRole === 'Fleet Manager') && (
                     <NavItem icon={<ManageIcon className="w-6 h-6" />} label="Manage" active={activeView === 'manage'} onClick={() => onNavigate('manage')} />
                )}

                {(userRole === 'Admin' || userRole === 'Finance Manager') && (
                    <NavItem icon={<BillingIcon className="w-6 h-6" />} label="Billing" active={activeView === 'billing'} onClick={() => onNavigate('billing')} />
                )}
               
                {['Admin', 'OEM Manager', 'Fleet Manager', 'Dealer', 'Customer'].includes(userRole) && (
                    <NavItem icon={<ReportsIcon className="w-6 h-6" />} label="Reports" active={activeView === 'reports'} onClick={() => onNavigate('reports')} />
                )}

                {['Admin', 'Fleet Manager'].includes(userRole) && (
                     <NavItem icon={<ConverterIcon className="w-6 h-6" />} label="Converter" active={activeView === 'converter'} onClick={() => onNavigate('converter')} />
                )}
                
                <NavItem icon={<ServerIcon className="w-6 h-6" />} label="Server Monitor" active={activeView === 'server-monitor'} onClick={() => onNavigate('server-monitor')} />

                {userRole === 'Admin' && (
                    <NavItem icon={<SettingsIcon className="w-6 h-6" />} label="Settings" active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
                )}
            </nav>
            <div className="px-4 py-6 border-t border-gray-700">
                 <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
                    <LogoutIcon className="w-6 h-6" />
                    <span className="ml-4">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
