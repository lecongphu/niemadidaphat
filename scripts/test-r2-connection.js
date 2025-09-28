// Test script để kiểm tra R2 connection
// Chạy: node scripts/test-r2-connection.js

const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 connection...\n');

  // Kiểm tra environment variables
  const requiredEnvs = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID', 
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
  ];

  console.log('📋 Checking environment variables:');
  for (const env of requiredEnvs) {
    const value = process.env[env];
    if (value) {
      console.log(`✅ ${env}: ${value}...`);
    } else {
      console.log(`❌ ${env}: Not set`);
      return;
    }
  }
  console.log();

  // Khởi tạo R2 client
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Test 1: List buckets
    console.log('🔍 Test 1: Listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResult = await s3Client.send(listCommand);
    console.log(`✅ Found ${listResult.Buckets?.length || 0} buckets`);
    
    if (listResult.Buckets) {
      listResult.Buckets.forEach(bucket => {
        console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate})`);
      });
    }
    console.log();

    // Test 2: Upload test file
    console.log('📤 Test 2: Uploading test file...');
    const testContent = 'Hello from R2 test script!';
    const testKey = `test/test-${Date.now()}.txt`;
    
    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await s3Client.send(putCommand);
    console.log(`✅ Successfully uploaded: ${testKey}`);

    // Generate public URL
    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
    let publicUrl;
    
    if (publicDomain) {
      publicUrl = `${publicDomain}/${testKey}`;
    } else {
      publicUrl = `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${testKey}`;
    }

    console.log(`🌐 Public URL: ${publicUrl}`);
    console.log();

    console.log('🎉 All tests passed! R2 is configured correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Test the public URL in your browser');
    console.log('2. Configure CORS if needed');
    console.log('3. Setup custom domain (optional)');
    console.log('4. Start using R2 in your application');

  } catch (error) {
    console.error('❌ R2 connection test failed:');
    console.error(error.message);
    
    if (error.name === 'CredentialsError') {
      console.log('\n💡 Suggestions:');
      console.log('- Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY');
      console.log('- Verify API token has R2:Edit permissions');
      console.log('- Ensure Account ID is correct');
    }
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n💡 Suggestions:');
      console.log('- Check R2_BUCKET_NAME is correct');
      console.log('- Verify bucket exists in your Cloudflare account');
      console.log('- Ensure bucket is in the same account as your API token');
    }
  }
}

// Chạy test
testR2Connection().catch(console.error);
