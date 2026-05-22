
import React, { useState } from 'react';
import BatteryPerformancePage from './BatteryPerformancePage';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './Card';
import FleetStatusChart from './SalesChart';
import RecentAlerts from './RecentActivity';
import Map from './Map';
import DevicePanel from './DevicePanel';
import ManagePage from './ManagePage';
import ReportsPage from './ReportsPage';
import BillingPage from './BillingPage';
import DeviceDetailView from './DeviceDetailView';
import LiveVehicleDataView from './LiveVehicleDataView';
import LiveMapDashboard from './LiveMapDashboard';
import SettingsPage from './SettingsPage';
import ServerDataPage from './ServerDataPage';
import ServiceManagementPage from './ServiceManagementPage';
import { ConverterPage } from './ConverterPage';
import { TotalDevicesIcon, OnlineDevicesIcon, OfflineDevicesIcon, AlertsIcon, SettingsIcon } from './Icons';
import { AlertCircle } from 'lucide-react';
import { Device, NavView, Member, UserRole } from '../types';

interface DashboardProps {
    currentUser: Member;
    onLogout: () => void;
    onChangeProfile: () => void;
    devices: Device[];
    members: Member[];
    onAddDevice: (deviceId: string) => void;
    onUpdateDeviceDetails: (deviceId: string, details: Partial<Omit<Device, 'id' | 'status'>>) => void;
    onAttachLog: (deviceId: string, content: string) => void;
    onAddMember: (name: string, email: string, role: UserRole) => void;
    onUpdateMemberRole: (memberId: string, role: UserRole) => void;
    onUpdateMemberAssignments: (memberId: string, assignedDevices: string[]) => void;
    onRefresh: () => Promise<void>;
    lastSyncTime: string | null;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { currentUser, onLogout, onChangeProfile, devices, members, onRefresh, lastSyncTime } = props;
    const [activeView, setActiveView] = useState<NavView>('dashboard');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showLiveData, setShowLiveData] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);


    const handleNavigate = (view: NavView) => {
        setSelectedDevice(null); // Deselect device when navigating away
        setShowLiveData(false);
        setActiveView(view);
    };

    const handleSelectDevice = (device: Device) => {
        setShowLiveData(false);
        setSelectedDevice(device);
    }

    const visibleDevices = (currentUser.role === 'Admin')
        ? devices 
        : devices.filter(d => currentUser.assignedDevices.includes(d.id));
    
    const stats = [
        {
            icon: <TotalDevicesIcon className="w-8 h-8 text-blue-500" />,
            title: "Total Devices",
            value: visibleDevices.length.toString(),
            change: "0%",
            changeType: 'increase' as 'increase' | 'decrease',
        },
        {
            icon: <OnlineDevicesIcon className="w-8 h-8 text-green-500" />,
            title: "Devices Online",
            value: visibleDevices.filter(d => {
                // Logic: Device last time stamp = Real Time Stamp (using current date as proxy for real time)
                // Assuming lastUpdated is the timestamp to check
                const last = new Date(d.lastUpdated || 0).getTime();
                const now = new Date().getTime();
                // If within 5 minutes, consider online
                return (now - last) < 5 * 60 * 1000;
            }).length.toString(),
            change: "0",
            changeType: 'increase' as 'increase' | 'decrease',
        },
        {
            icon: <OfflineDevicesIcon className="w-8 h-8 text-gray-400" />,
            title: "Devices Offline",
            value: visibleDevices.filter(d => {
                const last = new Date(d.lastUpdated || 0).getTime();
                const now = new Date().getTime();
                return (now - last) >= 5 * 60 * 1000;
            }).length.toString(),
            change: "0",
            changeType: 'decrease' as 'increase' | 'decrease',
        },
        {
            icon: <AlertsIcon className="w-8 h-8 text-red-500" />,
            title: "High-Risk Events",
            value: "0",
            change: "0",
            changeType: 'decrease' as 'increase' | 'decrease',
        },
    ];

    const viewTitles: { [key in NavView]: string } = {
        dashboard: selectedDevice ? (showLiveData ? `Live Data: ${selectedDevice.id}` : `Device Details: ${selectedDevice.id}`) : 'Dashboard',
        'live-map': 'Live Fleet Map',
        'live-alerts': 'Live Alerts',
        'battery-health': 'Battery Performance',
        analytics: 'Fleet Analytics',
        reports: 'Reports',
        'raw-data': 'Raw Telemetry Data',
        'vehicle-twin': 'Digital Vehicle Twin',
        'diy-lab': 'DIY Lab',
        manage: 'Management Hub',
        converter: 'CAN Log Decoder',
        billing: 'Billing & Finance',
        settings: 'Settings',
        'server-monitor': 'Server Data Monitor',
        service: 'Service Management',
    };

    const renderContent = () => {
        switch (activeView) {
            case 'service':
                return <ServiceManagementPage />;
            case 'dashboard':
            case 'analytics':
                 if (selectedDevice) {
                    return showLiveData ? (
                        <LiveVehicleDataView 
                            device={selectedDevice} 
                            devices={visibleDevices}
                            onBack={() => setShowLiveData(false)} 
                        />
                    ) : (
                        <DeviceDetailView 
                            device={selectedDevice} 
                            onBack={() => setSelectedDevice(null)} 
                            onViewLiveData={() => setShowLiveData(true)}
                        />
                    );
                }
                return (
                    <main className="flex-1 flex flex-col p-10 space-y-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr_400px] gap-8">
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Devices</h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{visibleDevices.length} Total</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <DevicePanel devices={visibleDevices} onSelectDevice={handleSelectDevice} />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative group">
                                <Map />
                                <div className="absolute top-6 right-6 flex flex-col space-y-2">
                                    <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                    <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900">Fleet Overview</h3>
                                </div>
                                <div className="flex-1 p-6 space-y-10 overflow-y-auto custom-scrollbar">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fleet Status</h4>
                                            <button className="text-xs font-bold text-blue-600 hover:underline">View Details</button>
                                        </div>
                                        <div style={{ height: '240px' }} className="flex items-center justify-center">
                                            <FleetStatusChart devices={visibleDevices} />
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Alerts</h4>
                                            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                                        </div>
                                        <RecentAlerts />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                );
            case 'live-map':
                if (visibleDevices.length === 0) {
                    return (
                        <div className="flex-1 flex items-center justify-center bg-slate-50">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-10 h-10 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Devices Available</h3>
                                <p className="text-slate-500 mt-2">You don't have any devices assigned to your account.</p>
                                <button 
                                    onClick={() => handleNavigate('dashboard')}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <LiveMapDashboard 
                        devices={visibleDevices} 
                        initialDevice={selectedDevice || visibleDevices[0]} 
                        onBack={() => handleNavigate('dashboard')} 
                    />
                );
            case 'live-alerts':
                return (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900">Live Alerts</h3>
                            <p className="text-slate-500 mt-2">Live Alerts dashboard under development.</p>
                        </div>
                    </div>
                );
            case 'battery-health':
                return <BatteryPerformancePage devices={visibleDevices} />;
            case 'raw-data':
            case 'vehicle-twin':
            case 'diy-lab':
                return (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SettingsIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{viewTitles[activeView]}</h3>
                            <p className="text-slate-500 mt-2">This feature is currently under development.</p>
                        </div>
                    </div>
                );
            case 'manage':
                 return (currentUser.role === 'Admin' || currentUser.role === 'Fleet Manager') ? (
                    <ManagePage 
                        currentUser={currentUser}
                        devices={visibleDevices} 
                        members={members}
                        onAddDevice={props.onAddDevice}
                        onUpdateDeviceDetails={props.onUpdateDeviceDetails}
                        onAttachLog={props.onAttachLog}
                        onAddMember={props.onAddMember}
                        onUpdateMemberRole={props.onUpdateMemberRole}
                        onUpdateMemberAssignments={props.onUpdateMemberAssignments}
                    />
                ) : null;
            case 'reports':
                return <ReportsPage devices={visibleDevices} />;
            case 'converter':
                return <ConverterPage />;
            case 'billing':
                return <BillingPage />;
            case 'settings':
                 return <SettingsPage onConfigSave={onRefresh} devices={devices} members={members} />;
            case 'server-monitor':
                return <ServerDataPage />;
            default:
                return null;
        }
    }


    return (
        <div className="flex h-screen bg-background font-sans text-gray-800">
            {isSidebarVisible && <Sidebar currentUser={currentUser} onLogout={onLogout} onNavigate={handleNavigate} activeView={activeView} />}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    currentUser={currentUser} 
                    onChangeProfile={onChangeProfile} 
                    title={viewTitles[activeView]} 
                    onRefresh={onRefresh} 
                    lastSyncTime={lastSyncTime}
                    isSidebarVisible={isSidebarVisible}
                    toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
                />
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
