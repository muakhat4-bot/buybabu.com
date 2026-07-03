const https = require('https');

const url = 'https://jyxhkjqtdscveqnknluv.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eGhranF0ZHNjdmVxbmtubHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk4NDEzMSwiZXhwIjoyMDk4NTYwMTMxfQ.HruMm924OEu5oxML2dKSZjpAZll7RvInX5W8CkhXIgA';

const options = {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const schema = JSON.parse(data);
      const productSchema = schema.definitions.products;
      console.log('--- products columns ---');
      console.log(productSchema.properties ? Object.keys(productSchema.properties) : 'No properties found');
      
      const vendorSchema = schema.definitions.vendors;
      console.log('--- vendors columns ---');
      console.log(vendorSchema.properties ? Object.keys(vendorSchema.properties) : 'No properties found');
      
      const notificationSchema = schema.definitions.notifications;
      console.log('--- notifications columns ---');
      console.log(notificationSchema.properties ? Object.keys(notificationSchema.properties) : 'No properties found');
    } catch (e) {
      console.error('Failed to parse schema:', e);
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching schema:', err);
});
