#!/usr/bin/env node

/**
 * Kimi API Proxy Server
 * Creates a backend proxy to bypass CORS issues with Kimi API
 */

import express from 'express';
import cors from 'cors';
import https from 'https';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join as pathJoin } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.KIMI_PROXY_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kimi-api-proxy',
    timestamp: new Date().toISOString(),
    apiKey: process.env.VITE_KIMI_API_KEY ? 'configured' : 'missing'
  });
});

// Kimi API proxy endpoint
app.post('/api/kimi/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { messages, model = 'moonshot-v1-8k', max_tokens = 2000, temperature = 0.3 } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.VITE_KIMI_API_KEY || process.env.KIMI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Kimi API key not configured' });
    }

    // Handle vision models differently
    const isVisionModel = model.includes('vision') || model.includes('v1-vision');
    
    const requestData = {
      model,
      messages,
      max_tokens,
      temperature,
      stream: false
    };

    const options = {
      hostname: 'api.moonshot.cn',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Kimi-Proxy/1.0'
      },
      timeout: 30000
    };

    const kimiReq = https.request(options, (kimiRes) => {
      let responseBody = '';

      kimiRes.on('data', (chunk) => {
        responseBody += chunk;
      });

      kimiRes.on('end', () => {
        try {
          const response = JSON.parse(responseBody);
          
          if (kimiRes.statusCode === 200) {
            const duration = Date.now() - startTime;
            console.log(`✅ Kimi API call successful (${duration}ms) - Model: ${model}`);
            res.json(response);
          } else {
            console.error(`❌ Kimi API error: ${kimiRes.statusCode}`, response);
            res.status(kimiRes.statusCode).json(response);
          }
        } catch (error) {
          console.error('❌ Response parsing error:', error);
          res.status(500).json({ error: 'Response parsing error' });
        }
      });
    });

    kimiReq.on('error', (error) => {
      console.error('❌ Kimi API request failed:', error);
      res.status(500).json({ error: 'Kimi API request failed', details: error.message });
    });

    kimiReq.on('timeout', () => {
      kimiReq.destroy();
      console.error('❌ Kimi API request timeout');
      res.status(504).json({ error: 'Kimi API request timeout' });
    });

    kimiReq.write(JSON.stringify(requestData));
    kimiReq.end();

  } catch (error) {
    console.error('❌ Proxy server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Models endpoint
app.get('/api/kimi/models', (req, res) => {
  res.json({
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Kimi 8K',
        description: '8K context window',
        max_tokens: 8000
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Kimi 32K',
        description: '32K context window',
        max_tokens: 32000
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Kimi 128K',
        description: '128K context window',
        max_tokens: 128000
      }
    ]
  });
});

// TTS endpoint - Minimax T2A V2 API integration
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'zh', method = 'auto' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`🎤 TTS request: ${text.substring(0, 50)}... (${language})`);
    
    // Get Minimax API key from environment
    const minimaxApiKey = process.env.MINIMAX_API_KEY;
    if (!minimaxApiKey) {
      return res.status(500).json({ error: 'Minimax API key not configured. Please set MINIMAX_API_KEY environment variable.' });
    }
    
    // Generate audio file path
    const timestamp = Date.now();
    const audioPath = `rendered_videos/tts_audio_${timestamp}.mp3`;
    const audioFilePath = pathJoin(process.cwd(), audioPath);
    
    // Ensure rendered_videos directory exists
    const fs = await import('fs');
    const https = await import('https');
    
    const renderedVideosDir = pathJoin(process.cwd(), 'rendered_videos');
    if (!fs.default.existsSync(renderedVideosDir)) {
      fs.default.mkdirSync(renderedVideosDir, { recursive: true });
    }
    
    // Prepare Minimax T2A V2 API request
    const requestData = {
      model: "speech-02-turbo",
      text: text,
      stream: false,
      voice_setting: {
        voice_id: language === 'zh' ? "male-qn-qingse" : "male-qn-qingse", // Chinese voice
        speed: 1,
        vol: 1,
        pitch: 0
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1
      }
    };
    
    // Get GroupId from environment or use default
    const groupId = process.env.MINIMAX_GROUP_ID || "1948670276900229716";
    
    // Call Minimax T2A V2 API
    const options = {
      hostname: 'api.minimax.io',
      port: 443,
      path: `/v1/t2a_v2?GroupId=${groupId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VideoTutor-TTS/1.0'
      },
      timeout: 30000
    };
    
    const minimaxReq = https.request(options, (minimaxRes) => {
      let responseBody = Buffer.alloc(0);
      
      minimaxRes.on('data', (chunk) => {
        responseBody = Buffer.concat([responseBody, chunk]);
      });
      
      minimaxRes.on('end', () => {
        try {
          if (minimaxRes.statusCode === 200) {
            // Check if response is actually audio data
            const contentType = minimaxRes.headers['content-type'];
            
            if (contentType && contentType.includes('audio')) {
              // Save the audio file
              fs.default.writeFileSync(audioFilePath, responseBody);
              console.log(`✅ Minimax TTS audio file created: ${audioPath}`);
              
              res.json({
                success: true,
                audio_path: audioPath,
                duration: Math.max(5, text.length / 10), // Estimate duration
                language: language,
                method: 'minimax_t2a_v2'
              });
            } else {
              // Response is not audio data, likely an error message
              const errorResponse = responseBody.toString();
              console.error(`❌ Minimax TTS API returned non-audio response:`, errorResponse);
              
              // Try to parse as JSON to get error details
              try {
                const errorJson = JSON.parse(errorResponse);
                res.status(400).json({ 
                  error: 'Minimax TTS API error', 
                  details: errorJson,
                  message: errorJson.base_resp?.status_msg || 'Unknown error'
                });
              } catch (parseError) {
                res.status(400).json({ 
                  error: 'Minimax TTS API error', 
                  details: errorResponse
                });
              }
            }
          } else {
            console.error(`❌ Minimax TTS API error: ${minimaxRes.statusCode}`, responseBody.toString());
            res.status(minimaxRes.statusCode).json({ 
              error: 'Minimax TTS API error', 
              details: responseBody.toString() 
            });
          }
        } catch (error) {
          console.error('❌ Response processing error:', error);
          res.status(500).json({ error: 'Response processing error' });
        }
      });
    });
    
    minimaxReq.on('error', (error) => {
      console.error('❌ Minimax TTS API request failed:', error);
      res.status(500).json({ error: 'Minimax TTS API request failed', details: error.message });
    });
    
    minimaxReq.on('timeout', () => {
      minimaxReq.destroy();
      console.error('❌ Minimax TTS API request timeout');
      res.status(504).json({ error: 'Minimax TTS API request timeout' });
    });
    
    minimaxReq.write(JSON.stringify(requestData));
    minimaxReq.end();
    
  } catch (error) {
    console.error('❌ TTS error:', error);
    res.status(500).json({ error: 'TTS service error', details: error.message });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kimi API Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key: ${process.env.VITE_KIMI_API_KEY ? 'Configured' : 'Missing'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

export default app;