// Supabase Configuration
// Replace these with your actual Supabase project details

const CONFIG = {
  supabase: {
    url: 'https://lbnhswcnwckdyrqnoply.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxibmhzd2Nud2NrZHlycW5vcGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMjk3NTIsImV4cCI6MjA2MDgwNTc1Mn0.OHrJ3Zi9nlmqnJU2eMsmemNbjkjna0jJpoblHeTLe8U',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxibmhzd2Nud2NrZHlycW5vcGx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIyOTc1MiwiZXhwIjoyMDYwODA1NzUyfQ.1aETbU90tZT16Yk1hrSle2CnuQRrQTiqxSSnQamVr7A'
  },
  
  // For development, you can temporarily use demo config:
  // supabase: {
  //   url: 'https://demo.supabase.co',
  //   anonKey: 'demo_key_123',
  //   serviceRoleKey: 'demo_service_key_456'
  // },
  
  development: {
    port: 3000,
    host: 'localhost'
  }
};

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// For browser
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
} 