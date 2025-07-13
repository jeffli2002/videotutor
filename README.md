# VideoTutor - AI数学视频生成平台

一个基于AI的数学教学视频自动生成平台，使用QWEN大模型和Manim动画引擎，将数学题目转换为生动的教学视频。

## 🚀 功能特性

- **AI智能解题**：使用QWEN大模型自动分析数学题目并生成详细解题步骤
- **自动视频生成**：基于Manim引擎将解题过程转换为高质量教学视频
- **多格式支持**：支持方程、不等式、几何等多种数学题型
- **实时预览**：生成过程中可实时查看视频进度
- **用户管理**：支持用户注册、登录、视频历史管理
- **响应式设计**：支持桌面和移动端访问

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Supabase** - 用户认证和数据库

### 后端
- **Python** - 主要后端语言
- **Flask** - Web框架
- **Manim** - 数学动画引擎
- **QWEN API** - AI大模型接口
- **FFmpeg** - 视频处理

## 📦 安装部署

### 环境要求
- Node.js 16+
- Python 3.8+
- FFmpeg

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/jeffli2002/videotutor.git
cd videotutor
```

2. **安装前端依赖**
```bash
npm install
```

3. **安装Python依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
# 创建.env文件
cp .env.example .env
# 编辑.env文件，填入必要的API密钥
```

5. **启动服务**
```bash
# 启动前端服务
npm run dev

# 启动QWEN API服务器
python qwen_sdk_server.py

# 启动Manim渲染服务器
python manim_api_server.py
```

### 生产部署

#### 方案1：Vercel部署（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### 方案2：GitHub Pages
```bash
# 构建生产版本
npm run build

# 推送到GitHub Pages分支
git subtree push --prefix dist origin gh-pages
```

## 🔧 配置说明

### 环境变量
```bash
# QWEN API配置
QWEN_API_KEY=your_qwen_api_key

# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 服务器配置
VITE_QWEN_API_URL=http://localhost:8002/api/qwen
VITE_MANIM_API_URL=http://localhost:5001/api/manim_render
```

### API端点
- `POST /api/qwen` - QWEN AI接口
- `POST /api/manim_render` - Manim视频渲染接口

## 📖 使用指南

1. **注册/登录**：使用邮箱注册账号或直接登录
2. **输入题目**：在输入框中输入数学题目
3. **选择类型**：选择题目类型（方程、不等式、几何等）
4. **生成视频**：点击"生成视频"按钮
5. **查看结果**：等待AI分析和视频生成完成
6. **下载分享**：下载生成的视频或分享链接

## 🎯 支持的题型

- **代数方程**：一元一次方程、一元二次方程
- **不等式**：一元一次不等式、一元二次不等式
- **几何**：三角形面积、周长计算
- **函数**：函数图像、函数性质
- **统计**：概率计算、数据分析

## 🔍 项目结构

```
VideoTutor/
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── services/          # API服务
│   ├── config/            # 配置文件
│   └── lib/               # 工具函数
├── public/                # 静态资源
├── rendered_videos/       # 生成的视频
├── media/                 # Manim媒体文件
├── qwen_sdk_server.py     # QWEN API服务器
├── manim_api_server.py    # Manim渲染服务器
└── requirements.txt       # Python依赖
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [QWEN](https://github.com/QwenLM/Qwen) - 大语言模型
- [Manim](https://github.com/ManimCommunity/manim) - 数学动画引擎
- [Supabase](https://supabase.com/) - 后端服务
- [React](https://reactjs.org/) - 前端框架

## 📞 联系方式

- 项目主页：https://github.com/jeffli2002/videotutor
- 问题反馈：https://github.com/jeffli2002/videotutor/issues

---

⭐ 如果这个项目对你有帮助，请给它一个星标！