
import React, { useState } from 'react';
import DeviceManagementPage from './DeviceManagementPage';
import MemberManagement from './MemberManagement';
import { Device, Member, UserRole } from '../types';
import { DeviceIcon, UsersIcon } from './Icons';

interface ManagePageProps {
    currentUser: Member;
    devices: Device[];
    members: Member[];
    onAddDevice: (deviceId: string) => void;
    onAddMultipleDevices: (deviceIds: string[]) => { added: number, duplicates: number };
    onRemoveDevice: (deviceId: string) => void;
    onResetAllDevices: () => void;
    onAddMember: (name: string, email: string, role: UserRole) => void;
    onRemoveMember: (memberId: string) => void;
    onUpdateMemberRole: (memberId: string, role: UserRole) => void;
    onUpdateMemberAssignments: (memberId: string, assignedDevices: string[]) => void;
}

type ManageTab = 'devices' | 'members';

const ManagePage: React.FC<ManagePageProps> = (props) => {
    const { currentUser } = props;
    // Default to 'devices' view for all roles initially.
    const [activeTab, setActiveTab] = useState<ManageTab>('devices');

    const TabButton: React.FC<{
        tabName: ManageTab;
        label: string;
        icon: React.ReactNode;
    }> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );
    
    // Determine which view to show. Fleet Managers only see devices. Admins can switch.
    const showDevices = currentUser.role === 'Fleet Manager' || (currentUser.role === 'Admin' && activeTab === 'devices');
    const showMembers = currentUser.role === 'Admin' && activeTab === 'members';

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Render tabs only for Admin, as Fleet Manager has a single view */}
            {currentUser.role === 'Admin' && (
                 <div className="flex-shrink-0 border-b border-gray-200 bg-card">
                    <div className="px-8">
                        <div className="flex items-center space-x-2 py-3">
                            <TabButton tabName="devices" label="Device Management" icon={<DeviceIcon className="w-5 h-5" />} />
                            <TabButton tabName="members" label="Member Management" icon={<UsersIcon className="w-5 h-5" />} />
                        </div>
                    </div>
                 </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
                {showDevices && (
                    <DeviceManagementPage 
                        devices={props.devices} 
                        onAddDevice={props.onAddDevice}
                        onAddMultipleDevices={props.onAddMultipleDevices}
                        onRemoveDevice={props.onRemoveDevice} 
                        onResetAllDevices={props.onResetAllDevices} 
                    />
                )}

                {showMembers && (
                    <MemberManagement
                        devices={props.devices}
                        members={props.members}
                        onAddMember={props.onAddMember}
                        onRemoveMember={props.onRemoveMember}
                        onUpdateMemberRole={props.onUpdateMemberRole}
                        onUpdateMemberAssignments={props.onUpdateMemberAssignments}
                    />
                )}
            </div>
        </div>
    );
};

export default ManagePage;