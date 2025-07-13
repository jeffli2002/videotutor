# Aliyun Qwen API Configuration Guide

## 🔑 API Key Configuration

### Step 1: Create Environment File

Create a `.env` file in your project root directory:

```bash
# Navigate to your project directory
cd /mnt/d/AI/VideoTutor

# Create .env file
touch .env
```

### Step 2: Add Your API Keys to .env

```env
# Aliyun DashScope API Configuration
REACT_APP_QWEN_API_KEY=your_aliyun_api_key_here
REACT_APP_QWEN_REGION=cn-beijing
REACT_APP_QWEN_ENDPOINT=https://dashscope.aliyuncs.com

# Other API Keys (add as needed)
REACT_APP_OPENAI_API_KEY=your_openai_key_here
REACT_APP_AZURE_SPEECH_KEY=your_azure_key_here
REACT_APP_AZURE_REGION=eastasia
REACT_APP_DID_API_KEY=your_did_key_here

# App Configuration
REACT_APP_API_TIMEOUT=30000
REACT_APP_MAX_RETRIES=3
REACT_APP_ENABLE_CACHE=true
```

### Step 3: Verify API Key Format

Your Aliyun API key should look like this:
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Test API Connection

Use this test component to verify your configuration:

```javascript
// Test component in src/components/ApiTest.jsx
import { useEffect, useState } from 'react'

export default function ApiTest() {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testQwenAPI = async () => {
    setIsLoading(true)
    try {
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
                role: 'user',
                content: '测试：1+1等于多少？'
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
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API连接测试</h3>
      
      <button 
        onClick={testQwenAPI}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '测试中...' : '测试通义千问API'}
      </button>

      {testResult && (
        <div className="mt-4 p-4 rounded" style={{
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          color: testResult.success ? '#155724' : '#721c24'
        }}>
          <h4 className="font-semibold">测试结果:</h4>
          <pre className="text-sm mt-2 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
```

## 🛠️ Complete Configuration Setup

### Environment Variables Validation

```javascript
// src/config/envValidation.js
export const validateEnvironment = () => {
  const requiredEnvVars = {
    REACT_APP_QWEN_API_KEY: process.env.REACT_APP_QWEN_API_KEY,
  }

  const optionalEnvVars = {
    REACT_APP_OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
    REACT_APP_AZURE_SPEECH_KEY: process.env.REACT_APP_AZURE_SPEECH_KEY,
    REACT_APP_DID_API_KEY: process.env.REACT_APP_DID_API_KEY,
  }

  // Check required variables
  const missingRequired = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingRequired.length > 0) {
    console.error('Missing required environment variables:', missingRequired)
    return {
      isValid: false,
      missingRequired,
      availableOptional: Object.entries(optionalEnvVars)
        .filter(([key, value]) => value)
        .map(([key]) => key)
    }
  }

  return {
    isValid: true,
    missingRequired: [],
    availableOptional: Object.entries(optionalEnvVars)
      .filter(([key, value]) => value)
      .map(([key]) => key)
  }
}

// Usage in your app
const envStatus = validateEnvironment()
if (!envStatus.isValid) {
  console.warn('Some API features may not work properly')
}
```

### API Configuration Object

```javascript
// src/config/apiConfig.js
export const API_CONFIG = {
  qwen: {
    apiKey: process.env.REACT_APP_QWEN_API_KEY,
    endpoint: process.env.REACT_APP_QWEN_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    models: {
      turbo: 'qwen-turbo',
      plus: 'qwen-plus', 
      max: 'qwen-max',
      mathPlus: 'qwen-math-plus'
    },
    defaultModel: 'qwen-plus',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES) || 3
  },
  
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  
  azure: {
    speechKey: process.env.REACT_APP_AZURE_SPEECH_KEY,
    region: process.env.REACT_APP_AZURE_REGION || 'eastasia',
    endpoint: `https://${process.env.REACT_APP_AZURE_REGION || 'eastasia'}.tts.speech.microsoft.com/cognitiveservices/v1`
  },
  
  did: {
    apiKey: process.env.REACT_APP_DID_API_KEY,
    endpoint: 'https://api.d-id.com'
  }
}

// Validate configuration
export const isConfigValid = () => {
  return !!(API_CONFIG.qwen.apiKey)
}

