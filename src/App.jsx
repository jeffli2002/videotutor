import React, { useState, useEffect } from 'react'
import QwenAPITest from './components/QwenAPITest'
import VideoGenerationDemo from './components/VideoGenerationDemo'
import AuthForm from './components/AuthForm'
import MyVideos from './components/MyVideos'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Calculator, Play, Settings, TestTube, User, LogOut, Video, UserCircle } from 'lucide-react'
import authService from './services/authService'
import { supabase } from './config/supabase'
import { Routes, Route, useNavigate } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()
  React.useEffect(() => {
    // 让 Supabase 处理 OAuth 回调
    import('./config/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(() => {
        navigate('/')
      })
    })
  }, [navigate])
  return <div>登录处理中...</div>
}

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [apiStatus, setApiStatus] = useState({
    qwen: false,
    configured: false
  })
  const [user, setUser] = useState(null)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    // Initialize authentication
    const initAuth = async () => {
      try {
        const initialized = await authService.initialize()
        if (initialized) {
          const currentUser = authService.getCurrentUser()
          setUser(currentUser)
          console.log('App: Auth initialized, current user:', currentUser?.email || 'none')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setAuthInitialized(true)
      }
    }
    
    // Set up auth state change handler
    const handleAuthChange = (user) => {
      console.log('App: Auth state changed, user:', user?.email || 'none')
      setUser(user)
      if (user) {
        setShowAuthForm(false)
        setCurrentView(v => (v === 'home' || !v) ? 'home' : v)
      }
    }
    
    // Register the handler with auth service
    authService.onAuthChange = handleAuthChange
    
    initAuth()
    
    // Add global debugging functions
    if (typeof window !== 'undefined') {
      window.authService = authService
      window.supabase = supabase
      window.testAuth = {
        checkSession: () => authService.checkSession(),
        refreshSession: () => authService.refreshSession(),
        getUser: () => authService.getCurrentUser(),
        signInWithGoogle: () => authService.signInWithGoogle(),
        getSupabaseSession: () => supabase.auth.getSession()
      }
      console.log('🔧 Debug functions available:')
      console.log('  - window.testAuth.checkSession()')
      console.log('  - window.testAuth.signInWithGoogle()')
      console.log('  - window.authService (direct access)')
      console.log('  - window.supabase (direct access)')
    }
    
    // Check API configuration status
    const checkApiStatus = () => {
      const qwenKey = import.meta.env.VITE_QWEN_API_KEY
      setApiStatus({
        qwen: !!qwenKey,
        configured: !!qwenKey
      })
    }
    
    checkApiStatus()
    console.log('API配置状态:', {
      qwen: !!import.meta.env.VITE_QWEN_API_KEY,
      debug: import.meta.env.VITE_DEBUG_MODE
    })
    
    // Cleanup
    return () => {
      authService.onAuthChange = null
    }
  }, [])

  useEffect(() => {
    console.log('currentView变化:', currentView)
  }, [currentView])

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
    setShowAuthForm(false)
    setCurrentView('home')
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setCurrentView('home')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const requireAuth = (view) => {
    if (!user) {
      setShowAuthForm(true)
      return false
    }
    setCurrentView(view)
    return true
  }

  const renderView = () => {
    if (!authInitialized) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">初始化中...</p>
          </div>
        </div>
      )
    }

    switch(currentView) {
      case 'api-test':
        return <QwenAPITest />
      case 'video-demo':
        return <VideoGenerationDemo user={user} onLoginRequired={() => setShowAuthForm(true)} />
      case 'my-videos':
        return user ? <MyVideos /> : null
      default:
        return (
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Calculator className="h-12 w-12 text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold text-gray-900">MathTutor AI</h1>
                <Badge variant="secondary" className="ml-3">
                  {user ? `Welcome, ${user.email}` : 'Testing Environment'}
                </Badge>
              </div>
              <p className="text-xl text-gray-600">
                K12数学AI视频生成测试平台
              </p>
            </div>

            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  API配置状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">通义千问 API</div>
                      <div className="text-sm text-gray-600">
                        {apiStatus.qwen ? 
                          `已配置 (${import.meta.env.VITE_QWEN_API_KEY?.substring(0, 8)}...)` : 
                          '未配置'
                        }
                      </div>
                    </div>
                    <Badge variant={apiStatus.qwen ? "default" : "destructive"}>
                      {apiStatus.qwen ? "✓ 就绪" : "✗ 缺失"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">系统状态</div>
                      <div className="text-sm text-gray-600">
                        {apiStatus.configured ? '可以开始测试' : '需要配置API'}
                      </div>
                    </div>
                    <Badge variant={apiStatus.configured ? "default" : "outline"}>
                      {apiStatus.configured ? "✓ 正常" : "⚠ 等待"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TestTube className="h-6 w-6 text-blue-600 mr-2" />
                    API连接测试
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    测试通义千问API连接状态，验证基础功能和数学解题能力
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div>• 基础连接测试</div>
                    <div>• 数学解题测试</div>
                    <div>• JSON格式验证</div>
                    <div>• 成本预估</div>
                  </div>
                  <Button 
                    onClick={() => setCurrentView('api-test')}
                    className="w-full"
                    disabled={!apiStatus.qwen}
                  >
                    开始API测试
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-6 w-6 text-green-600 mr-2" />
                    视频生成演示
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    完整的AI数学视频生成流程演示，包含多语言支持
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div>• 多语言数学问题输入</div>
                    <div>• AI解题过程模拟</div>
                    <div>• 视频生成流程</div>
                    <div>• 成本分析</div>
                  </div>
                  <Button 
                    onClick={() => setCurrentView('video-demo')}
                    className="w-full"
                    disabled={!apiStatus.qwen}
                  >
                    开始视频测试
                  </Button>
                </CardContent>
              </Card>

              {/* My Videos Card - only show if user is authenticated */}
              {user && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="h-6 w-6 text-purple-600 mr-2" />
                      我的视频
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      查看和管理您创建的AI数学教学视频
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div>• 视频播放和下载</div>
                      <div>• 分享和管理</div>
                      <div>• 学习统计</div>
                      <div>• 收藏夹功能</div>
                    </div>
                    <Button 
                      onClick={() => setCurrentView('my-videos')}
                      className="w-full"
                    >
                      查看我的视频
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>测试环境信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-800">推荐模型</div>
                    <div className="text-blue-600">qwen-plus</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-800">预估成本</div>
                    <div className="text-green-600">¥0.004/1K tokens</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-purple-800">支持语言</div>
                    <div className="text-purple-600">中文、英文等</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. API连接测试</h4>
                    <p className="text-sm text-gray-600">
                      首先点击"开始API测试"验证你的通义千问API是否正常工作，包括基础连接和数学解题功能。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">2. 视频生成演示</h4>
                    <p className="text-sm text-gray-600">
                      API测试通过后，点击"开始视频测试"体验完整的AI数学视频生成流程。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">3. 功能特色</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 支持文本、图片、语音多种输入方式</li>
                      <li>• 实时生成进度显示</li>
                      <li>• 成本透明化计算</li>
                      <li>• 多语言界面支持</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      {currentView !== 'home' && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">MathTutor AI</span>
                <Badge variant="outline">Testing</Badge>
              </div>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('home')}
                >
                  返回主页
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('api-test')}
                  disabled={currentView === 'api-test'}
                >
                  API测试
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('video-demo')}
                  disabled={currentView === 'video-demo'}
                >
                  视频演示
                </Button>
                {user && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('my-videos')}
                    disabled={currentView === 'my-videos'}
                  >
                    我的视频
                  </Button>
                )}
                {user ? (
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuthForm(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    登录
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="py-8">
        {renderView()}
      </main>

      {/* Quick Access Buttons on Home Page */}
      {currentView === 'home' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          {!user ? (
            <Button 
              onClick={() => setShowAuthForm(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <User className="h-4 w-4 mr-2" />
              登录/注册
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentView('my-videos')}
              className="bg-purple-600 hover:bg-purple-700 shadow-lg"
            >
              <Video className="h-4 w-4 mr-2" />
              我的视频
            </Button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>MathTutor AI 测试环境 - K12数学AI视频生成平台</p>
            <p className="text-sm mt-2">API状态: {apiStatus.configured ? '✅ 已配置' : '❌ 未配置'}</p>
            {user && (
              <p className="text-sm mt-1">用户: {user.email}</p>
            )}
          </div>
        </div>
      </footer>

      {/* Authentication Form Modal */}
      {showAuthForm && (
        <AuthForm 
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthForm(false)}
        />
      )}
    </div>
  )
}

export default App