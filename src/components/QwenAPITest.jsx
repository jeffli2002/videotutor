import React, { useState } from 'react'

const QwenAPITest = () => {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const testQwenAPI = async () => {
    const keyToTest = apiKey || process.env.REACT_APP_QWEN_API_KEY
    
    if (!keyToTest) {
      setTestResult({
        success: false,
        error: 'API key not found. Please set REACT_APP_QWEN_API_KEY in .env file or enter it below.'
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('Testing Qwen API...')
      console.log('API Key (first 8 chars):', keyToTest.substring(0, 8) + '...')
      
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是专业的K12数学老师，请用清晰的中文解释数学概念。'
              },
              {
                role: 'user',
                content: '请解答这个简单的数学问题：2 + 3 = ? 并解释计算过程。'
              }
            ]
          },
          parameters: {
            temperature: 0.1,
            max_tokens: 200,
            top_p: 0.8
          }
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.output) {
        setTestResult({
          success: true,
          data: {
            content: data.output.text,
            usage: data.usage,
            model: 'qwen-plus',
            requestId: data.request_id,
            status: response.status
          }
        })
      } else {
        setTestResult({
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code,
          requestId: data.request_id,
          details: data
        })
      }
    } catch (error) {
      console.error('API Test Error:', error)
      setTestResult({
        success: false,
        error: error.message,
        type: error.name
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testMathProblem = async () => {
    const keyToTest = apiKey || process.env.REACT_APP_QWEN_API_KEY
    
    if (!keyToTest) {
      setTestResult({
        success: false,
        error: 'API key not configured'
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('Testing math problem solving...')
      
      const mathPrompt = `请解答这个K12数学问题，并用JSON格式回答：

题目：解方程 2x + 5 = 15

请按以下格式回答：
{
  "analysis": "问题分析",
  "steps": [
    {"stepNumber": 1, "description": "移项", "operation": "2x = 15 - 5", "result": "2x = 10"},
    {"stepNumber": 2, "description": "系数化1", "operation": "x = 10 ÷ 2", "result": "x = 5"}
  ],
  "finalAnswer": "x = 5",
  "verification": "验证：2×5 + 5 = 15 ✓",
  "concepts": ["一元一次方程", "移项", "系数化1"]
}`

      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是专业的K12数学老师，请严格按照要求的JSON格式回答数学问题。'
              },
              {
                role: 'user',
                content: mathPrompt
              }
            ]
          },
          parameters: {
            temperature: 0.05,
            max_tokens: 1000,
            top_p: 0.9
          }
        })
      })

      const data = await response.json()
      console.log('Math test response:', data)

      if (response.ok && data.output) {
        let parsedSolution = null
        try {
          // 尝试提取和解析JSON
          const jsonMatch = data.output.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsedSolution = JSON.parse(jsonMatch[0])
          }
        } catch (parseError) {
          console.warn('JSON parsing failed:', parseError)
        }

        setTestResult({
          success: true,
          data: {
            rawResponse: data.output.text,
            parsedSolution,
            usage: data.usage,
            model: 'qwen-plus',
            testType: 'math_solving'
          }
        })
      } else {
        setTestResult({
          success: false,
          error: data.message || 'Math test failed',
          code: data.code
        })
      }
    } catch (error) {
      console.error('Math test error:', error)
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Qwen API 连接测试
      </h1>

      {/* API Key Input */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0, color: '#555' }}>API Key 配置</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          环境变量状态: {process.env.REACT_APP_QWEN_API_KEY ? 
            `已配置 (${process.env.REACT_APP_QWEN_API_KEY.substring(0, 8)}...)` : 
            '未配置'
          }
        </p>
        
        {!process.env.REACT_APP_QWEN_API_KEY && (
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              临时输入 API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        )}
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testQwenAPI}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? '测试中...' : '基础连接测试'}
        </button>

        <button
          onClick={testMathProblem}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 20px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? '测试中...' : '数学解题测试'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
          }}></div>
          正在测试 API 连接...
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: testResult.success ? '#155724' : '#721c24' 
          }}>
            测试结果: {testResult.success ? '✅ 成功' : '❌ 失败'}
          </h3>

          {testResult.success ? (
            <div>
              {testResult.data.content && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>AI 回答:</strong>
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: 'rgba(255,255,255,0.8)', 
                    borderRadius: '4px',
                    marginTop: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {testResult.data.content}
                  </div>
                </div>
              )}

              {testResult.data.parsedSolution && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>解析的数学解答:</strong>
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: 'rgba(255,255,255,0.8)', 
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    <div><strong>分析:</strong> {testResult.data.parsedSolution.analysis}</div>
                    <div><strong>最终答案:</strong> {testResult.data.parsedSolution.finalAnswer}</div>
                    {testResult.data.parsedSolution.steps && (
                      <div>
                        <strong>解题步骤:</strong>
                        {testResult.data.parsedSolution.steps.map((step, index) => (
                          <div key={index} style={{ marginLeft: '20px', marginTop: '5px' }}>
                            步骤{step.stepNumber}: {step.description} → {step.result}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {testResult.data.usage && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Token 使用情况:</strong> 
                  输入 {testResult.data.usage.input_tokens} + 
                  输出 {testResult.data.usage.output_tokens} = 
                  总计 {testResult.data.usage.total_tokens} tokens
                </div>
              )}
            </div>
          ) : (
            <div>
              <strong>错误信息:</strong> {testResult.error}
              {testResult.code && <div><strong>错误代码:</strong> {testResult.code}</div>}
              {testResult.details && (
                <details style={{ marginTop: '10px' }}>
                  <summary>详细信息</summary>
                  <pre style={{ 
                    fontSize: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.8)', 
                    padding: '10px',
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>使用说明:</h3>
        <ol style={{ paddingLeft: '20px', color: '#856404' }}>
          <li>确保在项目根目录有 <code>.env</code> 文件</li>
          <li>在 <code>.env</code> 文件中添加: <code>REACT_APP_QWEN_API_KEY=你的API密钥</code></li>
          <li>重启开发服务器</li>
          <li>或者在上面临时输入API密钥进行测试</li>
        </ol>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default QwenAPITest