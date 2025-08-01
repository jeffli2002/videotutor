#!/bin/bash

echo "🧪 OAuth Session Testing Instructions"
echo "===================================="
echo ""
echo "✅ FIXES APPLIED:"
echo "• Singleton pattern for auth service"
echo "• Prevention of duplicate initialization"
echo "• Better session management"
echo "• Debug functions added to window object"
echo ""
echo "🔧 DEBUG TOOLS AVAILABLE:"
echo "Open browser console and use:"
echo ""
echo "📊 Check current session:"
echo "   window.testAuth.checkSession()"
echo ""
echo "🔄 Refresh session:"
echo "   window.testAuth.refreshSession()"
echo ""
echo "👤 Get current user:"
echo "   window.testAuth.getUser()"
echo ""
echo "🔐 Test Google OAuth:"
echo "   window.testAuth.signInWithGoogle()"
echo ""
echo "🧪 TESTING WORKFLOW:"
echo ""
echo "Step 1: Initial Check"
echo "→ Open http://localhost:5174"
echo "→ Open Console (F12)"
echo "→ Run: window.testAuth.checkSession()"
echo "→ Should show: {hasUser: false}"
echo ""
echo "Step 2: Test Google OAuth"
echo "→ Click 'Continue with Google' or run: window.testAuth.signInWithGoogle()"
echo "→ Complete Google authorization"
echo "→ After redirect, immediately run: window.testAuth.checkSession()"
echo "→ Should show: {hasUser: true, userEmail: 'your@email.com'}"
echo ""
echo "Step 3: Verify Session Persistence"
echo "→ Refresh page (F5)"
echo "→ Run: window.testAuth.checkSession()"
echo "→ Should still show logged in user"
echo ""
echo "🔍 TROUBLESHOOTING:"
echo ""
echo "If session not found after OAuth:"
echo "1. Check browser console for errors"
echo "2. Verify redirect URLs in Supabase match exactly"
echo "3. Try running: window.testAuth.refreshSession()"
echo "4. Check browser storage (DevTools → Application → Storage)"
echo ""
echo "Common causes:"
echo "• Browser blocking third-party cookies"
echo "• Incorrect redirect URL configuration"
echo "• Supabase site URL mismatch"
echo "• Browser in private/incognito mode with strict settings"
echo ""
echo "🎯 EXPECTED CONSOLE OUTPUT:"
echo "✅ 'Initializing auth service...'"
echo "✅ 'Auth service initialized: {hasSession: false}'"
echo "✅ '🔧 Debug functions available: window.testAuth'"
echo "✅ After OAuth: 'Auth state changed: SIGNED_IN [email]'"
echo ""
echo "🚀 Ready for manual OAuth testing!"