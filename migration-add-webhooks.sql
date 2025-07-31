-- Migration: Add missing webhook fields to users table
-- Run this script to update existing database with new webhook fields

-- Add new webhook columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS post_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-post-group',
ADD COLUMN IF NOT EXISTS scan_members_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-scan-members';

-- Update existing users to have default webhook values (if null)
UPDATE users 
SET 
    post_webhook = '/api/webhook/zalo-post-group',
    scan_members_webhook = '/api/webhook/zalo-scan-members'
WHERE 
    post_webhook IS NULL 
    OR scan_members_webhook IS NULL;

-- Verify the changes
SELECT 
    username, 
    scan_webhook, 
    send_webhook, 
    post_webhook, 
    invite_webhook, 
    scan_members_webhook 
FROM users 
ORDER BY created_at DESC;

-- Success message
SELECT 'Migration completed successfully! All users now have 5 webhook fields.' as message; 