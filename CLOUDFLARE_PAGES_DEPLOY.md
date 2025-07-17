# Cloudflare Pages 部署指南

## 问题解决

如果您遇到 "Could not read package.json" 错误，请按照以下步骤配置：

### 1. Cloudflare Pages 项目设置

在 Cloudflare Pages 控制台中：

1. **项目根目录**: 设置为 `/` (根目录)
2. **构建命令**: `npm run build:cf`
3. **构建输出目录**: `dist`
4. **Node.js 版本**: 18.x

### 2. 环境变量配置

在 Cloudflare Pages 的环境变量设置中添加：

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_QWEN_API_URL=https://your-cloudflare-worker-url.workers.dev/api/qwen
VITE_MANIM_API_URL=https://your-cloudflare-worker-url.workers.dev/api/manim_render
```

### 3. 构建配置

项目已包含以下配置文件：

- `wrangler.toml` - Cloudflare Pages 配置
- `vite.config.cloudflare.js` - 专用 Vite 配置
- `build-cloudflare.sh` - 构建脚本

### 4. 部署步骤

1. 确保代码已推送到 GitHub
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 配置构建设置：
   - 框架预设: None
   - 构建命令: `npm run build:cf`
   - 构建输出目录: `dist`
4. 添加环境变量
5. 点击部署

### 5. 故障排除

如果仍然遇到问题：

1. **检查项目根目录**: 确保设置为 `/`
2. **检查 package.json**: 确保在根目录存在
3. **检查 Node.js 版本**: 使用 18.x
4. **检查构建命令**: 使用 `npm run build:cf`

### 6. 本地测试

在部署前，可以在本地测试构建：

```bash
npm run build:cf
```

这应该会创建 `dist` 目录并生成构建文件。

## 注意事项

- Cloudflare Pages 不需要子路径配置，所以 `vite.config.cloudflare.js` 中设置了 `base: '/'`
- 确保所有环境变量都正确配置
- 如果使用 Cloudflare Workers 作为 API 代理，确保 Workers 已正确部署 