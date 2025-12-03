
import { Device, Member, AppConfig } from '../types';
import { mockDevices } from '../data/mock-devices';
import { mockMembers } from '../data/mock-members';

const CONFIG_KEY = 'fleetAppConfig';

// Check for environment variable for server URL (Best practice for Vercel/Production)
// Supports standard Create React App and Next.js naming conventions
const ENV_SERVER_URL = process.env.REACT_APP_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL;

const DEFAULT_CONFIG: AppConfig = {
    // If an env var is provided, default to server mode
    mode: ENV_SERVER_URL ? 'server' : 'local',
    serverUrl: ENV_SERVER_URL || 'http://localhost:3000/api',
};

// --- CONFIGURATION HELPERS ---

export const getAppConfig = (): AppConfig => {
    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_CONFIG, ...parsed };
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
        const text = await response.text();
        const preview = text.substring(0, 100);
        throw new Error(`Expected JSON but received ${contentType}. (Preview: ${preview}...)`);
    }

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
};

export const fetchDevices = async (): Promise<Device[]> => {
    const config = getAppConfig();

    if (config.mode === 'server') {
        const baseUrl = config.serverUrl.replace(/\/$/, "");
        const endpoint = baseUrl.startsWith('http') || baseUrl.startsWith('/') 
            ? `${baseUrl}/devices` 
            : `/${baseUrl}/devices`;

        try {
            console.log(`[API] Fetching devices from: ${endpoint}`);
            
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return await validateResponse(response, endpoint);
        } catch (error) {
            console.error("Server fetch failed:", error);
            let msg = error instanceof Error ? error.message : "Unknown error";
            
            // Enhanced Error Diagnosis
            const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
            const isHttpTarget = endpoint.startsWith('http:');

            if (isHttps && isHttpTarget) {
                 msg = "Mixed Content Error: Cannot connect to insecure HTTP server from HTTPS dashboard. Update Server URL to HTTPS or run dashboard locally.";
            } else if (msg.includes("Failed to fetch")) {
                msg = "Network Error. 1. Check CORS on backend. 2. Verify URL. 3. Check if server is running.";
            } else if (msg.includes("404")) {
                 msg = `Endpoint not found (404). URL: ${endpoint}`;
            } else if (msg.includes("Expected JSON")) {
                msg = `Invalid Response. URL '${endpoint}' returned HTML instead of JSON.`;
            }
            
            throw new Error(`Failed to fetch devices: ${msg}`);
        }
    }

    // LOCAL MODE LOGIC
    try {
        const storedDevices = localStorage.getItem('fleetDevices');
        if (storedDevices) {
            const parsed = JSON.parse(storedDevices);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('System: Failed to parse devices from local storage.', e);
    }
    
    return mockDevices;
};

export const fetchMembers = async (): Promise<Member[]> => {
    const config = getAppConfig();

    if (config.mode === 'server') {
        const baseUrl = config.serverUrl.replace(/\/$/, "");
        const endpoint = baseUrl.startsWith('http') || baseUrl.startsWith('/') 
            ? `${baseUrl}/members` 
            : `/${baseUrl}/members`;
        
        try {
            console.log(`[API] Fetching members from: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return await validateResponse(response, endpoint);
        } catch (error) {
             console.error("Server fetch members failed:", error);
             let msg = error instanceof Error ? error.message : "Unknown error";
             
             // Same diagnostics for members
             const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
             const isHttpTarget = endpoint.startsWith('http:');

             if (isHttps && isHttpTarget) {
                 msg = "Mixed Content Error (HTTP vs HTTPS).";
             } else if (msg.includes("Failed to fetch")) {
                 msg = "Network Error.";
             } else if (msg.includes("404")) {
                 msg = `Endpoint not found (404).`;
             }

             throw new Error(`Failed to fetch members: ${msg}`);
        }
    }

    // LOCAL MODE LOGIC
    try {
        const storedMembers = localStorage.getItem('fleetMembers');
        if (storedMembers) {
            const parsed = JSON.parse(storedMembers);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('System: Failed to parse members from local storage.', e);
    }

    return mockMembers;
};
