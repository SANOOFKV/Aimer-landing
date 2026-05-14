// Native fetch used

async function testLSQ() {
    const LSQ_URL = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Create?accessKey=u$r0f83abac5915f1175344c491a1481e4a&secretKey=e23030c4b0cc1edc251ad61ce5340a9f6499c21d';

    const payload = [
        { Attribute: 'FirstName',        Value: 'TestBot' },
        { Attribute: 'LastName',         Value: 'Bot' },
        { Attribute: 'Phone',            Value: '9999999999' },
        { Attribute: 'EmailAddress',     Value: 'testbot@example.com' },
        { Attribute: 'mx_Qualification', Value: 'completed' },
        { Attribute: 'Notes',            Value: 'Get placed in a top company' },
        { Attribute: 'Source',           Value: 'UGBIP Landing Page' },
    ];

    try {
        // Node 18+ has native fetch
        const res = await fetch(LSQ_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        const data = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

testLSQ();
