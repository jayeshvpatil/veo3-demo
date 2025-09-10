// Simple test to debug the visual generation API
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/visuals/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A beautiful product photo with professional lighting',
        productName: 'Test Product',
        productDescription: 'A high-quality test product',
        style: 'professional product photography'
      }),
    });

    const data = await response.json();
    console.log('API Response Status:', response.status);
    console.log('Response data keys:', Object.keys(data));
    console.log('Images count:', data.images?.length || 0);
    
    if (data.images && data.images.length > 0) {
      console.log('First image mime type:', data.images[0].mimeType);
      console.log('First image data length:', data.images[0].data?.length || 0);
    }
    
    console.log('Description:', data.description);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAPI();
