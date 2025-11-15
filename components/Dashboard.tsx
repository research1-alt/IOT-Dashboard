
import React, { useState } from 'react';
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
import { ConverterPage } from './ConverterPage';
import { TotalDevicesIcon, OnlineDevicesIcon, DistanceIcon, AlertsIcon } from './Icons';
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
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { currentUser, onLogout, onChangeProfile, devices, members } = props;
    const [activeView, setActiveView] = useState<NavView>('dashboard');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showLiveData, setShowLiveData] = useState(false);


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
            change: "+1.5%",
            changeType: 'increase' as 'increase' | 'decrease',
        },
        {
            icon: <OnlineDevicesIcon className="w-8 h-8 text-green-500" />,
            title: "Devices Online",
            value: visibleDevices.filter(d => d.status === 'Driving' || d.status === 'Parked').length.toString(),
            change: "+5",
            changeType: 'increase' as 'increase' | 'decrease',
        },
        {
            icon: <DistanceIcon className="w-8 h-8 text-purple-500" />,
            title: "Total Distance (km)",
            value: "85,670",
            change: "+2.8%",
            changeType: 'increase' as 'increase' | 'decrease',
        },
        {
            icon: <AlertsIcon className="w-8 h-8 text-red-500" />,
            title: "High-Risk Events",
            value: "72",
            change: "-3",
            changeType: 'decrease' as 'increase' | 'decrease',
        },
    ];

    const viewTitles: { [key in NavView]: string } = {
        dashboard: selectedDevice ? (showLiveData ? `Live Data: ${selectedDevice.id}` : `Device Details: ${selectedDevice.id}`) : 'Dashboard',
        manage: 'Management Hub',
        reports: 'Reports',
        converter: 'CAN Log Decoder',
        billing: 'Billing & Finance',
        settings: 'Settings',
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                 if (selectedDevice) {
                    return showLiveData ? (
                        <LiveVehicleDataView 
                            device={selectedDevice} 
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
                    <main className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr_340px] gap-6">
                            <DevicePanel devices={visibleDevices} onSelectDevice={handleSelectDevice} />
                            <Map />
                            <div className="bg-card rounded-lg shadow-sm flex flex-col overflow-hidden">
                               <div className="p-4 border-b border-gray-200"><h3 className="text-xl font-semibold">Fleet Overview</h3></div>
                               <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                                   <div>
                                       <h4 className="text-lg font-semibold mb-2 text-gray-700">Fleet Status</h4>
                                       <div style={{ height: '220px' }}><FleetStatusChart /></div>
                                   </div>
                                   <div>
                                       <h4 className="text-lg font-semibold mb-2 text-gray-700">Recent Alerts</h4><RecentAlerts />
                                   </div>
                               </div>
                            </div>
                        </div>
                    </main>
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
                 return (
                    <main className="flex-1 p-6 lg:p-8">
                        <div className="bg-card p-8 rounded-lg shadow-sm text-center">
                            <h3 className="text-xl font-semibold text-gray-800">System Settings</h3>
                             <p className="mt-4 text-gray-600">
                                This section is reserved for administrative settings and system configuration.
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                (This feature is currently under development.)
                            </p>
                        </div>
                    </main>
                );
            default:
                return null;
        }
    }


    return (
        <div className="flex h-screen bg-background font-sans text-gray-800">
            <Sidebar currentUser={currentUser} onLogout={onLogout} onNavigate={handleNavigate} activeView={activeView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentUser={currentUser} onChangeProfile={onChangeProfile} title={viewTitles[activeView]} />
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