export const getAvailableServices = () => {
  return {
    qwen: !!API_CONFIG.qwen.apiKey,
    openai: !!API_CONFIG.openai.apiKey,
    azure: !!API_CONFIG.azure.speechKey,
    did: !!API_CONFIG.did.apiKey
  }
}
```

## 🚀 Ready-to-Use Implementation

### Updated Qwen Service with Your API Key

```javascript
// src/services/qwenService.js
import { API_CONFIG } from '../config/apiConfig.js'

class QwenService {
  constructor() {
    if (!API_CONFIG.qwen.apiKey) {
      throw new Error('Qwen API key not configured. Please check your .env file.')
    }
    
    this.apiKey = API_CONFIG.qwen.apiKey
    this.endpoint = API_CONFIG.qwen.endpoint
    this.timeout = API_CONFIG.qwen.timeout
    this.maxRetries = API_CONFIG.qwen.maxRetries
  }

  async callQwenAPI(prompt, model = 'qwen-plus') {
    const requestBody = {
      model,
      input: {
        messages: [
          {
            role: 'system',
            content: '你是专业的K12数学老师，请用清晰的中文解释数学概念。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 0.8
      }
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'disable'
    }

    try {
      console.log('Calling Qwen API with model:', model)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API Error ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      
      if (data.code && data.code !== '200') {
        throw new Error(`Qwen API Error: ${data.message}`)
      }

      return {
        success: true,
        content: data.output?.text || data.output?.choices?.[0]?.message?.content,
        usage: data.usage,
        model: model,
        requestId: data.request_id
      }

    } catch (error) {
      console.error('Qwen API call failed:', error)
      return {
        success: false,
        error: error.message,
        model: model
      }
    }
  }

  async solveMathProblem(question, options = {}) {
    const { model = 'qwen-plus', grade, language = 'zh' } = options
    
    const prompt = `请解答这个数学问题：

题目：${question}
年级：${grade || 'K12阶段'}
语言：${language}

请用JSON格式回答：
{
  "analysis": "问题分析",
  "steps": [
    {
      "stepNumber": 1,
      "description": "步骤描述",
      "calculation": "计算过程", 
      "result": "结果"
    }
  ],
  "finalAnswer": "最终答案",
  "verification": "验算",
  "concepts": ["数学概念"],
  "difficulty": "难度评估"
}`

    const result = await this.callQwenAPI(prompt, model)
    
    if (result.success) {
      try {
        const parsed = JSON.parse(result.content)
        return {
          ...result,
          parsed: true,
          solution: parsed
        }
      } catch (parseError) {
        return {
          ...result,
          parsed: false,
          rawContent: result.content
        }
      }
    }
    
    return result
  }
}

export default new QwenService()
```

## 🔧 Integration with Your App

### Update your main App component:

```javascript
// In your App.jsx or main component
import { useEffect, useState } from 'react'
import { validateEnvironment, getAvailableServices } from './config/envValidation.js'
import qwenService from './services/qwenService.js'

function App() {
  const [envStatus, setEnvStatus] = useState(null)
  const [availableServices, setAvailableServices] = useState({})

  useEffect(() => {
    // Check environment configuration
    const status = validateEnvironment()
    setEnvStatus(status)
    
    const services = getAvailableServices()
    setAvailableServices(services)
    
    console.log('Environment Status:', status)
    console.log('Available Services:', services)
  }, [])

  const testQwenConnection = async () => {
    try {
      const result = await qwenService.solveMathProblem('1 + 1 = ?', {
        model: 'qwen-plus',
        grade: '小学'
      })
      
      console.log('Qwen Test Result:', result)
      alert('API连接成功！检查控制台查看详细结果。')
    } catch (error) {
      console.error('API连接失败:', error)
      alert('API连接失败，请检查配置。')
    }
  }

  // Your existing App component content...
  
  return (
    <div className="App">
      {/* Add API status indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              availableServices.qwen ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>Qwen API: {availableServices.qwen ? '已连接' : '未配置'}</span>
          </div>
          {availableServices.qwen && (
            <button 
              onClick={testQwenConnection}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              测试连接
            </button>
          )}
        </div>
      </div>
      
      {/* Your existing app content */}
    </div>
  )
}
```

## ⚠️ Important Security Notes

1. **Never commit .env files to git:**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

2. **Use different keys for development and production**

3. **Monitor your API usage on Aliyun console**

## 🎯 Quick Start Checklist

- [ ] Create `.env` file with your Aliyun API key
- [ ] Add the file to `.gitignore` 
- [ ] Test the API connection
- [ ] Verify the math solving functionality
- [ ] Check the console for any errors
- [ ] Monitor API usage and costs

Your Aliyun API key is now fully configured and ready to use! 🚀