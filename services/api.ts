import { Device, Member, AppConfig, TelemetryData } from '../types';
import { mockMembers } from '../data/mock-members';
import { vehicleHeaderStats, canDataDetails } from '../data/mock-live-data';

const CONFIG_KEY = 'fleetAppConfig';

// Check for environment variable for server URL (Best practice for Vercel/Production)
const ENV_SERVER_URL = process.env.REACT_APP_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL;

const DEFAULT_CONFIG: AppConfig = {
    mode: 'server', // Default to server mode
    serverUrl: 'https://script.google.com/macros/s/AKfycbzFd-2T52t6Rs0YJbB8YLMEkd59aNghkKgeqKIrWuazpS-wCLB4JJzQL6zONDm4tnQtcg/exec',
};

// --- CONFIGURATION HELPERS ---

export const getAppConfig = (): AppConfig => {
    const config: AppConfig = { ...DEFAULT_CONFIG };

    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            
            // Force server mode as requested by user
            config.mode = 'server';
            
            if (typeof parsed.serverUrl === 'string') {
                // Migrate from old defaults if found
                const oldDefaults = [
                    'https://script.google.com/macros/s/AKfycbzOWKw2EJbgtYnYI62rBieuJo8BD8YVqDdimt_9HXw8kGX3For-dfCPaOmAOshi8X_moA/exec',
                    'https://script.google.com/macros/s/AKfycbzM7v4vLdTX66Exw550Le6PGfSgfrVlPtEBMrEteDSiBDdg8t19eJ0IGkYJzcXPyBAB7A/exec',
                    'https://script.google.com/macros/s/AKfycbwYWG-2PSxee-YOUiJrZ3ZT1pv74m78rZFulbKWWX4EgG3u3K2CYGJ9OIZHMjrgBJlkgQ/exec',
                    'https://script.google.com/macros/s/AKfycbxB9sY5q69bnb3U5dFcOvDJzFtnZ6VSXB-8hMxndAbTgJfLviKTK5ozgxOmcqSMlv15EQ/exec',
                    'https://script.google.com/macros/s/AKfycbytu9x-aqJifbQSIJ0IpeKwPdfBr5vyY7rUi0jQhNBiH-hnZsVtefDqDelwyLRYmYURPw/exec',
                    'https://script.google.com/macros/s/AKfycbyxlpEQDrvvQ5-NI2Cus1WFyN-ngOnaw_ChUKj1-ixezVTfekM7y72J3l8rBKqYJY0m5g/exec',
                    'https://script.google.com/macros/s/AKfycbxrE4vk0NpfgvmsVD2eYdZXxfrPmXMN4E3yj0kjskQy9_hAt7x5HiHTwv6vStamZC-QzQ/exec'
                ];
                if (oldDefaults.includes(parsed.serverUrl)) {
                    config.serverUrl = DEFAULT_CONFIG.serverUrl;
                } else {
                    config.serverUrl = parsed.serverUrl;
                }
            }
        }
    } catch (e) {
        console.error("Failed to load or parse config from localStorage, using defaults.", e);
        return DEFAULT_CONFIG;
    }
    
    // Ensure mode is server
    config.mode = 'server';
    if (!config.serverUrl || config.serverUrl === '/api') {
        config.serverUrl = DEFAULT_CONFIG.serverUrl;
    }
    if (config.mode === 'server' && config.serverUrl) {
        // 1. Strip trailing slashes and whitespace
        let url = config.serverUrl.trim().replace(/\/+$/, "");

        // 2. Handle Google Apps Script URLs
        if (url.includes('script.google.com')) {
            // Ensure it ends with /exec
            if (!url.endsWith('/exec')) {
                url = url.split('?')[0]; // Remove existing params
                if (!url.endsWith('/exec')) url += '/exec';
            }
            config.serverUrl = url;
        } else {
            // Standard API handling
            // Fix common user error: pasting the full endpoint URL instead of the base URL
            url = url.replace(/\/devices$/, "");
            url = url.replace(/\/members$/, "");
            
            // Ensure Vercel URLs have /api
            if (url.includes('vercel.app') && !url.endsWith('/api')) {
                url += '/api';
            }
            config.serverUrl = url;
        }
    }

    return config;
};

