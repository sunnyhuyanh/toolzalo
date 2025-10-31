// Supabase Configuration
// Replace these with your actual Supabase project details

const CONFIG = {
  supabase: {
    url: 'https://zisqqhzxzltsnlanbqmt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppc3FxaHp4emx0c25sYW5icW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDA4NzEsImV4cCI6MjA3NzQ3Njg3MX0.poPsCPAhTxZHzn43sS3XfHM-oW4W42Euf1Ksk9-BE1c',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppc3FxaHp4emx0c25sYW5icW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkwMDg3MSwiZXhwIjoyMDc3NDc2ODcxfQ.6_0gn6pytorWfLZJqPva2yjAJo0yH8HpKNAIKHGzvNA'
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