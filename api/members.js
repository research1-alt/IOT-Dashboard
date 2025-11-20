
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

  res.status(200).json(members);
}
