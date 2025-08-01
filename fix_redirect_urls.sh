#!/bin/bash

echo "🔧 Supabase Redirect URL Fix"
echo "=============================="
echo ""
echo "❌ INVALID FORMAT (causes error):"
echo "   http://localhost:5173/**"
echo ""
echo "✅ CORRECT FORMAT:"
echo "   Add each URL separately in Supabase → Authentication → URL Configuration"
echo ""
echo "📋 EXACT URLS TO ADD:"
echo "1. Site URL:"
echo "   http://localhost:5173"
echo ""
echo "2. Redirect URLs (click 'Add URL' for each):"
echo "   • http://localhost:5173"
echo "   • http://localhost:5173/"
echo "   • http://localhost:5173/auth/callback"
echo ""
echo "🎯 STEPS TO FIX:"
echo "1. Go to https://app.supabase.com/"
echo "2. Select your project"
echo "3. Go to Authentication → URL Configuration"
echo "4. Set Site URL to: http://localhost:5173"
echo "5. In Redirect URLs section:"
echo "   • Click 'Add URL'"
echo "   • Enter: http://localhost:5173"
echo "   • Click 'Add URL' again"
echo "   • Enter: http://localhost:5173/"
echo "   • Click 'Add URL' again"
echo "   • Enter: http://localhost:5173/auth/callback"
echo "6. Click 'Save'"
echo ""
echo "⚠️  IMPORTANT:"
echo "• NO wildcards (**) allowed in Supabase redirect URLs"
echo "• Each URL must be added separately"
echo "• Exact URLs only, no patterns"
echo ""
echo "🚀 After fixing, test Google OAuth login!"