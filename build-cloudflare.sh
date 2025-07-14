#!/bin/bash

# Cloudflare Pages 构建脚本
echo "🚀 开始 Cloudflare Pages 构建..."

# 检查 Node.js 版本
echo "📋 Node.js 版本: $(node --version)"
echo "📋 npm 版本: $(npm --version)"

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build:cloudflare

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！dist 目录已创建"
    ls -la dist/
else
    echo "❌ 构建失败！dist 目录不存在"
    exit 1
fi

echo "🎉 Cloudflare Pages 构建完成！" 