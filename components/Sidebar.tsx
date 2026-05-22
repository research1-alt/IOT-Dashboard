
import React from 'react';
import { 
    DashboardIcon, 
    ManageIcon, 
    ReportsIcon, 
    SettingsIcon, 
    LogoutIcon, 
    ConverterIcon, 
    BillingIcon, 
    ServerIcon, 
    MapPinIcon,
    BatteryIcon,
    DatabaseIcon,
    TwinIcon,
    LabIcon,
    AlertsIcon
} from './Icons';
import { NavView, Member } from '../types';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick} 
        disabled={!onClick} 
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-left group ${
            active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        } ${!onClick ? 'cursor-not-allowed opacity-60' : ''}`}
    >
        <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
            {icon}
        </div>
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
        <aside className="w-72 bg-[#0f172a] text-white flex flex-col border-r border-slate-800 shadow-2xl z-20">
            <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <DashboardIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white uppercase">OSM Telematics</h1>
                </div>
            </div>
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Insights</p>
                </div>
                <NavItem icon={<DashboardIcon className="w-5 h-5" />} label="Analytics" active={activeView === 'analytics'} onClick={() => onNavigate('analytics')} />
                <NavItem icon={<MapPinIcon className="w-5 h-5" />} label="Live Tracking" active={activeView === 'live-map'} onClick={() => onNavigate('live-map')} />
                <NavItem icon={<AlertsIcon className="w-5 h-5" />} label="Live Alerts" active={activeView === 'live-alerts'} onClick={() => onNavigate('live-alerts')} />
                <NavItem icon={<BatteryIcon className="w-5 h-5" />} label="Battery Health" active={activeView === 'battery-health'} onClick={() => onNavigate('battery-health')} />
                <NavItem icon={<DatabaseIcon className="w-5 h-5" />} label="Raw Data" active={activeView === 'raw-data'} onClick={() => onNavigate('raw-data')} />
                <NavItem icon={<TwinIcon className="w-5 h-5" />} label="Vehicle Twin" active={activeView === 'vehicle-twin'} onClick={() => onNavigate('vehicle-twin')} />
                <NavItem icon={<LabIcon className="w-5 h-5" />} label="DIY Lab" active={activeView === 'diy-lab'} onClick={() => onNavigate('diy-lab')} />

                <div className="px-4 mt-6 mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
                </div>
                <NavItem icon={<ManageIcon className="w-5 h-5" />} label="Fleets" active={activeView === 'manage'} onClick={() => onNavigate('manage')} />
                <NavItem icon={<SettingsIcon className="w-5 h-5" />} label="Users" active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
            </nav>
            <div className="p-6 border-t border-slate-800/50 bg-slate-900/30">
                 <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
                    <LogoutIcon className="w-5 h-5" />
                    <span className="ml-4">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
