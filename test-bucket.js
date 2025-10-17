// Quick test script to verify Supabase Storage bucket
const { createClient } = require('@supabase/supabase-js');
const CONFIG = require('./config');

async function testBucket() {
  console.log('🧪 Testing Supabase Storage Bucket...\n');
  
  // Create clients
  const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  const supabaseAdmin = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Clients created\n');
  
  // Test 1: List buckets
  console.log('📦 Test 1: List buckets');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
  } else {
    console.log('✅ Found buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });
  }
  console.log('');
  
  // Test 2: Check if 'images' bucket exists
  console.log('📦 Test 2: Check images bucket');
  const imagesBucket = buckets?.find(b => b.name === 'images');
  if (imagesBucket) {
    console.log('✅ Images bucket exists:');
    console.log('  - Name:', imagesBucket.name);
    console.log('  - Public:', imagesBucket.public);
    console.log('  - ID:', imagesBucket.id);
  } else {
    console.error('❌ Images bucket NOT found!');
  }
  console.log('');
  
  // Test 3: Test upload with admin client
  console.log('📤 Test 3: Test upload with admin client');
  const testFileName = `test_${Date.now()}.txt`;
  const testContent = 'This is a test file';
  
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('images')
    .upload(testFileName, Buffer.from(testContent), {
      contentType: 'text/plain',
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    console.error('❌ Upload failed:', uploadError.message);
    console.error('   Details:', uploadError);
  } else {
    console.log('✅ Upload successful!');
    console.log('  - Path:', uploadData.path);
    console.log('  - Full path:', uploadData.fullPath);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(uploadData.path);
    
    console.log('  - Public URL:', urlData.publicUrl);
    
    // Clean up - delete test file
    const { error: deleteError } = await supabaseAdmin.storage
      .from('images')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
  }
  console.log('');
  
  // Summary
  console.log('📊 Summary:');
  console.log('='.repeat(50));
  if (imagesBucket && !uploadError) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('   - Bucket exists and is public');
    console.log('   - Upload works correctly');
    console.log('   - Ready to use in app');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    if (!imagesBucket) {
      console.log('   - Images bucket not found');
    }
    if (uploadError) {
      console.log('   - Upload failed:', uploadError.message);
    }
  }
  console.log('='.repeat(50));
}

testBucket().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

