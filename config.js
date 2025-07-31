// Supabase Configuration
// Replace these with your actual Supabase project details

const CONFIG = {
  supabase: {
    url: 'https://wylplwqvzbzywxrzcmvz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHBsd3F2emJ6eXd4cnpjbXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODE4OTIsImV4cCI6MjA2ODk1Nzg5Mn0.4BwDzu4R6nfj3McLT-YINs5NooW50I4N7tIOG8sD6-k',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHBsd3F2emJ6eXd4cnpjbXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM4MTg5MiwiZXhwIjoyMDY4OTU3ODkyfQ.Aw30r4jf3GLl4IuHELWN7wOEOKZz_GOMmGlZdCVQpgY'
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