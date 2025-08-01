# Azure Cognitive Services Speech Setup Guide

This guide will help you set up Azure Cognitive Services Speech for free TTS in your VideoTutor application.

## Step 1: Create Azure Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign up for a free account (includes $200 credit for 30 days)
3. After the trial, you still get **5 million characters free per month** for Speech Services

## Step 2: Create Speech Service Resource

1. In Azure Portal, click "Create a resource"
2. Search for "Speech" and select "Speech" by Microsoft
3. Click "Create"
4. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: Create new or select existing
   - **Region**: Choose `East Asia` or your nearest region
   - **Name**: Give it a unique name (e.g., `videotutor-speech`)
   - **Pricing tier**: Select `F0 (Free)` for 5M characters/month free

5. Click "Review + Create" then "Create"

## Step 3: Get Your API Keys

1. After deployment, go to your Speech resource
2. Click on "Keys and Endpoint" in the left menu
3. You'll see:
   - **KEY 1** and **KEY 2** (you can use either)
   - **Location/Region** (e.g., `eastasia`)

## Step 4: Configure VideoTutor

1. Open your `.env` file in the VideoTutor project
2. Update these values:

```env
REACT_APP_AZURE_SPEECH_KEY=paste_your_key_1_here
REACT_APP_AZURE_REGION=eastasia
```

Replace `paste_your_key_1_here` with your actual KEY 1 from Azure.

## Step 5: Restart TTS Server

```bash
# Stop the current TTS server
pkill -f "tts_api_server"

# Start it again
node tts_api_server.js
```

## Available Voices

The system supports these Azure Neural voices:

### Chinese (zh)
- **female**: XiaoxiaoNeural (Young female)
- **male**: YunxiNeural (Male)
- **child**: XiaomoNeural (Child)
- **news**: XiaoyouNeural (News anchor)

### English (en)
- **female**: JennyNeural (Female)
- **male**: GuyNeural (Male)
- **child**: AnaNeural (Child)
- **news**: AriaNeural (News anchor)

## Testing Your Setup

Once configured, test the TTS:

```bash
curl -X POST http://localhost:3002/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这是Azure语音合成测试",
    "language": "zh",
    "voice": "female"
  }'
```

## Free Tier Limits

- **5 million characters per month** (renewed monthly)
- **Neural voices** included
- **Real-time synthesis**
- No credit card required after trial ends

## Troubleshooting

1. **"Valid Azure Speech subscription key is required"**
   - Make sure you've added your key to `.env`
   - Ensure the key is not the placeholder value

2. **"Failed to get token: 401"**
   - Your API key might be incorrect
   - Check if the region matches your resource's region

3. **"Failed to get token: 403"**
   - Your free quota might be exhausted (5M chars/month)
   - Check usage in Azure Portal

## Cost Calculator

- Free tier: 5,000,000 characters/month
- Average math problem: ~100 characters
- Free tier supports: ~50,000 problems/month
- That's about 1,666 problems per day!

## Next Steps

After setting up Azure TTS, your VideoTutor will generate real voice narration for math problems. The system will automatically fall back to silent audio if Azure is not configured or quota is exceeded.