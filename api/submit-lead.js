export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers — restrict to your GitHub Pages domain in production
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { name, phone, status, goal } = req.body;

    // Basic validation
    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
    }

    // Split name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // LeadSquared Capture API payload
    const payload = [
        { Attribute: 'FirstName',           Value: firstName },
        { Attribute: 'LastName',            Value: lastName },
        { Attribute: 'Phone',               Value: phone },
        { Attribute: 'mx_Current_Status',   Value: status || '' },
        { Attribute: 'mx_Goal_After_UGBIP', Value: goal || '' },
        { Attribute: 'Source',              Value: 'UGBIP Landing Page' },
    ];

    const accessKey = process.env.LSQ_ACCESS_KEY;
    const secretKey = process.env.LSQ_SECRET_KEY;
    const host      = process.env.LSQ_HOST; // e.g. api.leadsquared.com

    if (!accessKey || !secretKey || !host) {
        console.error('LeadSquared environment variables are not set.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    const url = `https://${host}/v2/LeadManagement.svc/Lead.Create?accessKey=${accessKey}&secretKey=${secretKey}`;

    try {
        const lsqResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // Read as text first — LeadSquared sometimes returns an empty body on success
        const rawText = await lsqResponse.text();
        let data = null;

        try {
            data = rawText ? JSON.parse(rawText) : null;
        } catch (_) {
            // Response wasn't JSON — that's okay
        }

        if (!lsqResponse.ok) {
            console.error('LeadSquared error:', data || rawText);
            return res.status(502).json({ error: 'Failed to submit lead to CRM.', detail: data || rawText });
        }

        console.log('LeadSquared success:', data || rawText);
        return res.status(200).json({ success: true, message: 'Lead submitted successfully.' });
    } catch (err) {
        console.error('Network error:', err.message);
        return res.status(500).json({ error: 'Internal server error.', detail: err.message });
    }
}
