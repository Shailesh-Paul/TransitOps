async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'system.admin@transitops.enterprise',
        password: 'admin123'
      })
    });
    const data = await res.json();
    console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('ERROR:', error);
  }
}

testLogin();
