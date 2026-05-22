
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Helper for random values
  const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  const deviceId = req.query.deviceId || 'UNKNOWN';
  const now = new Date();

  // Simulate changing data
  const speed = randInt(0, 85);
  const voltage = rand(52, 56);
  const current = rand(-10, 50);
  const temp = randInt(30, 45);
  const soc = randInt(20, 95);

  const responseData = {
    header: {
      time: now.toLocaleString(),
      obdStatus: 'Connected',
      odometer: `${(5569.68 + Math.random()).toFixed(2)} km`,
      speed: `${speed} km/h`,
      ignition: speed > 0 ? 'On' : 'Off',
    },
    details: [
      // Column 1
      { label: 'Device ID', value: deviceId },
      { label: 'HV Battery Pack Volt', value: `${voltage} V` },
      { label: 'sigMinCellVoltSetPoint', value: '2.799' },
      { label: 'Battery Temperature', value: `${temp} °C` },
      { label: 'sigTotalBatteryAHCapacity', value: '200' },
      { label: 'Battery Fault', value: 'No Fault' },
      { label: 'sigBatteryChargingCycles', value: '18' },
      
      // Column 2
      { label: 'sigBatteryCurrent', value: `${current} A` },
      { label: 'Min Cell Voltage', value: `${rand(3.1, 3.4)} Volt` },
      { label: 'sigStateOfCharge', value: `${soc}%` },
      { label: 'Key On Indicator', value: 'On' },
      { label: 'Vehicle Mode Request', value: speed > 0 ? 'Drive' : 'Stop' },
      { label: 'OutputVoltageFailure', value: '0' },
      
      // Column 3
      { label: 'Ampere Hour', value: `${rand(130, 140)} Ahr` },
      { label: 'Max Cell Voltage', value: `${rand(3.4, 3.6)} Volt` },
      { label: 'sigDistanceToEmpty', value: `${Math.floor(soc * 1.2)} km` },
      { label: 'Battery Light', value: 'off' },
      { label: 'BatteryInternalFailure', value: '0' },
      
      // Column 4
      { label: 'Kilo Watt Hour', value: '7.5 Kwhr' },
      { label: 'Time-To-Charge', value: `${randInt(40, 90)} Min` },
      { label: 'Drive Current Limit', value: '77 Amp' },
      { label: 'Battery Under Voltage', value: 'No Fault' },
      { label: 'sigTCUCommunicationfailure', value: '0' },
    ]
  };

  res.status(200).json(responseData);
}