// Helper to build endpoint URLs
export const getEndpointUrl = (baseUrl: string, action: string): string => {
    if (baseUrl.includes('script.google.com')) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}action=${action}`;
    }
    return `${baseUrl}/${action}`;
};

export const saveAppConfig = (config: AppConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const resetAppConfig = () => {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem('fleetDevices');
    localStorage.removeItem('fleetMembers');
    window.location.reload();
};

export const isElectron = (): boolean => {
    return (typeof window !== 'undefined' && (window as any).process && (window as any).process.type) || 
           (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf(' electron/') > -1);
};

// --- DATA FETCHING HELPER ---

const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, delay = 1500): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        
        // Check for "Starting Server..." HTML or 503/422/504
        const isStartingServer = response.status === 200 && (response.headers.get("content-type")?.includes("text/html") || false);
        const shouldRetry = response.status === 503 || response.status === 422 || response.status === 504 || isStartingServer;

        if (shouldRetry && retries > 0) {
            // If it's HTML, we need to check if it's actually the "Starting Server" page
            if (isStartingServer) {
                const text = await response.clone().text();
                if (!text.includes("Starting Server...") && !text.includes("Please wait while your application starts")) {
                    return response; // Not a starting server page, return it
                }
                console.warn(`Backend is starting. Retrying in ${delay}ms... (${retries} left)`);
            } else {
                console.warn(`Fetch to ${url} returned ${response.status}. Retrying in ${delay}ms... (${retries} left)`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 1.5);
        }
        return response;
    } catch (error: any) {
        // Don't retry on manual abort or timeout signal
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            throw error;
        }

        if (retries > 0) {
            console.warn(`Fetch to ${url} failed. Retrying in ${delay}ms... (${retries} left)`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 1.5);
        }
        throw error;
    }
};

const validateResponse = async (response: Response, endpoint: string) => {
    // 1. Check HTTP Status first
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const text = await response.text();
        
        if (contentType && contentType.includes("application/json")) {
            try {
                const errorData = JSON.parse(text);
                let errorMessage = errorData.error || `Server Error: ${response.status} ${response.statusText}`;
                
                if (errorData.isHtml) {
                    errorMessage = "Google Script returned HTML instead of JSON. Please ensure your script is published as 'Anyone' and returns JSON.";
                }
                
                if (response.status === 422 && errorData.details) {
                    errorMessage += `\nDetails: ${errorData.details.substring(0, 100)}...`;
                }
                
                throw new Error(errorMessage);
            } catch (e: any) {
                if (e.message.includes("Google Script returned HTML")) throw e;
                // Fallback to generic error if JSON parsing fails
            }
        }
        
        if (response.status === 503) {
            throw new Error("Service Unavailable (503). The Google Script or Proxy is currently overloaded. Please try again in a few seconds.");
        }
        
        throw new Error(`Server Error: ${response.status} ${response.statusText} at ${endpoint}`);
    }

    const contentType = response.headers.get("content-type");
    const text = await response.text();

    // 2. Try to parse JSON regardless of header
    try {
        return JSON.parse(text);
    } catch (e) {
        // Check if response is HTML (Common when hitting a 404 page or root app instead of API)
        const isHtml = (contentType && contentType.includes("text/html")) || 
                       text.trim().toLowerCase().startsWith("<!doctype") || 
                       text.trim().toLowerCase().startsWith("<html");

        if (isHtml) {
             const titleMatch = text.match(/<title>(.*?)<\/title>/i);
             const title = titleMatch ? titleMatch[1] : "Web Page";
             
             throw new Error(
                `Server returned HTML ("${title}") instead of JSON at "${endpoint}". \nThis usually means the API Path is incorrect or the Google Script is not published as 'Anyone'.`
            );
        }
        if (!text.trim()) {
            throw new Error(`Server returned an empty response from ${endpoint}.`);
        }
        const preview = text.substring(0, 100).replace(/\n/g, ' ');
        throw new Error(`Response was not valid JSON at ${endpoint}. Preview: "${preview}..."`);
    }
};

const handleFetchError = (error: any, context: string, endpoint: string) => {
    console.warn(`${context} failed:`, error);
    let msg = error instanceof Error ? error.message : "Unknown error";
    
    if (msg.includes("Failed to fetch")) {
        msg = `Network Connection Error. The dashboard could not reach the backend proxy at ${endpoint}. \n\nPossible causes:\n1. The local server is restarting or down.\n2. Your internet connection is unstable.\n3. A browser extension is blocking the request.`;
    } else if (error.name === 'AbortError' || error.name === 'TimeoutError' || msg.includes("timed out") || msg.includes("aborted")) {
        msg = `Request Timed Out or Aborted. The Google Script took too long to respond (over 75s). \n\nThis usually means the spreadsheet is too large or the script is overloaded. Please try again in a moment.`;
    }
    
    throw new Error(`${context}: ${msg}`);
};

export const fetchDevices = async (): Promise<Device[]> => {
    const config = getAppConfig();

    const normalizeDevices = (data: any[]): Device[] => {
        if (!Array.isArray(data)) return [];

        return data
            .map(raw => {
                if (!raw) return null;
                
                let id = '';
                let status = 'Driving'; // Default to 'Driving' so it counts as Online in dashboard
                let location = 'Live';

                // 1. Handle String format: "OSM 01"
                if (typeof raw === 'string') {
                    id = raw;
                } 
                // 2. Handle Array format: ["1", "OSM 01", "Driving"]
                else if (Array.isArray(raw)) {
                    // If the first element is a number (serial), try the second element
                    const first = String(raw[0] || '').trim();
                    const second = String(raw[1] || '').trim();
                    
                    if (/^\d+$/.test(first) && first.length < 4 && second) {
                        id = second;
                    } else {
                        id = first;
                    }
                } 
                // 3. Handle Object format: {"Device Detaisl": "OSM 01"}
                else if (typeof raw === 'object') {
                    // Expanded list of possible ID column names
                    const idKeys = [
                        'id', 'deviceid', 'device_id', 'device', 'name', 'device_name',
                        'devicedetaisl', 'device detaisl', 'device details', 
                        'vehicleno', 'vehicle', 'unit', 'imei', 'serial', 'vehicleid'
                    ];
                    
                    // Try to find a matching key
                    const keys = Object.keys(raw);
                    for (const key of keys) {
                        const lowerKey = key.toLowerCase().trim();
                        if (idKeys.includes(lowerKey)) {
                            id = String(raw[key]);
                            break;
                        }
                    }

                    // Only fallback to first property if it's not a known non-data key
                    if (!id && keys.length > 0) {
                        const nonDataKeys = [
                            'status', 'success', 'error', 'message', 'count', 
                            'view', 'data', 'no', 's.no', 'serial no', 'timestamp', 'date', 'time', 'location'
                        ];
                        
                        // Find the first key that isn't a known non-data key
                        for (const key of keys) {
                            const lowerKey = key.toLowerCase().trim();
                            if (!nonDataKeys.includes(lowerKey)) {
                                id = String(raw[key]);
                                break;
                            }
                        }
                    }

                    status = raw.status || raw.Status || status;
                    location = raw.location || raw.Location || location;
                }

                // Clean up the ID
                id = id.trim().replace(/\.(csv|trc)$/i, '');

                // 4. Filter out headers or empty entries
                const idLower = id.toLowerCase();
                // Be less aggressive with "id" filtering - only filter if it's EXACTLY "id" or "device id"
                const isHeader = idLower === 'id' || 
                                 idLower === 'device id' ||
                                 idLower === 'vehicle id' ||
                                 idLower === 'vehicle' ||
                                 idLower === 'no' ||
                                 idLower === 'no.' ||
                                 idLower === 's.no' ||
                                 idLower === 'header' ||
                                 idLower === 'name' ||
                                 idLower === 'status' ||
                                 idLower === 'timestamp';
                
                if (!id || isHeader) {
                    return null;
                }

                // Normalize Status (Capitalize first letter)
                let normalizedStatus = String(status).trim();
                if (normalizedStatus) {
                    normalizedStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1).toLowerCase();
                }
                if (!['Driving', 'Parked', 'Offline', 'Maintenance', 'Stored'].includes(normalizedStatus)) {
                    normalizedStatus = 'Driving'; // Default for dashboard visibility
                }

                return {
                    id,
                    status: normalizedStatus,
                    location: raw.location || raw.Location || location,
                    speed: raw.speed || raw.Speed,
                    soc: raw.soc || raw.SOC,
                    fuel: raw.fuel || raw.Fuel,
                    battery: raw.battery || raw.Battery,
                    ignition: (raw.ignition || raw.Ignition || 'Off').toLowerCase() === 'on' ? 'On' : 'Off',
                    latitude: parseFloat(raw.latitude || raw.Latitude) || null,
                    longitude: parseFloat(raw.longitude || raw.Longitude) || null,
                    timestamp: raw.timestamp || raw.Timestamp,
                    lastUpdated: new Date().toLocaleString()
                } as Device;
            })
            .filter((d): d is Device => d !== null);
    };

    if (config.mode === 'server') {
        const baseUrl = config.serverUrl;
        
        // If it's a Google Script, use the specialized endpoint helper
        if (baseUrl.includes('script.google.com')) {
            const endpoint = getEndpointUrl(baseUrl, 'devices');
            
            // In Electron production (file://), the proxy server is not running.
            // We can call the Google Script directly because we disabled webSecurity.
            const useProxy = !isElectron() || window.location.protocol !== 'file:';
            const finalUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(endpoint)}` : endpoint;
            
            try {
                console.log(`Fetching devices: ${finalUrl}`);
                const response = await fetchWithRetry(finalUrl, { 
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(75000) // 75s (longer than server proxy 60s)
                });
                
                const data = await validateResponse(response, finalUrl);
                console.log("Raw data from Google Script (via proxy):", data);
                // Handle wrapped responses like { data: [...] } or { devices: [...] }
                let rawList: any[] = [];
                if (Array.isArray(data)) {
                    rawList = data;
                } else if (data && typeof data === 'object') {
                    rawList = data.data || data.devices || data.externalDevices || [data];
                }
                
                return normalizeDevices(rawList);
            } catch (error: any) {
                console.error("Google Script fetch failed (via proxy):", error);
                throw error;
            }
        } else {
            // Try multiple endpoints to be flexible for standard APIs
            const endpoints = [
                `${baseUrl}/telematics`,
                `${baseUrl}/devices`,
                `${baseUrl}/receive`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, { 
                        headers: { 'Accept': 'application/json, */*' },
                        signal: AbortSignal.timeout(5000)
                    });
                    
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const data = await response.json();
                            let rawList: any[] = [];
                            if (Array.isArray(data)) rawList = data;
                            else if (data && typeof data === 'object') {
                                rawList = data.externalDevices || [data];
                            }
                            return normalizeDevices(rawList);
                        }
                    }
                } catch (error: any) {
                    console.warn(`Failed to fetch from ${endpoint}:`, error.message);
                }
            }
        }
        
        // Fallback to local /api/devices if external ones failed (only if not Google Script)
        if (!baseUrl.includes('script.google.com')) {
            try {
                const response = await fetch('/api/devices');
                if (response.ok) return await response.json();
            } catch (e) {}
        }

        throw new Error("Server connection failed. Could not fetch devices.");
    }

    // LOCAL MODE LOGIC - Now returns empty as local devices are removed
    return [];
};

