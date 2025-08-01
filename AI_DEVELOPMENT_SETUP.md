# AI Assistant Development Setup for VideoTutor

## How Claude (and other AI assistants) Should Work with This Project

### 1. Automatic Recognition

When Claude opens this project, it will automatically recognize and read:
- **CLAUDE.md** - Primary development rules
- **.clauderc** - Project configuration file
- **PRODUCT_TECHNICAL_FLOW_ASCII.md** - Technical architecture

### 2. Project Context

The following files provide Claude with complete project context:

```
VideoTutor/
├── CLAUDE.md                          # Development rules for AI assistants
├── .clauderc                          # Auto-loaded project config
├── PRODUCT_TECHNICAL_FLOW_ASCII.md    # Complete technical flow (authoritative)
├── DEPLOYMENT_READY_PATHS.md          # Path configuration rules
├── VIDEO_PATH_FIX_SUMMARY.md          # Video path specifics
└── README.md                          # Updated with AI documentation links
```

### 3. How It Works

1. **CLAUDE.md** acts as the primary instruction set that Claude will read first
2. **.clauderc** provides machine-readable configuration that Claude can parse
3. **PRODUCT_TECHNICAL_FLOW_ASCII.md** serves as the single source of truth
4. These documents together ensure consistent implementation

### 4. Key Rules Enforced

- ✅ All paths must be relative (no absolute paths)
- ✅ Use KIMI API (port 3001), not QWEN or other APIs
- ✅ Follow exact service port assignments
- ✅ Video duration must match audio duration
- ✅ All output goes to public/rendered_videos/
- ✅ URLs use /rendered_videos/ (without 'public')

### 5. Benefits

- **Consistency**: Every AI assistant follows the same rules
- **Accuracy**: Technical flow is always up-to-date
- **Efficiency**: No need to explain project structure repeatedly
- **Quality**: Enforces best practices automatically

### 6. For Human Developers

These documents also serve as excellent onboarding material:
1. Start with README.md
2. Read CLAUDE.md for development rules
3. Study PRODUCT_TECHNICAL_FLOW_ASCII.md for architecture
4. Check DEPLOYMENT_READY_PATHS.md before deployment

### 7. Updating the Rules

When project requirements change:
1. Update PRODUCT_TECHNICAL_FLOW_ASCII.md first
2. Update CLAUDE.md with new rules
3. Update .clauderc if ports/services change
4. Claude will automatically use the updated rules

This setup ensures that AI assistants like Claude will always have the correct context and follow the right implementation patterns for the VideoTutor project.