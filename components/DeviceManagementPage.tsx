



import React, { useState } from 'react';
import { Device } from '../types';
import { TrashIcon, FileUploadIcon } from './Icons';

// --- PROPS INTERFACE ---
interface DeviceManagementPageProps {
    devices: Device[];
    onAddDevice: (deviceId: string) => void;
    onAddMultipleDevices: (deviceIds: string[]) => { added: number, duplicates: number };
    onRemoveDevice: (deviceId: string) => void;
    onResetAllDevices: () => void;
}

// --- TYPE DEFINITIONS & CONSTANTS ---
const statusColors: { [key in Device['status']]: string } = {
    'Driving': 'bg-green-100 text-green-800', 'Parked': 'bg-blue-100 text-blue-800', 'Offline': 'bg-gray-200 text-gray-800', 'Maintenance': 'bg-yellow-100 text-yellow-800',
};
type ModalContent = { type: 'device'; data: Device } | { type: 'reset' };

// --- HELPER COMPONENTS ---
const ConfirmationModal: React.FC<{
    content: ModalContent | null;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ content, onClose, onConfirm }) => {
    if (!content) return null;

    let title = '';
    let message = '';
    let confirmText = '';
    
    if (content.type === 'device') {
        title = 'Confirm Device Removal';
        message = `Are you sure you want to remove device "${content.data.id}"? This action cannot be undone.`;
        confirmText = 'Remove';
    } else if (content.type === 'reset') {
        title = 'Confirm Reset All Devices';
        message = 'Are you sure you want to restore the default device list? Any newly added devices will be removed.';
        confirmText = 'Reset All';
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Cancel</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const DeviceManagementPage: React.FC<DeviceManagementPageProps> = ({ devices, onAddDevice, onAddMultipleDevices, onRemoveDevice, onResetAllDevices }) => {
    // --- STATE MANAGEMENT ---
    const [newDeviceId, setNewDeviceId] = useState('');
    const [deviceError, setDeviceError] = useState('');
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [uploadStatus, setUploadStatus] = useState<{ added: number, duplicates: number, error?: string } | null>(null);
    
    // --- EVENT HANDLERS ---
    const handleAddDeviceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeviceId.trim()) { setDeviceError('Device ID cannot be empty.'); return; }
        if (devices.some(d => d.id === newDeviceId.trim())) { setDeviceError('This Device ID already exists.'); return; }
        onAddDevice(newDeviceId.trim());
        setNewDeviceId(''); setDeviceError('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus(null);

        if (!file.name.toLowerCase().endsWith('.txt')) {
            setUploadStatus({ added: 0, duplicates: 0, error: 'Please upload a .txt file.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                const uniqueIdsFromFile = [...new Set(lines)]; 
                const result = onAddMultipleDevices(uniqueIdsFromFile);
                setUploadStatus(result);
            }
        };
        reader.onerror = () => {
             setUploadStatus({ added: 0, duplicates: 0, error: 'Failed to read the file.' });
        }
        reader.readAsText(file);
        e.target.value = '';
    };
    
    const handleConfirmAction = () => {
        if (!modalContent) return;
        if (modalContent.type === 'device') {
            onRemoveDevice(modalContent.data.id);
        } else if (modalContent.type === 'reset') {
            onResetAllDevices();
        }
        setModalContent(null);
    };

    // --- RENDER ---
    return (
        <>
            <ConfirmationModal content={modalContent} onClose={() => setModalContent(null)} onConfirm={handleConfirmAction} />

            <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8">
                {/* SECTION: Add Device */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Add Devices</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                       <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Add a Single Device</h4>
                            <form onSubmit={handleAddDeviceSubmit} className="flex flex-col sm:flex-row items-start gap-2">
                                <div className="w-full">
                                    <label htmlFor="deviceId" className="sr-only">Device ID</label>
                                    <input id="deviceId" type="text" value={newDeviceId} onChange={(e) => { setNewDeviceId(e.target.value); if(deviceError) setDeviceError(''); }} placeholder="Enter new Device ID" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${deviceError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-primary-500'}`} />
                                    {deviceError && <p className="text-red-500 text-sm mt-1">{deviceError}</p>}
                                </div>
                                <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors flex-shrink-0">Add Device</button>
                            </form>
                        </div>
                       
                        <div className="md:border-l md:pl-8 border-gray-200">
                            <h4 className="font-semibold text-gray-700 mb-3">Upload from File</h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-full flex flex-col justify-center items-center hover:border-primary-500 transition-colors">
                                <label htmlFor="bulk-upload" className="cursor-pointer w-full">
                                    <FileUploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Upload a <span className="font-semibold text-primary-600">.txt</span> file with one Device ID per line.
                                    </p>
                                    <input id="bulk-upload" type="file" className="sr-only" accept=".txt" onChange={handleFileUpload} />
                                </label>
                            </div>
                            {uploadStatus && (
                                <div className={`mt-3 p-3 rounded-md text-sm ${uploadStatus.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                                    {uploadStatus.error ? (
                                        <p>{uploadStatus.error}</p>
                                    ) : (
                                        <p>
                                            Upload complete. Added <span className="font-bold">{uploadStatus.added}</span> new devices. 
                                            Found and ignored <span className="font-bold">{uploadStatus.duplicates}</span> duplicate or existing devices.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION: Device List */}
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Registered Devices ({devices.length})</h3>
                        <div className="flex items-center space-x-4">
                            {devices.length > 0 && (
                                <button 
                                    onClick={() => setModalContent({ type: 'reset' })}
                                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Reset All
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-auto max-h-[calc(100vh-480px)]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">{devices.length > 0 ? devices.map((device) => (<tr key={device.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.id}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[device.status]}`}>{device.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setModalContent({ type: 'device', data: device })} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Remove ${device.id}`}><TrashIcon className="w-5 h-5" /></button></td></tr>)) : (<tr><td colSpan={3} className="text-center py-10 text-gray-500">No devices registered yet.</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DeviceManagementPage;