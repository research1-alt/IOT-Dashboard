

import React, { useState, useEffect } from 'react';
import { Device, Member, UserRole } from '../types';
import { MailIcon, UserCircleIcon, CheckCircleIcon } from './Icons';

// --- PROPS INTERFACE ---
interface MemberManagementProps {
    devices: Device[];
    members: Member[];
    onAddMember: (name: string, email: string, role: UserRole) => void;
    onUpdateMemberRole: (memberId: string, role: UserRole) => void;
    onUpdateMemberAssignments: (memberId: string, assignedDevices: string[]) => void;
    onUpdateDeviceDetails: (deviceId: string, details: Partial<Omit<Device, 'id' | 'status'>>) => void;
}

// Roles that can be assigned by an Admin. 'Admin' is excluded.
const assignableRoles: UserRole[] = [
    'OEM Manager',
    'Finance Manager',
    'Fleet Manager',
    'Dealer',
    'Customer',
];

// --- HELPER COMPONENT (Moved outside) ---
// This is defined outside the modal component to prevent it from being re-created on every render,
// which was causing the inputs to lose focus and become uneditable.
const DeviceDetailFormInput: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    fullWidth?: boolean;
}> = ({ label, name, value, onChange, type = 'text', fullWidth = false }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
        />
    </div>
);


