# 智能数学视频生成系统 - 模块化架构指南

## 📋 系统概述

本系统采用模块化架构，能够智能分析数学问题类型，并根据不同类型生成相应的视频内容：

- **具体求解问题**：生成严格的解题步骤脚本和动画
- **理论解释问题**：生成概念解释和演示脚本和动画
- **混合类型问题**：根据内容动态选择处理方式

## 🏗️ 模块架构

### 1. 问题分析模块 (`questionAnalyzer.js`)
**功能**：智能分析输入问题的类型
- 检测具体数值和计算要求
- 识别理论概念和解释需求
- 提供置信度和推理过程

**核心方法**：
```javascript
analyzeQuestionType(question) // 返回问题类型分析结果
```

### 2. 脚本生成模块 (`scriptGenerator.js`)
**功能**：根据问题类型生成相应的视频脚本
- 具体问题：生成步骤化的解题脚本
- 理论问题：生成概念解释脚本
- 支持中英文双语

**核心方法**：
```javascript
generateScript(question, solution, language) // 生成视频脚本
```

### 3. 动画生成模块 (`animationGenerator.js`)
**功能**：生成相应的数学动画
- 具体问题：生成解题步骤动画
- 理论问题：生成概念演示动画
- 集成Manim动画库

**核心方法**：
```javascript
generateAnimation(question, solution, script, language) // 生成动画
```

### 4. TTS服务模块 (`ttsService.js`)
**功能**：生成语音解说
- 根据脚本内容生成语音
- 支持数学术语处理
- 提供备用方案

**核心方法**：
```javascript
generateVoiceover(question, solution, script, language) // 生成语音
```

### 5. 主控制器 (`mathVideoController.js`)
**功能**：整合所有模块，提供统一接口
- 协调各模块工作流程
- 验证内容一致性
- 提供错误处理和备用方案

**核心方法**：
```javascript
generateMathVideo(question, solution, language) // 主入口方法
```

### 6. 测试模块 (`testModule.js`)
**功能**：提供完整的测试套件
- 问题类型分析测试
- 脚本生成测试
- 性能测试

## 🚀 使用方法

### 1. 启动服务
```powershell
# 使用PowerShell脚本启动所有服务
.\start_services.ps1
```

### 2. 运行测试
```javascript
// 运行简化测试（不依赖外部服务）
node test_modular_system_simple.js

// 运行完整测试（需要外部服务）
node test_modular_system.js
```

### 3. 在代码中使用
```javascript
import { MathVideoAIService } from './src/services/mathVideoAI.js'

const service = new MathVideoAIService()

// 生成数学视频
const result = await service.generateMathVideo(
  '解方程：2x + 3 = 7',
  '具体解题步骤...',
  'zh'
)
```

## 📊 问题类型识别

### 具体求解问题 (concrete_problem)
**特征**：
- 包含具体数值（如：6cm, 2x+3=7）
- 要求计算或求解
- 需要逐步解答

**示例**：
- "解方程：2x + 3 = 7"
- "已知三角形ABC，底边长为6cm，高为4cm，求三角形面积"
- "计算函数f(x)=x²的导数"

### 理论解释问题 (theoretical_question)
**特征**：
- 包含概念、原理、定义
- 要求解释或演示
- 需要概念阐述

**示例**：
- "什么是拉窗帘原理？请用动画演示"
- "如何理解微积分的基本概念？"
- "解释什么是勾股定理"

### 混合类型问题 (mixed)
**特征**：
- 既有具体计算又有概念解释
- 需要根据内容动态判断

**示例**：
- "拉窗帘原理的具体应用"
- "微积分在实际问题中的应用"

## 🔧 配置说明

### 服务端点配置
```javascript
// 在相应模块中配置服务端点
config: {
  qwen: {
    endpoint: 'http://localhost:8002/api/qwen'
  },
  manim: {
    endpoint: 'http://localhost:8002/generate-video'
  },
  tts: {
    endpoint: 'http://localhost:8003/tts'
  }
}
```

### 环境变量
```bash
VITE_QWEN_API_KEY=your-qwen-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

## 🧪 测试指南

### 1. 单元测试
```javascript
// 测试问题分析器
const analyzer = new QuestionAnalyzer()
const result = analyzer.analyzeQuestionType('解方程：2x + 3 = 7')
console.log(result)
```

### 2. 集成测试
```javascript
// 测试完整流程
const controller = new MathVideoController()
const result = await controller.generateMathVideo(question, solution, 'zh')
```

### 3. 性能测试
```javascript
// 测试生成速度
const startTime = Date.now()
const result = await service.generateMathVideo(question, solution, 'zh')
const endTime = Date.now()
console.log(`生成耗时: ${endTime - startTime}ms`)
```

## 🐛 故障排除

### 常见问题

1. **端口占用**
   ```powershell
   # 检查端口占用
   netstat -ano | findstr :5173
   # 使用其他端口
   npm run dev -- --port 5174
   ```

2. **服务启动失败**
   ```powershell
   # 检查Python环境
   python --version
   # 检查依赖
   pip list
   ```

3. **模块导入错误**
   ```javascript
   // 确保使用ES6模块语法
   import { MathVideoAIService } from './src/services/mathVideoAI.js'
   ```

### 错误处理
系统提供多层错误处理：
- 模块级错误处理
- 服务级备用方案
- 全局异常捕获

## 📈 性能优化

### 1. 模块化优势
- 代码复用性高
- 维护成本低
- 测试覆盖全面

### 2. 缓存策略
- 问题分析结果缓存
- 脚本模板缓存
- 动画资源缓存

### 3. 并发处理
- 异步脚本生成
- 并行服务调用
- 批量处理支持

## 🔮 未来扩展

### 1. 新问题类型
- 统计问题
- 概率问题
- 几何证明

### 2. 新动画类型
- 3D动画
- 交互式动画
- VR/AR支持

### 3. 新语音功能
- 多语言支持
- 情感语音
- 实时语音合成

## 📞 技术支持

如有问题，请检查：
1. 服务是否正常启动
2. 网络连接是否正常
3. 配置文件是否正确
4. 依赖包是否完整

---

**版本**：1.0.0  
**更新时间**：2024年12月  
**维护者**：AI助手 