export const fetchMembers = async (): Promise<Member[]> => {
    // Always use local/mock data for members to avoid using spreadsheet for login activity
    let members = [...mockMembers];
    try {
        const stored = localStorage.getItem('fleetMembers');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                // Merge: keep stored members but ensure all mock members are present (by email)
                // This ensures that if we add new members to mock-members.ts (like the admin), 
                // they appear even if the user has old data in localStorage.
                const storedEmails = new Set(parsed.map((m: Member) => m.email.toLowerCase()));
                const newFromMock = mockMembers.filter(m => !storedEmails.has(m.email.toLowerCase()));
                members = [...parsed, ...newFromMock];
            }
        }
    } catch (e) {
        console.error("Failed to load members from localStorage", e);
    }
    
    return members;
};

export const searchReports = async (deviceId: string, startDate: string, endDate: string, startTime: string = '00:00', endTime: string = '23:59'): Promise<any> => {
    const config = getAppConfig();
    if (config.mode === 'server') {
        const baseUrl = config.serverUrl;
        const endpoint = getEndpointUrl(baseUrl, 'reports') + 
            `&deviceId=${encodeURIComponent(deviceId)}` +
            `&startDate=${encodeURIComponent(startDate)}` +
            `&endDate=${encodeURIComponent(endDate)}` +
            `&startTime=${encodeURIComponent(startTime)}` +
            `&endTime=${encodeURIComponent(endTime)}`;
        
        // In Electron production (file://), the proxy server is not running.
        const useProxy = baseUrl.includes('script.google.com') && (!isElectron() || window.location.protocol !== 'file:');
        const finalUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(endpoint)}` : endpoint;

        try {
            console.log(`Searching reports: ${finalUrl}`);
            const response = await fetchWithRetry(finalUrl, { 
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(75000) // 75s
            });
            return await validateResponse(response, finalUrl);
        } catch (error) {
            console.warn("Reports search failed, falling back to local simulation.", error);
            throw error;
        }
    }
    throw new Error("Server mode required for reports search.");
};

export const fetchVehicleTelemetry = async (deviceId: string): Promise<TelemetryData> => {
    const config = getAppConfig();

    if (config.mode === 'server') {
        const baseUrl = config.serverUrl;
        const endpoint = getEndpointUrl(baseUrl, 'telemetry') + `&deviceId=${encodeURIComponent(deviceId)}`;

        // In Electron production (file://), the proxy server is not running.
        const useProxy = baseUrl.includes('script.google.com') && (!isElectron() || window.location.protocol !== 'file:');
        const finalUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(endpoint)}` : endpoint;

        try {
            console.log(`Fetching telemetry: ${finalUrl}`);
            const response = await fetchWithRetry(finalUrl, { 
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(75000) // 75s
            });
            let data = await validateResponse(response, finalUrl);
            
            // If the server returns "File not found", try adding .trc extension
            if (data && (data.error || data.Error) && String(data.error || data.Error).toLowerCase().includes('not found') && !deviceId.includes('.')) {
                const retryEndpoint = getEndpointUrl(baseUrl, 'telemetry') + `&deviceId=${encodeURIComponent(deviceId + '.trc')}`;
                const retryUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(retryEndpoint)}` : retryEndpoint;
                
                try {
                    console.log(`Retrying with .trc extension: ${deviceId}.trc`);
                    const retryResponse = await fetchWithRetry(retryUrl, { 
                        headers: { 'Accept': 'application/json' },
                        signal: AbortSignal.timeout(45000) // 45s
                    });
                    const retryData = await validateResponse(retryResponse, retryUrl);
                    if (retryData && !(retryData.error || retryData.Error)) {
                        data = retryData;
                    }
                } catch (e) {
                    console.warn("Retry with .trc failed:", e);
                }
            }

            // Normalize the telemetry response
            let raw = data;
            if (data && data.data && !Array.isArray(data.data)) raw = data.data;
            if (data && data.telemetry) raw = data.telemetry;
            if (Array.isArray(data)) raw = data[0];

            if (!raw || typeof raw !== 'object') {
                throw new Error("No telemetry data found for device.");
            }

            const telemetry: TelemetryData = {
                header: {
                    time: raw.header?.time || raw.time || raw.timestamp || raw.Timestamp || new Date().toLocaleString(),
                    obdStatus: raw.header?.obdStatus || raw.obdStatus || raw.obd_status || 'Connected',
                    odometer: raw.header?.odometer || raw.odometer || raw.Odometer || '0 km',
                    speed: raw.header?.speed || raw.speed || raw.Speed || '0 km/h',
                    ignition: raw.header?.ignition || raw.ignition || raw.Ignition || 'Off',
                    latitude: parseFloat(raw.header?.latitude || raw.latitude || raw.Latitude || raw.Lat || raw.lat) || null,
                    longitude: parseFloat(raw.header?.longitude || raw.longitude || raw.Longitude || raw.Lng || raw.lng || raw.Lag || raw.lag) || null,
                },
                details: [],
                rawMessages: raw.rawMessages || [],
                error: raw.error || raw.Error || raw.message || raw.Message
            };

            // 1. Check for explicit details array
            if (Array.isArray(raw.details)) {
                telemetry.details = raw.details;
            } else if (Array.isArray(raw.canData)) {
                telemetry.details = raw.canData;
            } else if (Array.isArray(raw.signals)) {
                telemetry.details = raw.signals;
            } else {
                // 2. Extract from flat object
                const skipKeys = [
                    'time', 'timestamp', 'obdstatus', 'obd_status', 'odometer', 
                    'speed', 'ignition', 'latitude', 'longitude', 'lat', 'lng', 'lag', 'id', 
                    'deviceid', 'device_id', 'status', 'location', 'vin', 'soc', 'battery', 'rawmessages'
                ];
                
                Object.entries(raw).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (!skipKeys.includes(lowerKey) && 
                        typeof value !== 'object' && 
                        value !== null && 
                        value !== undefined) {
                        telemetry.details.push({
                            label: key,
                            value: String(value)
                        });
                    }
                });
            }

            if (telemetry.details.length > 0) {
                console.log(`Decoded ${telemetry.details.length} signals for ${deviceId}`);
            }

            // 3. Override header ignition if Key_On_Indicator signal is present
            const keyOnSignal = telemetry.details.find(d => 
                d.label.toLowerCase() === 'key_on_indicator' || 
                d.label.toLowerCase() === 'key on indicator'
            );
            if (keyOnSignal) {
                const val = String(keyOnSignal.value).toLowerCase();
                if (val === '1' || val === 'on' || val === 'true') {
                    telemetry.header.ignition = 'On';
                } else if (val === '0' || val === 'off' || val === 'false') {
                    telemetry.header.ignition = 'Off';
                }
            }

            // 4. Extract location from CAN signals if missing or invalid in header
            const isHeaderLocationInvalid = 
                !telemetry.header.latitude || 
                !telemetry.header.longitude || 
                (telemetry.header.latitude === 0 && telemetry.header.longitude === 0);

            if (isHeaderLocationInvalid) {
                const latSig = telemetry.details.find(d => {
                    const l = d.label.toLowerCase();
                    return l === 'latitude' || l === 'gps latitude' || l === 'gps_latitude' || l === 'lat' || l === 'gps_lat' || l === 'position_lat';
                });
                const lngSig = telemetry.details.find(d => {
                    const l = d.label.toLowerCase();
                    return l === 'longitude' || l === 'gps longitude' || l === 'gps_longitude' || l === 'lng' || l === 'gps_lng' || l === 'position_lng';
                });
                
                if (latSig && lngSig) {
                    const latVal = parseFloat(latSig.value);
                    const lngVal = parseFloat(lngSig.value);
                    if (!isNaN(latVal) && !isNaN(lngVal) && (latVal !== 0 || lngVal !== 0)) {
                        telemetry.header.latitude = latVal;
                        telemetry.header.longitude = lngVal;
                    }
                }
            }

            // 5. Final validation for vehiclePos calculation (ensure null if 0,0)
            if (telemetry.header.latitude === 0 && telemetry.header.longitude === 0) {
                telemetry.header.latitude = null;
                telemetry.header.longitude = null;
            }

            return telemetry;
        } catch (error) {
            console.error("Telemetry fetch failed:", error);
            throw error; // Throw error instead of falling back to mock data
        }
    }

    throw new Error("Server mode required for telemetry fetch.");
};
