# Minimax T2A V2 TTS 设置指南

## 1. 获取Minimax API密钥
1. 访问 [Minimax平台](https://www.minimax.io/)
2. 注册并登录您的账户
3. 在控制台中获取API密钥

## 2. 环境变量配置
在项目根目录的`.env`文件中添加以下配置：

```env
# Minimax T2A V2 API配置
MINIMAX_API_KEY=your-minimax-api-key-here
MINIMAX_GROUP_ID=your-group-id-here

# 其他现有配置
VITE_KIMI_API_KEY=your-kimi-api-key-here
KIMI_API_KEY=your-kimi-api-key-here
KIMI_PROXY_PORT=3001
```

## 3. API配置说明

### 支持的语音模型
- **speech-02-turbo**: 快速语音模型（推荐）
- **speech-01**: 标准语音模型

### 支持的语音ID
- **male-qn-qingse**: 中文男声（清色）
- **female-qn-qingse**: 中文女声（清色）
- **male-qn-qingse-en**: 英文男声
- **female-qn-qingse-en**: 英文女声
- **Grinch**: 英文男声（示例）

### 音频配置参数
- **format**: "mp3" (推荐) 或 "wav"
- **sample_rate**: 32000 (推荐) 或 16000
- **bitrate**: 128000 (推荐) 或 64000
- **channel**: 1 (单声道) 或 2 (立体声)
- **speed**: 0.5-2.0 (语速调节)
- **vol**: 0.1-2.0 (音量调节)
- **pitch**: -12 到 12 (音调调节)

## 4. 重启服务
配置完成后，需要重启KIMI代理服务器：

```bash
# 停止当前服务
taskkill /F /PID <当前PID>

# 重新启动
node kimi_api_server.js
```

## 5. 测试TTS功能
使用以下命令测试TTS功能：

```bash
node test_tts_fix.js
```

## 6. 故障排除

### 常见问题
1. **API密钥未配置**
   - 错误: `Minimax API key not configured`
   - 解决: 检查`.env`文件中的`MINIMAX_API_KEY`配置

2. **API调用失败**
   - 错误: `Minimax TTS API request failed`
   - 解决: 检查网络连接和API密钥有效性

3. **音频文件格式错误**
   - 错误: `Invalid data found when processing input`
   - 解决: 确保使用正确的音频格式配置

### 调试步骤
1. 检查环境变量是否正确加载
2. 验证API密钥是否有效
3. 测试网络连接到`api.minimax.chat`
4. 查看服务器日志获取详细错误信息

## 7. 性能优化建议
1. **缓存机制**: 对相同文本的TTS请求进行缓存
2. **并发控制**: 限制同时进行的TTS请求数量
3. **错误重试**: 实现API调用失败时的重试机制
4. **音频压缩**: 根据需要调整音频质量和文件大小

## 8. 成本控制
- 监控API调用次数和费用
- 实现TTS请求的限流机制
- 考虑使用本地TTS引擎作为备用方案

## 9. 安全注意事项
- 不要在代码中硬编码API密钥
- 定期轮换API密钥
- 监控API使用情况，防止滥用
- 在生产环境中使用环境变量管理敏感信息 