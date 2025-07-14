#!/bin/bash

# GitHub Pages 部署脚本
echo "🚀 开始部署到 GitHub Pages..."

# 安装依赖
npm install

# 构建项目
echo "📦 构建项目..."
npm run build

# 安装 gh-pages
npm install --save-dev gh-pages

# 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
npm run deploy:gh

echo "✅ 部署完成！"
echo "📱 访问地址: https://jeffli2002.github.io/videotutor/" 