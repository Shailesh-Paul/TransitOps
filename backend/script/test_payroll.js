import 'dotenv/config';
import jwt from 'jsonwebtoken';

async function testPayroll() {
  console.log('Testing Payroll endpoints...');
  
  // Generate a mock token for admin user
  const token = jwt.sign({ id: 1, role_id: 1 }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

  // 1. Fetch Payroll Records
  console.log('\n--- GET /api/v1/payroll ---');
  const getRes = await fetch('http://localhost:5000/api/v1/payroll?limit=5', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const getData = await getRes.json();
  console.log(`Fetched ${getData.data.length} records.`);
  console.log(getData.data[0]);

  // 2. Create a Payroll Record
  console.log('\n--- POST /api/v1/payroll ---');
  const postRes = await fetch('http://localhost:5000/api/v1/payroll', {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        employee_id: 11, // Someone without June payroll
        month: 6,
        year: 2026,
        basic_salary: 50000.00,
        allowances: 5000.00,
        deductions: 2000.00,
        status: 'processing'
    })
  });

  const postData = await postRes.json();
  console.log('POST Response:', postData);
  const recordId = postData.data ? postData.data.id : null;
  
  if (!recordId) return;

  // 3. Update the Payroll Record to Paid
  console.log('\n--- PUT /api/v1/payroll/:id ---');
  const putRes = await fetch(`http://localhost:5000/api/v1/payroll/${recordId}`, {
    method: 'PUT',
    headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        status: 'paid'
    })
  });

  const putData = await putRes.json();
  console.log('Updated Record:', putData.data);
  
  // 4. Try to delete the paid record (Should Fail)
  console.log('\n--- DELETE /api/v1/payroll/:id (Should Fail) ---');
  const delRes = await fetch(`http://localhost:5000/api/v1/payroll/${recordId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const delData = await delRes.json();
  console.log('Delete Response:', delData);
}

testPayroll();
