
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

const validateResponse = async (response: Response, endpoint: string) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
        // If the server sent HTML (like a 404 page or a login page), throw a specific error
        const text = await response.text();
        const preview = text.substring(0, 100);
        throw new Error(`Expected JSON but received ${contentType}. You might be pointing to a website URL instead of an API endpoint. (Preview: ${preview}...)`);
    }

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
};

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
            const endpoint = `${baseUrl}/devices`;
            
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            return await validateResponse(response, endpoint);
        } catch (error) {
            console.error("Server fetch failed:", error);
            let msg = error instanceof Error ? error.message : "Unknown error";
            if (msg.includes("Failed to fetch")) {
                msg = "Network Error: Could not connect. Check your Server URL and ensure CORS is enabled on your backend.";
            }
            throw new Error(`Failed to fetch data: ${msg}`);
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
            const endpoint = `${baseUrl}/members`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return await validateResponse(response, endpoint);
        } catch (error) {
             console.error("Server fetch members failed:", error);
             let msg = error instanceof Error ? error.message : "Unknown error";
             if (msg.includes("Failed to fetch")) {
                 msg = "Network Error: Could not connect.";
             }
             throw new Error(`Failed to fetch members: ${msg}`);
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
