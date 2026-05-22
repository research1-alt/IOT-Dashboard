
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- MIDDLEWARE ---
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES ---

  // In-memory storage for external devices sent from other apps
  let externalDevices: any[] = [];
  let lastReceivedData: any = null;

  // Helper to get random number within range
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
  const randomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(1);

  // --- BACKGROUND DATA PULL ---
  const EXTERNAL_TELEMATICS_URL = 'https://ais-dev-jtall7tj4gbbbelbr7yrcx-127120545089.asia-southeast1.run.app/api/telematics';
  
  async function pullExternalData() {
    try {
        console.log(` [SERVER] Pulling data from external source: ${EXTERNAL_TELEMATICS_URL}`);
        const response = await fetch(EXTERNAL_TELEMATICS_URL, { 
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(10000) 
        });
        
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
            console.warn(` [SERVER] External source ${EXTERNAL_TELEMATICS_URL} did not return JSON. Status: ${response.status}, Content-Type: ${contentType}`);
            return;
        }

        const data = await response.json();
        const devices = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);
        
        if (devices.length > 0) {
            // Map and merge
            devices.forEach((d: any) => {
                const id = String(d.vehicleId || d.id || d.vehicle_id || d.deviceId || 'EXT-' + Math.random().toString(36).substr(2, 5));
                const mapped = {
                    id,
                    status: d.engineStatus || d.status || 'Active',
                    location: (d.latitude && d.longitude) ? `${d.latitude}, ${d.longitude}` : (d.location || 'Unknown'),
                    ownerName: 'Remote Telematics',
                    vin: d.vin || 'N/A',
                    registrationNo: d.registrationNo || 'N/A',
                    chassisNo: 'N/A',
                    batteryUID: 'N/A',
                    vehicleModel: 'External Source',
                    manufacturingYear: 2026,
                    fleet: 'External Fleet',
                    locationOfOrigin: 'REMOTE',
                    lastUpdated: 'Just now',
                    canTimestamp: 'Live',
                    gpsTimestamp: 'Live',
                    imageUrl: 'https://i.imgur.com/eB4BCi3.png',
                    speed: (d.speed || 0) + ' km/h',
                    soc: (d.fuelLevel || d.soc || 0) + '%',
                    _serverTimestamp: new Date().toISOString(),
                    _isExternal: true
                };

                const index = externalDevices.findIndex(ed => ed.id === id);
                if (index !== -1) {
                    externalDevices[index] = mapped;
                } else {
                    externalDevices.push(mapped);
                }
            });
            console.log(` [SERVER] Successfully pulled ${devices.length} devices from external source.`);
        }
    } catch (error: any) {
        console.error(" [SERVER] Failed to pull external data:", error.message);
    }
  }

  // Initial pull and then every 30 seconds
  // pullExternalData(); // Disabled old external source
  // setInterval(pullExternalData, 30000);

  app.get("/api/devices", (req, res) => {
    // Return only external devices (from Bridge) or empty array
    // This ensures we don't show mock OSM01-04 devices when the user wants spreadsheet data
    res.json([...externalDevices]);
  });

  app.get("/api/members", (req, res) => {
    const members = [
      { 
        id: 'user-admin-01', 
        name: 'Admin', 
        email: 'research1@omegaseikimobility.com', 
        role: 'Admin', 
        assignedDevices: [] 
      },
      { 
        id: 'user-member-02', 
        name: 'Olivia Chen', 
        email: 'olivia.chen@example.com', 
        role: 'Member', 
        assignedDevices: ['OSM01'] 
      }
    ];
    res.json(members);
  });

  app.get("/api/telemetry", (req, res) => {
    // This route is now disabled. The dashboard should fetch telemetry directly from the Google Script via the proxy.
    res.status(404).json({ error: "Telemetry route is disabled. Please fetch directly from the Google Script via /api/proxy." });
  });

  app.post("/api/receive", (req, res) => {
    const rawData = req.body;
    const headers = req.headers;
    
    console.log("================================================");
    console.log(` [SERVER] Incoming POST to /api/receive at ${new Date().toISOString()}`);
    console.log(" [BODY]:", JSON.stringify(rawData, null, 2));
    console.log("================================================");

    lastReceivedData = {
        payload: rawData,
        _receivedAt: new Date().toISOString(),
        _sourceIp: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    };

    // Handle both single object and array of objects
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    
    let processedCount = 0;

    dataArray.forEach(data => {
        // Support multiple key variations from different Bridge apps
        const deviceId = data.vehicleId || data.id || data.vehicle_id || data.deviceId || data.v_id || data.VEHICLE_ID || data.device_id;
        
        if (deviceId) {
            const stringId = String(deviceId);
            
            // Format status: "on" -> "On", "off" -> "Off"
            let status = data.engineStatus || data.status || data.engine_status || data.ENGINE_STATUS || 'Active';
            if (status === 'on') status = 'Active';
            if (status === 'off') status = 'Parked';
            
            // Format last updated from timestamp if available
            let lastUpdated = 'Just now';
            if (data.timestamp) {
                try {
                    const date = new Date(data.timestamp);
                    lastUpdated = date.toLocaleTimeString();
                } catch (e) {}
            }

            const mappedDevice = {
                id: stringId,
                status: status,
                location: (data.latitude && data.longitude) ? `${data.latitude}, ${data.longitude}` : (data.LATITUDE && data.LONGITUDE ? `${data.LATITUDE}, ${data.LONGITUDE}` : (data.location || 'Unknown')),
                ownerName: data.ownerName || 'External Bridge',
                vin: data.vin || data.VIN || 'N/A',
                registrationNo: data.registrationNo || data.REGISTRATION_NO || 'N/A',
                chassisNo: 'N/A',
                batteryUID: 'N/A',
                vehicleModel: data.vehicleModel || 'Bridge Connected',
                manufacturingYear: 2026,
                fleet: 'External Fleet',
                locationOfOrigin: 'REMOTE',
                lastUpdated: lastUpdated,
                canTimestamp: 'Live',
                gpsTimestamp: 'Live',
                imageUrl: 'https://i.imgur.com/eB4BCi3.png',
                speed: (data.speed || data.velocity || data.SPEED || 0) + ' km/h',
                soc: (data.batteryLevel || data.fuelLevel || data.soc || data.fuel_level || data.battery || data.FUEL_LEVEL || 0) + '%',
                voltage: 'N/A',
                temp: 'N/A',
                _serverTimestamp: new Date().toISOString(),
                _isExternal: true
            };

            const index = externalDevices.findIndex(d => d.id === stringId);
            if (index !== -1) {
                externalDevices[index] = mappedDevice;
            } else {
                externalDevices.push(mappedDevice);
            }
            processedCount++;
        }
    });

    res.status(200).json({ 
        status: 'Success', 
        message: `Processed ${processedCount} devices`,
        timestamp: new Date().toISOString()
    });
  });

  app.delete("/api/receive", (req, res) => {
    externalDevices = [];
    lastReceivedData = null;
    res.json({ message: "External devices cleared" });
  });

  app.get("/api/receive", (req, res) => {
    res.json({
        lastReceived: lastReceivedData,
        externalDevices: externalDevices,
        serverTime: new Date().toISOString(),
        config: {
            port: PORT,
            nodeEnv: process.env.NODE_ENV
        }
    });
  });

  // --- PROXY ROUTE ---
  // This route bypasses CORS for Google Apps Script and other external APIs
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(` [SERVER] Proxying request to: ${targetUrl} (Attempt ${attempt}/${maxRetries})`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 70000); // 70s timeout

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          redirect: 'follow',
          signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        // Check if it's the "Starting Server..." HTML or a 503
        const isStartingServer = text.includes("Starting Server...") || text.includes("Please wait while your application starts");
        const isServiceUnavailable = response.status === 503 || response.status === 502 || response.status === 504;

        if ((isStartingServer || isServiceUnavailable) && attempt < maxRetries) {
          console.warn(` [SERVER] Target is starting or unavailable (Status: ${response.status}). Retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        if (!response.ok) {
          console.error(` [SERVER] Proxy target returned error ${response.status}: ${text.substring(0, 200)}`);
          
          // Handle 503 specifically
          if (response.status === 503) {
            return res.status(503).json({
              error: "Google Script is temporarily unavailable (503). This usually happens when the script is overloaded or Google is throttling requests.",
              details: text.substring(0, 200)
            });
          }

          // Use 422 (Unprocessable Entity) instead of 5xx to avoid Nginx interception
          const status = response.status >= 500 ? 422 : response.status;
          return res.status(status).json({ 
            error: `Target returned ${response.status}`, 
            details: text.substring(0, 500),
            isHtml: contentType?.includes('text/html') || text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')
          });
        }

        if (contentType && contentType.includes('application/json')) {
          try {
            const data = JSON.parse(text);
            return res.json(data);
          } catch (e) {
            console.error(` [SERVER] Failed to parse JSON from ${targetUrl}`);
            return res.status(500).json({ 
              error: "Failed to parse JSON from target", 
              details: text.substring(0, 500),
              isHtml: text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')
            });
          }
        } else {
          // If not JSON, check if it's HTML (likely a login page or error)
          const isHtml = contentType?.includes('text/html') || text.trim().startsWith('<!doctype') || text.trim().startsWith('<html');
          if (isHtml) {
            // If we got HTML but it's the last attempt, return it as an error
            console.warn(` [SERVER] Proxy target returned HTML instead of JSON from ${targetUrl}`);
            return res.status(422).json({ 
              error: "Target returned HTML instead of JSON. This often happens if the Google Script requires login or has an error.",
              isHtml: true,
              details: text.substring(0, 500)
            });
          } else {
            // If it's not JSON and not HTML, it's likely raw text/csv/trc data
            // Return it as plain text
            res.setHeader('Content-Type', contentType || 'text/plain');
            return res.send(text);
          }
        }
      } catch (error: any) {
        lastError = error;
        console.error(` [SERVER] Proxy attempt ${attempt} failed for ${targetUrl}:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = attempt * 1000;
          console.log(` [SERVER] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (error.name === 'AbortError') {
          return res.status(504).json({ 
            error: "The request to Google Script timed out (70s).", 
            details: "Google Scripts can be slow to respond. This usually means the spreadsheet is too large or the script is overloaded. Please try again or check if your spreadsheet is very large." 
          });
        }
        
        return res.status(500).json({ error: `Proxy failed after ${maxRetries} attempts: ${error.message}` });
      }
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
