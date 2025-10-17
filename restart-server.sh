#!/bin/bash

echo "🔄 Restarting Server with Updated Config..."
echo ""

# Kill any existing node processes on port 3000
echo "🛑 Stopping existing server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   (No existing server found)"

echo ""
echo "✅ Server stopped"
echo ""
echo "🚀 Starting server with new config..."
echo "📝 Check logs below for config verification:"
echo ""
echo "Expected logs:"
echo "  - 🔧 [CONFIG] Service key ends with: nuQRrQTiqxSSnQamVr7A"
echo "  - ✅ Supabase service initialized with updated config"
echo "  - Supabase admin client initialized successfully"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Start server
npm start

