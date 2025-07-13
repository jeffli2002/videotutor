import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader, Settings, Key } from 'lucide-react'

export default function ApiConfigurationTest() {
  const [apiStatus, setApiStatus] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState({})

  // Check environment variables on component mount
  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    const envStatus = {
      qwen: {
        configured: !!process.env.REACT_APP_QWEN_API_KEY,
        key: process.env.REACT_APP_QWEN_API_KEY ? 
          `${process.env.REACT_APP_QWEN_API_KEY.substring(0, 8)}...` : 'Not set',
        required: true
      },
      openai: {
        configured: !!process.env.REACT_APP_OPENAI_API_KEY,
        key: process.env.REACT_APP_OPENAI_API_KEY ? 
          `${process.env.REACT_APP_OPENAI_API_KEY.substring(0, 8)}...` : 'Not set',
        required: false
      },
      azure: {
        configured: !!process.env.REACT_APP_AZURE_SPEECH_KEY,
        key: process.env.REACT_APP_AZURE_SPEECH_KEY ? 
          `${process.env.REACT_APP_AZURE_SPEECH_KEY.substring(0, 8)}...` : 'Not set',
        required: false
      },
      did: {
        configured: !!process.env.REACT_APP_DID_API_KEY,
        key: process.env.REACT_APP_DID_API_KEY ? 
          `${process.env.REACT_APP_DID_API_KEY.substring(0, 8)}...` : 'Not set',
        required: false
      }
    }
    
    setApiStatus(envStatus)
  }

  const testQwenAPI = async () => {
    if (!process.env.REACT_APP_QWEN_API_KEY) {
      setTestResults(prev => ({
        ...prev,
        qwen: { success: false, error: 'API key not configured' }
      }))
      return
    }

    setIsLoading(true)
    try {
      console.log('Testing Qwen API...')
      
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_QWEN_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'user',
                content: '请简单解答：2 + 3 = ?'
              }
            ]
          },
          parameters: {
            temperature: 0.1,
            max_tokens: 100
          }
        })
      })

      const data = await response.json()
      console.log('Qwen API Response:', data)

      if (response.ok && data.output) {
        setTestResults(prev => ({
          ...prev,
          qwen: { 
            success: true, 
            data: {
              content: data.output.text,
              usage: data.usage,
              model: 'qwen-plus',
              requestId: data.request_id
            }
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          qwen: { 
            success: false, 
            error: data.message || `HTTP ${response.status}: ${response.statusText}`,
            code: data.code
          }
        }))
      }
    } catch (error) {
      console.error('Qwen API Test Error:', error)
      setTestResults(prev => ({
        ...prev,
        qwen: { success: false, error: error.message }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const testMathSolving = async () => {
    if (!process.env.REACT_APP_QWEN_API_KEY) return

    setIsLoading(true)
    try {
      const mathPrompt = `请解答这个数学问题，并用JSON格式回答：

题目：解方程 2x + 5 = 15

请按以下格式回答：
{
  "steps": [
    {"step": 1, "description": "移项", "operation": "2x = 15 - 5", "result": "2x = 10"},
    {"step": 2, "description": "系数化1", "operation": "x = 10 ÷ 2", "result": "x = 5"}
  ],
  "answer": "x = 5",
  "verification": "代入验证：2×5 + 5 = 15 ✓"
}`

      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是专业的数学老师，请用清晰的步骤解答数学问题。'
              },
              {
                role: 'user',
                content: mathPrompt
              }
            ]
          },
          parameters: {
            temperature: 0.1,
            max_tokens: 800
          }
        })
      })

      const data = await response.json()
      
      if (response.ok && data.output) {
        let parsedSolution = null
        try {
          // 尝试解析JSON响应
          const jsonMatch = data.output.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsedSolution = JSON.parse(jsonMatch[0])
          }
        } catch (parseError) {
          console.warn('JSON parsing failed, using raw response')
        }

        setTestResults(prev => ({
          ...prev,
          mathSolving: { 
            success: true, 
            data: {
              rawResponse: data.output.text,
              parsedSolution,
              usage: data.usage
            }
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          mathSolving: { success: false, error: data.message || 'API call failed' }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        mathSolving: { success: false, error: error.message }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (configured, required) => {
    if (configured) {
      return <Badge variant="default" className="bg-green-500">✓ 已配置</Badge>
    } else if (required) {
      return <Badge variant="destructive">✗ 必需</Badge>
    } else {
      return <Badge variant="outline">可选</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API配置测试</h1>
        <p className="text-gray-600">检查并测试您的API密钥配置</p>
      </div>

      {/* Environment Variables Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            环境变量状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(apiStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium capitalize">{service}</div>
                  <div className="text-sm text-gray-600">{status.key}</div>
                </div>
                {getStatusBadge(status.configured, status.required)}
              </div>
            ))}
          </div>
          
          {!apiStatus.qwen?.configured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">配置提醒</span>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                请在项目根目录创建 <code>.env</code> 文件并添加您的阿里云API密钥：
                <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs">
REACT_APP_QWEN_API_KEY=your_aliyun_api_key_here
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            API连接测试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Basic Qwen Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">基础连接测试</h4>
                <p className="text-sm text-gray-600">测试通义千问API基本连接</p>
              </div>
              <Button 
                onClick={testQwenAPI}
                disabled={isLoading || !apiStatus.qwen?.configured}
                variant="outline"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                测试连接
              </Button>
            </div>

            {/* Math Solving Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">数学解题测试</h4>
                <p className="text-sm text-gray-600">测试数学问题求解功能</p>
              </div>
              <Button 
                onClick={testMathSolving}
                disabled={isLoading || !apiStatus.qwen?.configured}
                variant="outline"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                测试数学解题
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <h4 className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1')}</h4>
                    <Badge 
                      variant={result.success ? "default" : "destructive"}
                      className="ml-auto"
                    >
                      {result.success ? '成功' : '失败'}
                    </Badge>
                  </div>
                  
                  {result.success ? (
                    <div className="space-y-2">
                      {result.data.content && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">AI回答:</p>
                          <p className="text-sm bg-green-50 p-2 rounded">{result.data.content}</p>
                        </div>
                      )}
                      
                      {result.data.parsedSolution && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">解题步骤:</p>
                          <div className="text-sm bg-blue-50 p-2 rounded">
                            {result.data.parsedSolution.steps?.map((step, index) => (
                              <div key={index} className="mb-1">
                                <strong>步骤{step.step}:</strong> {step.description} → {step.result}
                              </div>
                            ))}
                            <div className="mt-2 font-medium">
                              答案: {result.data.parsedSolution.answer}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {result.data.usage && (
                        <div className="text-xs text-gray-500">
                          Token使用: {result.data.usage.input_tokens} 输入 + {result.data.usage.output_tokens} 输出
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      错误: {result.error}
                      {result.code && <div>错误代码: {result.code}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>配置指南</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. 获取阿里云API密钥:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>登录 <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">阿里云DashScope控制台</a></li>
                <li>在API-KEY管理页面创建新的API密钥</li>
                <li>复制生成的API密钥（格式如：sk-xxxxxxxxxx）</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. 配置环境变量:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>在项目根目录创建 <code>.env</code> 文件</li>
                <li>添加行: <code>REACT_APP_QWEN_API_KEY=你的密钥</code></li>
                <li>重启开发服务器</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. 成本控制:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>qwen-plus: ¥0.004/1K tokens (推荐用于K12数学)</li>
                <li>qwen-turbo: ¥0.0008/1K tokens (简单问题)</li>
                <li>建议设置每日预算限制</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}