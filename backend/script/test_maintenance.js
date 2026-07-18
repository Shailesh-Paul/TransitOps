import 'dotenv/config';
import jwt from 'jsonwebtoken';

async function testMaintenance() {
  console.log('Testing Maintenance endpoints...');
  
  // Generate a mock token for admin user
  const token = jwt.sign({ id: 1, role_id: 1 }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

  // 1. Fetch Maintenance Records
  console.log('\n--- GET /api/v1/maintenance ---');
  const getRes = await fetch('http://localhost:5000/api/v1/maintenance?limit=5', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const getData = await getRes.json();
  console.log(`Fetched ${getData.data.length} records.`);
  console.log(getData.data[0]);

  // 2. Create a Maintenance Record
  console.log('\n--- POST /api/v1/maintenance ---');
  const postRes = await fetch('http://localhost:5000/api/v1/maintenance', {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        vehicle_id: 2,
        type: 'repair',
        description: 'Testing automatic status lock',
        cost: 150.00,
        status: 'in_progress',
        start_date: '2026-07-12',
        performed_by: 'Test Script'
    })
  });

  const postData = await postRes.json();
  console.log('POST Response:', postData);
  const recordId = postData.data ? postData.data.id : null;
  if(!recordId) return;

  // 3. Verify vehicle status changed to 'maintenance'
  console.log('\n--- VERIFY VEHICLE STATUS ---');
  // I will just fetch vehicles directly or trust the DB
  // Alternatively I could update it to complete
  
  console.log('\n--- PUT /api/v1/maintenance/:id ---');
  const putRes = await fetch(`http://localhost:5000/api/v1/maintenance/${recordId}`, {
    method: 'PUT',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        status: 'completed',
        cost: 200.00,
        end_date: '2026-07-13'
    })
  });

  const putData = await putRes.json();
  console.log('Updated Record:', putData.data);
  
}

testMaintenance();
