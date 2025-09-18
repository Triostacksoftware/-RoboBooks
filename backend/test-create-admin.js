import fetch from 'node-fetch';

const createAdmin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/create-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'testadmin@robobooks.com',
        password: 'admin123',
        role: 'admin'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();


