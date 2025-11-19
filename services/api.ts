
import { Device, Member, AppConfig } from '../types';
import { mockDevices } from '../data/mock-devices';
import { mockMembers } from '../data/mock-members';

const CONFIG_KEY = 'fleetAppConfig';
const DEFAULT_CONFIG: AppConfig = {
    mode: 'local',
    serverUrl: 'http://localhost:3000/api',
};

// --- CONFIGURATION HELPERS ---

export const getAppConfig = (): AppConfig => {
    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load config", e);
    }
    return DEFAULT_CONFIG;
};

export const saveAppConfig = (config: AppConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// --- DATA FETCHING ---

/**
 * Fetches the list of all devices.
 * If mode is 'local', uses localStorage/mock data.
 * If mode is 'server', fetches from the configured URL.
 */
export const fetchDevices = async (): Promise<Device[]> => {
    const config = getAppConfig();

    if (config.mode === 'server') {
        try {
            // Remove trailing slash if present to avoid double slashes
            const baseUrl = config.serverUrl.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/devices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${config.apiKey}` // If you add auth later
                }
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Server fetch failed:", error);
            throw new Error(`Failed to connect to server at ${config.serverUrl}. Please check your settings.`);
        }
    }

    // LOCAL MODE LOGIC
    try {
        const storedDevices = localStorage.getItem('fleetDevices');
        if (storedDevices) {
            const parsed = JSON.parse(storedDevices);
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
 * Fetches the list of all members.
 */
export const fetchMembers = async (): Promise<Member[]> => {
    const config = getAppConfig();

    if (config.mode === 'server') {
        try {
            const baseUrl = config.serverUrl.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/members`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            return await response.json();
        } catch (error) {
             console.error("Server fetch members failed:", error);
             // Fallback or re-throw depending on desired behavior. 
             // Throwing ensures the user knows the server connection failed.
             throw error; 
        }
    }

    // LOCAL MODE LOGIC
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
