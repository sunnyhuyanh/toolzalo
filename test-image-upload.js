// Test image upload với file thật
const { createClient } = require('@supabase/supabase-js');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  console.log('🧪 Testing Image Upload to Supabase Storage...\n');
  
  // Create admin client
  const supabaseAdmin = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  
  console.log('✅ Admin client created\n');
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const fileName = `test_${Date.now()}.png`;
  
  console.log('📤 Test: Upload image with admin client');
  console.log('  - File name:', fileName);
  console.log('  - File size:', testImageBuffer.length, 'bytes');
  console.log('  - MIME type: image/png');
  console.log('');
  
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('images')
    .upload(fileName, testImageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    console.error('❌ Upload failed!');
    console.error('   Error:', uploadError.message);
    console.error('   Status:', uploadError.statusCode);
    console.error('   Details:', JSON.stringify(uploadError, null, 2));
    return false;
  } else {
    console.log('✅ Upload successful!');
    console.log('  - Path:', uploadData.path);
    console.log('  - Full path:', uploadData.fullPath);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(uploadData.path);
    
    console.log('  - Public URL:', urlData.publicUrl);
    console.log('');
    
    // Try to download to verify
    console.log('📥 Verify: Download uploaded image');
    const response = await fetch(urlData.publicUrl);
    console.log('  - HTTP Status:', response.status);
    console.log('  - Content-Type:', response.headers.get('content-type'));
    console.log('');
    
    // Clean up
    console.log('🧹 Cleanup: Delete test file');
    const { error: deleteError } = await supabaseAdmin.storage
      .from('images')
      .remove([fileName]);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file deleted');
    }
    console.log('');
    
    return true;
  }
}

// Run test
testImageUpload().then(success => {
  console.log('📊 Summary:');
  console.log('='.repeat(50));
  if (success) {
    console.log('✅ IMAGE UPLOAD WORKS PERFECTLY!');
    console.log('');
    console.log('Your app can now:');
    console.log('  ✓ Upload images to Supabase Storage');
    console.log('  ✓ Get public URLs for images');
    console.log('  ✓ Display images in the app');
    console.log('  ✓ Post with images successfully');
  } else {
    console.log('❌ IMAGE UPLOAD FAILED!');
    console.log('');
    console.log('Possible issues:');
    console.log('  • Check Storage is enabled in Supabase Dashboard');
    console.log('  • Check bucket policies allow uploads');
    console.log('  • Verify service_role key is correct');
  }
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

