import 'dotenv/config';
import jwt from 'jsonwebtoken';


async function testDashboard() {
  console.log('Testing Dashboard Summary endpoint...');
  
  // Generate a mock token for admin user
  const token = jwt.sign({ id: 1, role_id: 1 }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
  console.log('Generated token for Admin.');

  // Fetch Dashboard Summary
  const dashRes = await fetch('http://localhost:5000/api/v1/dashboard/summary?date=2026-07-12', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const dashData = await dashRes.json();
  console.log(JSON.stringify(dashData, null, 2));
}

testDashboard();
