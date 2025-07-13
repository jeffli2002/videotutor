import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import { User, Mail, Lock, Eye, EyeOff, Calculator, Chrome } from 'lucide-react'
import authService from '../services/authService'

export default function AuthForm({ onAuthSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    role: 'student'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear message when user types
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const validateForm = () => {
    const { email, password, confirmPassword, name } = formData
    
    if (!email || !password) {
      setMessage({ type: 'error', text: '请填写邮箱和密码' })
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' })
      return false
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少6位' })
      return false
    }

    if (!isLogin) {
      if (!name.trim()) {
        setMessage({ type: 'error', text: '请输入姓名' })
        return false
      }

      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: '两次输入的密码不一致' })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let result

      if (isLogin) {
        result = await authService.signIn(formData.email, formData.password)
      } else {
        result = await authService.signUp(formData.email, formData.password, {
          fullName: formData.name,
          role: formData.role,
          gradeLevel: formData.grade
        })
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || (isLogin ? '登录成功！' : '注册成功！') 
        })
        
        // Call success callback after a short delay
        setTimeout(() => {
          onAuthSuccess?.(result.user)
        }, 1000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '操作失败，请重试' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      grade: '',
      role: 'student'
    })
    setMessage({ type: '', text: '' })
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await authService.signInWithGoogle()
      
      if (result.success) {
        setMessage({ type: 'success', text: '正在跳转到Google登录...' })
        // The redirect will happen automatically
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Google登录失败，请重试' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: '请先输入邮箱地址' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await authService.resetPassword(formData.email)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '重置密码失败，请重试' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-12 w-12 text-blue-600" />
            <span className="text-3xl font-bold text-white ml-2">MathTutor AI</span>
          </div>
          <p className="text-gray-200">Your AI-powered math learning companion</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-center">
                {isLogin ? 'Welcome Back!' : 'Join MathTutor AI'}
              </CardTitle>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              )}
            </div>
            <p className="text-center text-gray-600 text-sm">
              {isLogin 
                ? 'Sign in to continue your learning journey' 
                : 'Create your account to start learning'
              }
            </p>
          </CardHeader>
          <CardContent>
            {message.text && (
              <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                <AlertDescription className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!isLogin}
                    >
                      <option value="">Select your grade</option>
                      <option value="K">Kindergarten</option>
                      <option value="1">1st Grade</option>
                      <option value="2">2nd Grade</option>
                      <option value="3">3rd Grade</option>
                      <option value="4">4th Grade</option>
                      <option value="5">5th Grade</option>
                      <option value="6">6th Grade</option>
                      <option value="7">7th Grade</option>
                      <option value="8">8th Grade</option>
                      <option value="9">9th Grade</option>
                      <option value="10">10th Grade</option>
                      <option value="11">11th Grade</option>
                      <option value="12">12th Grade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      I am a:
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={formData.role === 'student'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Student
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="parent"
                          checked={formData.role === 'parent'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Parent
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="teacher"
                          checked={formData.role === 'teacher'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Teacher
                      </label>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-blue-600 hover:underline"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleForm}
                  className="ml-1 text-blue-600 hover:underline font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-800">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. 
                  We're committed to protecting your privacy and providing a safe learning environment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose MathTutor AI?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-blue-300">AI-Powered</div>
              <div className="text-gray-200">Personalized explanations</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-green-300">Progress Tracking</div>
              <div className="text-gray-200">Monitor improvement</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="font-medium text-purple-300">Gamified</div>
              <div className="text-gray-200">Fun and engaging</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}