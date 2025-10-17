// Setup automatic cleanup using Node.js cron job
const cron = require('node-cron');
const { cleanupOldImages } = require('./cleanup-images');

console.log('🕐 Setting up automatic image cleanup...');
console.log('📅 Schedule: Every day at 2:00 AM');
console.log('🗑️  Action: Delete images older than 7 days');
console.log('');

// Schedule cleanup to run daily at 2 AM
// Cron format: minute hour day month weekday
// '0 2 * * *' = At 2:00 AM every day
const cleanupJob = cron.schedule('0 2 * * *', async () => {
  console.log('');
  console.log('⏰ Scheduled cleanup started at', new Date().toISOString());
  console.log('');
  
  try {
    const result = await cleanupOldImages();
    console.log('');
    console.log('✅ Scheduled cleanup completed:', result);
  } catch (error) {
    console.error('❌ Scheduled cleanup failed:', error.message);
  }
}, {
  scheduled: false, // Don't start immediately
  timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
});

// Start the cron job
cleanupJob.start();

console.log('✅ Automatic cleanup scheduled successfully!');
console.log('');
console.log('📋 Management commands:');
console.log('   - Run manual cleanup: node cleanup-images.js');
console.log('   - Check next run time: cleanupJob.getStatus()');
console.log('   - Stop auto cleanup: cleanupJob.stop()');
console.log('');
console.log('🔄 Cleanup job is now running in background...');
console.log('   Press Ctrl+C to stop');

// Keep the process running
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Stopping automatic cleanup...');
  cleanupJob.stop();
  console.log('✅ Cleanup job stopped');
  process.exit(0);
});

// Log when the job will run next
setInterval(() => {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(2, 0, 0, 0);
  
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  console.log(`⏳ Next cleanup scheduled for: ${nextRun.toLocaleString('vi-VN')}`);
}, 60 * 60 * 1000); // Log every hour
