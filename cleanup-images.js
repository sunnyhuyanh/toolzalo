// Script to cleanup old images from Supabase Storage
// Run this manually or set up as a cron job

const { createClient } = require('@supabase/supabase-js');
const CONFIG = require('./config');

async function cleanupOldImages() {
  console.log('🧹 Starting cleanup of old images...');
  console.log('📅 Deleting images older than 7 days');
  console.log('');

  // Create admin client
  const supabaseAdmin = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get all files in images bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    console.log(`📁 Found ${files.length} files in storage`);

    // Filter files older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldFiles = files.filter(file => {
      const fileDate = new Date(file.created_at);
      return fileDate < sevenDaysAgo;
    });

    console.log(`🗑️  Found ${oldFiles.length} files older than 7 days`);

    if (oldFiles.length === 0) {
      console.log('✅ No old files to delete');
      return { deleted: 0, errors: 0 };
    }

    // Delete old files
    let deletedCount = 0;
    let errorCount = 0;

    console.log('');
    console.log('Deleting files:');
    console.log('═'.repeat(50));

    for (const file of oldFiles) {
      try {
        const { error: deleteError } = await supabaseAdmin.storage
          .from('images')
          .remove([file.name]);

        if (deleteError) {
          console.error(`❌ Failed to delete ${file.name}: ${deleteError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Deleted: ${file.name} (${new Date(file.created_at).toLocaleDateString()})`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Error deleting ${file.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('═'.repeat(50));
    console.log('');
    console.log('📊 Cleanup Summary:');
    console.log(`   Total files checked: ${files.length}`);
    console.log(`   Files older than 7 days: ${oldFiles.length}`);
    console.log(`   Successfully deleted: ${deletedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('');

    if (deletedCount > 0) {
      console.log('✅ Cleanup completed successfully!');
    }

    return { deleted: deletedCount, errors: errorCount };

  } catch (error) {
    console.error('💥 Fatal error during cleanup:', error.message);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupOldImages()
    .then(result => {
      console.log(`🎉 Cleanup finished: ${result.deleted} deleted, ${result.errors} errors`);
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Cleanup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { cleanupOldImages };
