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
      console.log('Product approval_status definition:');
      console.log(schema.definitions.products.properties.approval_status);
      
      console.log('Notification type definition:');
      console.log(schema.definitions.notifications.properties.type);
    } catch (e) {
      console.error('Failed to parse schema:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching schema:', err);
});
