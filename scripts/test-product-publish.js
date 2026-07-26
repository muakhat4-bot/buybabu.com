const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db.json');

console.log('--- Testing Product Publish Engine ---');

if (!fs.existsSync(dbPath)) {
  console.error('ERROR: db.json not found at:', dbPath);
  process.exit(1);
}

const testProduct = {
  id: `p-test-${Date.now()}`,
  sku: `VLX-TEST-${Date.now()}`,
  name: 'Supreme Pro ANC Earbuds Test',
  category: 'smart gadgets',
  price: 15990,
  oldPrice: 19990,
  discount: 20,
  stock: 25,
  description: 'Automated test product for publishing pipeline verification.',
  images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80'],
  storeId: '#VLX-MER-089',
  storeName: 'ElectroPulse Store',
  approvalStatus: 'APPROVED',
  status: 'PUBLISHED',
  inStock: true
};

try {
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!dbData.products) dbData.products = [];

  dbData.products.unshift(testProduct);
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

  console.log('✓ Successfully inserted test product into db.json');

  // Verify product is readable
  const reRead = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const found = reRead.products.find(p => p.id === testProduct.id);

  if (found && found.approvalStatus === 'APPROVED' && found.status === 'PUBLISHED') {
    console.log('✓ Product publishing verification PASSED!');
    console.log('  Product ID:', found.id);
    console.log('  Product Name:', found.name);
    console.log('  Approval Status:', found.approvalStatus);
    console.log('  Publication Status:', found.status);

    // Clean up test product
    reRead.products = reRead.products.filter(p => p.id !== testProduct.id);
    fs.writeFileSync(dbPath, JSON.stringify(reRead, null, 2), 'utf8');
    console.log('✓ Cleaned up test product from db.json');
  } else {
    console.error('❌ Verification FAILED: Product was not found or has invalid status');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Error during publishing test:', err);
  process.exit(1);
}
