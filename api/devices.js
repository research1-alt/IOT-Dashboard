
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

  // 2. Return Empty Array
  // This ensures we don't show mock OSM01-04 devices when the user wants spreadsheet data
  res.status(200).json([]);
}
