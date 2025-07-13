#!/usr/bin/env node

/**
 * Comprehensive Auto-Test Suite for MathTutor AI User Account Management
 * Tests both frontend and backend functionality
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import testing utilities
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class MathTutorAutoTest {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.apiUrl = 'http://localhost:8000';
    this.manimUrl = 'http://127.0.0.1:5001';
    this.testResults = [];
    this.testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test User',
      role: 'student',
      gradeLevel: '8'
    };
    this.generatedVideoId = null;
  }

  // Utility methods
  log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${status}: ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, status, message });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await axios({
        url,
        timeout: 30000,
        ...options
      });
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      };
    }
  }

  // Test 1: Environment and Service Availability
  async testEnvironment() {
    this.log('🌍 Testing Environment and Service Availability', 'TEST');
    
    // Test frontend server
    const frontendTest = await this.makeRequest(this.baseUrl);
    if (frontendTest.success) {
      this.log('✅ Frontend server is running', 'PASS');
    } else {
      this.log(`❌ Frontend server not accessible: ${frontendTest.error}`, 'FAIL');
      return false;
    }

    // Test QWEN API proxy
    const qwenTest = await this.makeRequest(`${this.apiUrl}/api/qwen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        api_key: 'test_key',
        messages: [{ role: 'user', content: 'test' }]
      }
    });
    if (qwenTest.status === 500 || qwenTest.data) {
      this.log('✅ QWEN API proxy is responding', 'PASS');
    } else {
      this.log(`❌ QWEN API proxy not accessible: ${qwenTest.error}`, 'FAIL');
    }

    // Test Manim server
    const manimTest = await this.makeRequest(`${this.manimUrl}/health`);
    if (manimTest.success) {
      this.log('✅ Manim server is running', 'PASS');
    } else {
      this.log(`❌ Manim server not accessible: ${manimTest.error}`, 'FAIL');
    }

    // Check environment variables
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_QWEN_API_KEY')) {
        this.log('✅ Environment variables configured', 'PASS');
      } else {
        this.log('❌ Missing required environment variables', 'FAIL');
      }
    } else {
      this.log('❌ .env file not found', 'FAIL');
    }

    return true;
  }

  // Test 2: Supabase Database Connection
  async testDatabase() {
    this.log('🗄️  Testing Database Connection and Schema', 'TEST');
    
    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      
      // Read environment variables
      const envPath = path.join(process.cwd(), '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
      const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

      if (!supabaseUrl || !supabaseKey) {
        this.log('❌ Supabase credentials not found in .env', 'FAIL');
        return false;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Test database connection by querying auth users (should work with anon key)
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        this.log(`❌ Database connection failed: ${error.message}`, 'FAIL');
        return false;
      } else {
        this.log('✅ Database connection successful', 'PASS');
      }

      // Test if tables exist by attempting to query them
      const tables = ['profiles', 'videos', 'user_preferences'];
      for (const table of tables) {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError && !tableError.message.includes('0 rows')) {
          this.log(`❌ Table '${table}' not accessible: ${tableError.message}`, 'FAIL');
        } else {
          this.log(`✅ Table '${table}' exists and accessible`, 'PASS');
        }
      }

      return true;
    } catch (error) {
      this.log(`❌ Database test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 3: Authentication Service
  async testAuthentication() {
    this.log('🔐 Testing Authentication Service', 'TEST');
    
    try {
      // Import auth service
      const authModule = await import('./src/services/authService.js');
      const authService = authModule.default;

      // Test initialization
      await authService.initialize();
      this.log('✅ Auth service initialized', 'PASS');

      // Test user registration
      this.log(`📝 Testing user registration for ${this.testUser.email}`, 'INFO');
      const signUpResult = await authService.signUp(
        this.testUser.email, 
        this.testUser.password, 
        {
          fullName: this.testUser.fullName,
          role: this.testUser.role,
          gradeLevel: this.testUser.gradeLevel
        }
      );

      if (signUpResult.success) {
        this.log('✅ User registration successful', 'PASS');
        this.testUser.id = signUpResult.user?.id;
      } else {
        // If user already exists, try to sign in instead
        if (signUpResult.error.includes('already registered')) {
          this.log('⚠️  User already exists, attempting sign in', 'WARN');
          const signInResult = await authService.signIn(this.testUser.email, this.testUser.password);
          if (signInResult.success) {
            this.log('✅ User sign in successful', 'PASS');
            this.testUser.id = signInResult.user?.id;
          } else {
            this.log(`❌ User sign in failed: ${signInResult.error}`, 'FAIL');
            return false;
          }
        } else {
          this.log(`❌ User registration failed: ${signUpResult.error}`, 'FAIL');
          return false;
        }
      }

      // Test getting current user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === this.testUser.email) {
        this.log('✅ Current user retrieval successful', 'PASS');
      } else {
        this.log('❌ Current user retrieval failed', 'FAIL');
      }

      // Test authentication status
      if (authService.isAuthenticated()) {
        this.log('✅ Authentication status check passed', 'PASS');
      } else {
        this.log('❌ Authentication status check failed', 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ Authentication test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 4: User Service and Database Operations
  async testUserService() {
    this.log('👤 Testing User Service and Database Operations', 'TEST');
    
    try {
      // Import user service
      const userModule = await import('./src/services/userService.js');
      const userService = userModule.default;

      // Test getting user profile
      const profile = await userService.getCurrentUserProfile();
      if (profile && profile.email === this.testUser.email) {
        this.log('✅ User profile retrieval successful', 'PASS');
      } else {
        this.log('❌ User profile retrieval failed', 'FAIL');
      }

      // Test getting user preferences
      const preferences = await userService.getUserPreferences();
      if (preferences) {
        this.log('✅ User preferences retrieval successful', 'PASS');
      } else {
        this.log('⚠️  User preferences not found (may be normal for new user)', 'WARN');
      }

      // Test rate limiting check
      const rateLimitCheck = await userService.canGenerateVideo();
      if (rateLimitCheck.canGenerate) {
        this.log('✅ Rate limit check passed - user can generate videos', 'PASS');
      } else {
        this.log(`❌ Rate limit check failed: ${rateLimitCheck.reason}`, 'FAIL');
      }

      // Test getting user videos (should be empty for new user)
      const userVideos = await userService.getUserVideos();
      if (userVideos.success) {
        this.log(`✅ User videos retrieval successful (${userVideos.data.length} videos)`, 'PASS');
      } else {
        this.log(`❌ User videos retrieval failed: ${userVideos.error}`, 'FAIL');
      }

      // Test getting user statistics
      const userStats = await userService.getUserStats();
      if (userStats.success) {
        this.log(`✅ User statistics retrieval successful`, 'PASS');
        this.log(`📊 Stats: ${userStats.data.totalVideos} total videos`, 'INFO');
      } else {
        this.log(`❌ User statistics retrieval failed: ${userStats.error}`, 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ User service test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 5: Video Generation and Storage
  async testVideoGeneration() {
    this.log('🎬 Testing Video Generation and Storage', 'TEST');
    
    try {
      // Import user service for video operations
      const userModule = await import('./src/services/userService.js');
      const userService = userModule.default;

      // Simulate video generation result
      const testVideoData = {
        title: `Auto Test Video - ${new Date().toISOString()}`,
        description: 'Automated test video for user account management system',
        question: '解方程：2x + 5 = 15',
        videoUrl: '/rendered_videos/test_video_auto.mp4',
        thumbnailUrl: '/images/test-thumbnail.jpg',
        duration: 180,
        language: 'zh',
        mathTopics: ['代数', '一元一次方程'],
        difficultyLevel: 'intermediate',
        solutionData: {
          content: 'Test solution content for automated testing',
          usage: { total_tokens: 100 },
          model: 'test-model',
          script: { scenes: [] }
        }
      };

      // Test saving video to database
      this.log('💾 Testing video save to database', 'INFO');
      const saveResult = await userService.saveVideo(testVideoData);
      
      if (saveResult.success) {
        this.log('✅ Video save to database successful', 'PASS');
        this.generatedVideoId = saveResult.data.id;
        this.log(`📹 Generated video ID: ${this.generatedVideoId}`, 'INFO');
      } else {
        this.log(`❌ Video save to database failed: ${saveResult.error}`, 'FAIL');
        return false;
      }

      // Test retrieving the saved video
      if (this.generatedVideoId) {
        const videoResult = await userService.getVideoById(this.generatedVideoId);
        if (videoResult.success && videoResult.data.title === testVideoData.title) {
          this.log('✅ Video retrieval by ID successful', 'PASS');
        } else {
          this.log(`❌ Video retrieval by ID failed: ${videoResult.error || 'Data mismatch'}`, 'FAIL');
        }
      }

      // Test updating the video
      if (this.generatedVideoId) {
        const updateResult = await userService.updateVideo(this.generatedVideoId, {
          description: 'Updated description for automated test'
        });
        if (updateResult.success) {
          this.log('✅ Video update successful', 'PASS');
        } else {
          this.log(`❌ Video update failed: ${updateResult.error}`, 'FAIL');
        }
      }

      // Test getting user videos again (should now include our test video)
      const updatedUserVideos = await userService.getUserVideos();
      if (updatedUserVideos.success && updatedUserVideos.data.length > 0) {
        this.log(`✅ Updated user videos list contains ${updatedUserVideos.data.length} video(s)`, 'PASS');
      } else {
        this.log('❌ Updated user videos list retrieval failed', 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ Video generation test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 6: Manim Integration
  async testManimIntegration() {
    this.log('🧮 Testing Manim Server Integration', 'TEST');
    
    try {
      // Test Manim health endpoint
      const healthCheck = await this.makeRequest(`${this.manimUrl}/health`);
      if (healthCheck.success) {
        this.log('✅ Manim server health check passed', 'PASS');
      } else {
        this.log(`❌ Manim server health check failed: ${healthCheck.error}`, 'FAIL');
        return false;
      }

      // Test Manim video generation
      const testScript = `
from manim import *
class TestScene(Scene):
    def construct(self):
        title = Text("Auto Test Video", font_size=36, color=BLUE)
        self.play(Write(title), run_time=2)
        self.wait(1)
`;

      const renderRequest = await this.makeRequest(`${this.manimUrl}/api/manim_render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          script: testScript,
          output_name: 'autotest_video',
          scene_name: 'TestScene'
        }
      });

      if (renderRequest.success && renderRequest.data.success) {
        this.log('✅ Manim video generation successful', 'PASS');
        this.log(`📹 Generated video URL: ${renderRequest.data.video_url}`, 'INFO');
      } else {
        this.log(`❌ Manim video generation failed: ${renderRequest.error || renderRequest.data?.error}`, 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ Manim integration test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 7: Frontend Component Integration
  async testFrontendIntegration() {
    this.log('🖥️  Testing Frontend Component Integration', 'TEST');
    
    try {
      // Test if key frontend files exist
      const frontendFiles = [
        'src/App.jsx',
        'src/components/AuthForm.jsx',
        'src/components/VideoGenerationDemo.jsx',
        'src/components/MyVideos.jsx',
        'src/services/authService.js',
        'src/services/userService.js',
        'src/config/supabase.js'
      ];

      for (const file of frontendFiles) {
        if (fs.existsSync(file)) {
          this.log(`✅ Frontend file exists: ${file}`, 'PASS');
        } else {
          this.log(`❌ Frontend file missing: ${file}`, 'FAIL');
        }
      }

      // Test if frontend server is serving the app
      const frontendTest = await this.makeRequest(this.baseUrl);
      if (frontendTest.success && frontendTest.data.includes('MathTutor')) {
        this.log('✅ Frontend application is accessible', 'PASS');
      } else {
        this.log('❌ Frontend application not properly accessible', 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ Frontend integration test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Test 8: Cleanup Test Data
  async testCleanup() {
    this.log('🧹 Cleaning up test data', 'TEST');
    
    try {
      const userModule = await import('./src/services/userService.js');
      const userService = userModule.default;

      // Delete test video if created
      if (this.generatedVideoId) {
        const deleteResult = await userService.deleteVideo(this.generatedVideoId);
        if (deleteResult.success) {
          this.log('✅ Test video deleted successfully', 'PASS');
        } else {
          this.log(`❌ Test video deletion failed: ${deleteResult.error}`, 'FAIL');
        }
      }

      // Sign out test user
      const authModule = await import('./src/services/authService.js');
      const authService = authModule.default;
      
      const signOutResult = await authService.signOut();
      if (signOutResult.success) {
        this.log('✅ Test user signed out successfully', 'PASS');
      } else {
        this.log(`❌ Test user sign out failed: ${signOutResult.error}`, 'FAIL');
      }

      return true;
    } catch (error) {
      this.log(`❌ Cleanup test failed: ${error.message}`, 'FAIL');
      return false;
    }
  }

  // Generate Test Report
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warningTests = this.testResults.filter(r => r.status === 'WARN').length;

    const report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    MathTutor AI Auto-Test Report                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Test Summary:                                                                ║
║   Total Tests: ${totalTests.toString().padStart(3)}                                                        ║
║   Passed:      ${passedTests.toString().padStart(3)} ✅                                                      ║
║   Failed:      ${failedTests.toString().padStart(3)} ❌                                                      ║
║   Warnings:    ${warningTests.toString().padStart(3)} ⚠️                                                       ║
║                                                                              ║
║ Success Rate: ${((passedTests / totalTests) * 100).toFixed(1).padStart(5)}%                                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 Detailed Test Results:
${this.testResults.map(r => `${r.status.padStart(4)} | ${r.message}`).join('\n')}

🎯 Test Categories Coverage:
✅ Environment & Services
✅ Database Connection & Schema  
✅ User Authentication System
✅ User Management Service
✅ Video Generation & Storage
✅ Manim Server Integration
✅ Frontend Component Integration
✅ Data Cleanup

${failedTests === 0 ? 
  '🎉 ALL TESTS PASSED! The user account management system is working correctly.' :
  '⚠️  Some tests failed. Please review the detailed results above and fix any issues.'
}
`;

    return report;
  }

  // Main test runner
  async runAllTests() {
    console.log('🚀 Starting MathTutor AI Auto-Test Suite...\n');
    
    const tests = [
      () => this.testEnvironment(),
      () => this.testDatabase(),
      () => this.testAuthentication(),
      () => this.testUserService(),
      () => this.testVideoGeneration(),
      () => this.testManimIntegration(),
      () => this.testFrontendIntegration(),
      () => this.testCleanup()
    ];

    for (let i = 0; i < tests.length; i++) {
      this.log(`\n📋 Running Test Suite ${i + 1}/${tests.length}`, 'TEST');
      await tests[i]();
      await this.delay(1000); // Small delay between test suites
    }

    const report = this.generateReport();
    console.log(report);

    // Write report to file
    const reportPath = path.join(process.cwd(), 'test-report.txt');
    fs.writeFileSync(reportPath, report);
    this.log(`📄 Test report saved to: ${reportPath}`, 'INFO');

    return this.testResults.filter(r => r.status === 'FAIL').length === 0;
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoTest = new MathTutorAutoTest();
  autoTest.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Auto-test suite failed:', error);
      process.exit(1);
    });
}

export default MathTutorAutoTest;