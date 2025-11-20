
export default function handler(req, res) {
  // 1. Handle CORS (Allow connections from any URL)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle Preflight Requests (Browser Security)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Handle the Data (POST)
  if (req.method === 'POST') {
    const data = req.body;
    
    console.log("------------------------------------------------");
    console.log(" [SERVER] Received Data from Gateway:");
    console.log(JSON.stringify(data, null, 2));
    console.log("------------------------------------------------");

    // NOTE: In a real application, you would save 'data' to a database here 
    // (e.g., MongoDB, Postgres, Firebase) so the dashboard can fetch it later.
    // For now, we log it so you can see it in the Vercel Function Logs.

    return res.status(200).json({ 
        status: 'Success', 
        message: 'Data received by Vercel Serverless Function',
        timestamp: new Date().toISOString(),
        echo: {
            description: "This is the data you sent to the server:",
            receivedPayload: data
        }
    });
  }

  // 4. Reject other methods
  return res.status(405).json({ error: 'Method not allowed. Send a POST request.' });
}
