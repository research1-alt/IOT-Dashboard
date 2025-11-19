
import { Device, Member } from '../types';
import { mockDevices } from '../data/mock-devices';
import { mockMembers } from '../data/mock-members';

// --- MOCK DATA INTEGRATION ---
// This service uses local mock data and localStorage.

/**
 * Fetches the list of all devices from local storage or mock data.
 * @returns A promise that resolves to an array of devices.
 */
export const fetchDevices = async (): Promise<Device[]> => {
    try {
        const storedDevices = localStorage.getItem('fleetDevices');
        if (storedDevices) {
            const parsed = JSON.parse(storedDevices);
            // Simple validation
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('System: Failed to parse devices from local storage, using mock data.', e);
    }
    
    return mockDevices;
};

/**
 * Fetches the list of all members from local storage or mock data.
 * @returns A promise that resolves to an array of members.
 */
export const fetchMembers = async (): Promise<Member[]> => {
    try {
        const storedMembers = localStorage.getItem('fleetMembers');
        if (storedMembers) {
            const parsed = JSON.parse(storedMembers);
                if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('System: Failed to parse members from local storage, using mock data.', e);
    }

    return mockMembers;
};