// --- HELPER: EDIT DEVICE DETAILS MODAL ---
const EditDeviceDetailsModal: React.FC<{
    device: Device;
    onClose: () => void;
    onSave: (deviceId: string, details: Partial<Omit<Device, 'id' | 'status'>>) => void;
}> = ({ device, onClose, onSave }) => {
    const [formState, setFormState] = useState({
        ownerName: device.ownerName || '',
        vin: device.vin || '',
        registrationNo: device.registrationNo || '',
        chassisNo: device.chassisNo || '',
        batteryUID: device.batteryUID || '',
        vehicleModel: device.vehicleModel || '',
        manufacturingYear: device.manufacturingYear || new Date().getFullYear(),
        fleet: device.fleet || '',
        locationOfOrigin: device.locationOfOrigin || '',
        imageUrl: device.imageUrl || 'https://i.imgur.com/eB4BCi3.png',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(device.id, formState);
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true">
            <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Edit Details for {device.id}</h3>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DeviceDetailFormInput label="Owner Name" name="ownerName" value={formState.ownerName} onChange={handleChange} />
                        <DeviceDetailFormInput label="Vehicle Model" name="vehicleModel" value={formState.vehicleModel} onChange={handleChange} />
                        <DeviceDetailFormInput label="VIN No." name="vin" value={formState.vin} onChange={handleChange} />
                        <DeviceDetailFormInput label="Registration No." name="registrationNo" value={formState.registrationNo} onChange={handleChange} />
                        <DeviceDetailFormInput label="Chassis No." name="chassisNo" value={formState.chassisNo} onChange={handleChange} />
                        <DeviceDetailFormInput label="Battery UID" name="batteryUID" value={formState.batteryUID} onChange={handleChange} />
                        <DeviceDetailFormInput label="Fleet" name="fleet" value={formState.fleet} onChange={handleChange} />
                        <DeviceDetailFormInput label="Location of Origin" name="locationOfOrigin" value={formState.locationOfOrigin} onChange={handleChange} />
                        <DeviceDetailFormInput label="Manufacturing Year" name="manufacturingYear" type="number" value={formState.manufacturingYear} onChange={handleChange} />
                        <DeviceDetailFormInput label="Image URL" name="imageUrl" value={formState.imageUrl} onChange={handleChange} fullWidth/>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Save Details</button>
                </div>
            </form>
        </div>
    );
};


// --- HELPER: ASSIGN DEVICES MODAL ---
const AssignDevicesModal: React.FC<{
    member: Member;
    allDevices: Device[];
    onClose: () => void;
    onSave: (memberId: string, assignedDeviceIds: string[]) => void;
    onEditDeviceDetails: (device: Device) => void;
}> = ({ member, allDevices, onClose, onSave, onEditDeviceDetails }) => {
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set(member.assignedDevices));

    const handleCheckboxChange = (deviceId: string) => {
        const newSelection = new Set(selectedDevices);
        newSelection.has(deviceId) ? newSelection.delete(deviceId) : newSelection.add(deviceId);
        setSelectedDevices(newSelection);
    };

    const handleSave = () => {
        onSave(member.id, Array.from(selectedDevices));
        onClose();
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Assign Devices to {member.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Select devices and edit their details as needed.</p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {allDevices.length > 0 ? (
                        <div className="space-y-2">
                            {allDevices.map(device => (
                                <div key={device.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                                    <label className="flex items-center cursor-pointer flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedDevices.has(device.id)}
                                            onChange={() => handleCheckboxChange(device.id)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-800">{device.id}</span>
                                    </label>
                                    <button 
                                        onClick={() => onEditDeviceDetails(device)} 
                                        className="text-sm text-primary-600 hover:text-primary-800 font-medium px-2 py-1 rounded hover:bg-primary-100 transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No devices available to assign.</p>
                    )}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Save Assignments
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const MemberManagement: React.FC<MemberManagementProps> = ({ devices, members, onAddMember, onUpdateMemberRole, onUpdateMemberAssignments, onUpdateDeviceDetails }) => {
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<UserRole>('Customer');
    const [error, setError] = useState('');
    const [memberToAssign, setMemberToAssign] = useState<Member | null>(null);
    const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newMemberName.trim() || !newMemberEmail.trim()) {
            setError('Name and email cannot be empty.'); return;
        }
        if (members.some(m => m.email.toLowerCase() === newMemberEmail.trim().toLowerCase())) {
            setError('A member with this email already exists.'); return;
        }
        onAddMember(newMemberName.trim(), newMemberEmail.trim(), newMemberRole);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberRole('Customer');
    };

    const handleSaveDeviceDetails = (deviceId: string, details: Partial<Omit<Device, 'id' | 'status'>>) => {
        onUpdateDeviceDetails(deviceId, details);
        setDeviceToEdit(null); // Close the details modal upon saving
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    return (
        <>
            {showSaveSuccess && (
                <div className="fixed top-24 right-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg z-50 flex items-center" role="alert">
                    <CheckCircleIcon className="w-6 h-6 mr-3"/>
                    <div>
                        <p className="font-bold">Success!</p>
                        <p className="text-sm">Device details have been saved.</p>
                    </div>
                </div>
            )}

            {memberToAssign && (
                <AssignDevicesModal 
                    member={memberToAssign} 
                    allDevices={devices} 
                    onClose={() => setMemberToAssign(null)} 
                    onSave={onUpdateMemberAssignments} 
                    onEditDeviceDetails={setDeviceToEdit}
                />
            )}
            
            {deviceToEdit && (
                 <EditDeviceDetailsModal
                    key={deviceToEdit.id}
                    device={deviceToEdit}
                    onClose={() => setDeviceToEdit(null)}
                    onSave={handleSaveDeviceDetails}
                />
            )}

            <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8">
                {/* SECTION: Add Member */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-3">Add New Member</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div className="relative">
                            <label htmlFor="memberName" className="sr-only">Member Name</label>
                            <UserCircleIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input id="memberName" type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Full Name" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white border-gray-300 focus:ring-primary-500" />
                        </div>
                        <div className="relative">
                            <label htmlFor="memberEmail" className="sr-only">Member Email</label>
                            <MailIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input id="memberEmail" type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email Address" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white border-gray-300 focus:ring-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="memberRole" className="sr-only">Role</label>
                            <select id="memberRole" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as UserRole)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white border-gray-300 focus:ring-primary-500">
                                {assignableRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Add Member</button>
                        {error && <p className="text-red-500 text-sm mt-1 md:col-span-4">{error}</p>}
                    </form>
                </div>
                {/* SECTION: Member List */}
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200"><h3 className="text-xl font-semibold text-gray-800">Registered Members ({members.length})</h3></div>
                    <div className="overflow-auto max-h-[calc(100vh-450px)]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Devices</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{member.name}</div><div className="text-sm text-gray-500">{member.email}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {member.role === 'Admin' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">Admin</span>
                                        ) : (
                                            <select 
                                                value={member.role === 'Member' ? 'Customer' : member.role} // Default 'Member' to 'Customer'
                                                onChange={(e) => onUpdateMemberRole(member.id, e.target.value as UserRole)}
                                                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                                            >
                                                {assignableRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{member.role === 'Admin' ? 'All' : member.assignedDevices.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {member.role !== 'Admin' && (
                                            <button onClick={() => setMemberToAssign(member)} className="text-primary-600 hover:text-primary-900">
                                                {member.assignedDevices.length > 0 ? 'Edit Assigned Devices' : 'Assign Devices'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
};

export default MemberManagement;