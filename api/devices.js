
export default function handler(req, res) {
  // 1. Enable CORS (Allow frontend to connect)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); // Force fresh data

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Helper to get random number within range
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);

  // 2. Generate Dynamic Mock Data
  // This simulates "Live" data by changing values every time you fetch
  const currentTime = new Date().toLocaleString();
  
  const devices = [
    {
      id: 'OSM01',
      status: 'Driving',
      location: 'Faridabad, Haryana',
      ownerName: 'Karthik',
      vin: 'VIN-8842-XJ',
      registrationNo: 'HR-29-AQ-1234',
      chassisNo: 'CHS-99283-AA',
      batteryUID: 'BAT-Lithium-001',
      vehicleModel: 'Rage+ 125',
      manufacturingYear: 2025,
      fleet: 'Omega Seiki Primary',
      locationOfOrigin: 'DELHI',
      lastUpdated: currentTime,
      canTimestamp: 'Live',
      gpsTimestamp: 'Live',
      imageUrl: 'https://i.imgur.com/eB4BCi3.png',
      // Dynamic Telemetry
      speed: random(15, 45) + ' km/h',
      soc: random(40, 85) + '%',
      voltage: randomFloat(52, 54) + ' V',
      temp: random(30, 45) + ' °C',
      _serverTimestamp: new Date().toISOString() // Meta field to prove server source
    },
    {
      id: 'OSM02',
      status: Math.random() > 0.5 ? 'Parked' : 'Driving', // Randomly switch status
      location: 'Gurugram, Haryana',
      ownerName: 'Priya Sharma',
      vin: 'VIN-9932-AB',
      registrationNo: 'HR-26-BQ-5678',
      chassisNo: 'CHS-11234-BB',
      batteryUID: 'BAT-Lithium-002',
      vehicleModel: 'Rage+ 125',
      manufacturingYear: 2024,
      fleet: 'Gurugram Logistics',
      locationOfOrigin: 'MUMBAI',
      lastUpdated: currentTime,
      canTimestamp: 'Live',
      gpsTimestamp: 'Live',
      imageUrl: 'https://i.imgur.com/eB4BCi3.png',
      // Dynamic Telemetry
      speed: random(0, 25) + ' km/h',
      soc: random(20, 60) + '%',
      voltage: randomFloat(48, 51) + ' V',
      temp: random(25, 35) + ' °C',
      _serverTimestamp: new Date().toISOString()
    },
    {
      id: 'OSM03',
      status: 'Offline',
      location: 'Noida, UP',
      ownerName: 'Anil Kumar',
      vin: 'VIN-7732-ZZ',
      registrationNo: 'UP-16-CD-9012',
      chassisNo: 'CHS-77823-CC',
      batteryUID: 'BAT-Lithium-003',
      vehicleModel: 'Stream',
      manufacturingYear: 2025,
      fleet: 'Noida Hub',
      locationOfOrigin: 'PUNE',
      lastUpdated: '2 hours ago',
      canTimestamp: 'Offline',
      gpsTimestamp: 'Offline',
      imageUrl: 'https://i.imgur.com/eB4BCi3.png',
      _serverTimestamp: new Date().toISOString()
    },
    {
      id: 'OSM04',
      status: 'Maintenance',
      location: 'Service Center, Delhi',
      ownerName: 'Fleet Ops',
      vin: 'VIN-1122-MM',
      registrationNo: 'DL-01-AZ-0001',
      chassisNo: 'CHS-00001-DD',
      batteryUID: 'BAT-Lithium-004',
      vehicleModel: 'Rage+ 125',
      manufacturingYear: 2023,
      fleet: 'Maintenance Reserve',
      locationOfOrigin: 'DELHI',
      lastUpdated: currentTime,
      canTimestamp: 'Service Mode',
      gpsTimestamp: 'Service Mode',
      imageUrl: 'https://i.imgur.com/eB4BCi3.png',
      _serverTimestamp: new Date().toISOString()
    }
  ];

  res.status(200).json(devices);
}
