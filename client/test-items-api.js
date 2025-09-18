// Test script to verify items API connection
const testItemsAPI = async () => {
  try {
    console.log('Testing Items API...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const url = `?{backendUrl}/api/items?limit=5`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success! Found', result.data?.length || 0, 'items');
      console.log('Items:', result.data?.map(item => ({ name: item.name, sku: item.sku })));
    } else {
      console.error('Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

// Run the test
testItemsAPI();
