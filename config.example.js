// Supabase Configuration Example
// Copy this file to 'config.js' and fill in your Supabase details

const config = {
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    serviceRoleKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
  },
  
  // Example:
  // supabase: {
  //   url: 'https://xyzcompany.supabase.co',
  //   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //   serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  // },
  
  development: {
    port: 3000,
    host: 'localhost'
  }
};

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

// For browser
if (typeof window !== 'undefined') {
  window.CONFIG = config;
} 