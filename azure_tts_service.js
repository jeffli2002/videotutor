#!/usr/bin/env node

/**
 * Azure Cognitive Services Speech TTS Service
 * Uses Azure's REST API for text-to-speech conversion
 */

import https from 'https';
import { writeFileSync } from 'fs';

// Azure Speech Service voices for different languages
const AZURE_VOICES = {
  'zh': {
    'female': 'zh-CN-XiaoxiaoNeural',  // Young female voice
    'male': 'zh-CN-YunxiNeural',        // Male voice
    'child': 'zh-CN-XiaomoNeural',      // Child voice
    'news': 'zh-CN-XiaoyouNeural'       // News anchor voice
  },
  'en': {
    'female': 'en-US-JennyNeural',      // Female voice
    'male': 'en-US-GuyNeural',          // Male voice
    'child': 'en-US-AnaNeural',         // Child voice
    'news': 'en-US-AriaNeural'          // News anchor voice
  }
};

/**
 * Get Azure Speech token
 */
async function getAzureToken(subscriptionKey, region) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${region}.api.cognitive.microsoft.com`,
      path: '/sts/v1.0/issuetoken',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 0
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to get token: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * Generate speech using Azure TTS
 */
export async function generateAzureTTS(text, outputPath, options = {}) {
  const {
    subscriptionKey,
    region = 'eastasia',
    language = 'zh',
    voice = 'female',
    rate = '0%',      // -50% to +50%
    pitch = '0%',     // -50% to +50%
    volume = '0%'     // -50% to +50%
  } = options;

  if (!subscriptionKey || subscriptionKey === 'your_azure_speech_key_here') {
    throw new Error('Valid Azure Speech subscription key is required');
  }

  try {
    // Truncate very long text to avoid timeout
    const MAX_CHARS = 3000; // Azure has a limit
    let processedText = text;
    if (text.length > MAX_CHARS) {
      console.log(`⚠️ Text too long (${text.length} chars), truncating to ${MAX_CHARS} chars`);
      processedText = text.substring(0, MAX_CHARS) + '...';
    }
    
    // Get authentication token
    console.log('🔑 Getting Azure Speech token...');
    const token = await getAzureToken(subscriptionKey, region);
    
    // Select voice
    const voiceName = AZURE_VOICES[language]?.[voice] || AZURE_VOICES['zh']['female'];
    console.log(`🎤 Using Azure voice: ${voiceName}`);
    
    // Create SSML (Speech Synthesis Markup Language)
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language === 'zh' ? 'zh-CN' : 'en-US'}">
        <voice name="${voiceName}">
          <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
            ${escapeXml(processedText)}
          </prosody>
        </voice>
      </speak>
    `.trim();

    // Generate speech
    return await new Promise((resolve, reject) => {
      const options = {
        hostname: `${region}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'VideoTutor-TTS'
        }
      };

      const req = https.request(options, (res) => {
        const chunks = [];
        
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            const audioBuffer = Buffer.concat(chunks);
            writeFileSync(outputPath, audioBuffer);
            console.log('✅ Azure TTS generated successfully');
            resolve({ 
              success: true, 
              path: outputPath,
              size: audioBuffer.length,
              format: 'mp3'
            });
          } else {
            const errorData = Buffer.concat(chunks).toString();
            reject(new Error(`Azure TTS failed: ${res.statusCode} - ${errorData}`));
          }
        });
      });
      
      // Set a timeout for the request
      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error('Azure TTS request timeout after 60 seconds'));
      });
      
      req.on('error', reject);
      req.write(ssml);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Azure TTS error:', error.message);
    throw error;
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get available voices for a language
 */
export function getAvailableVoices(language = 'zh') {
  return Object.keys(AZURE_VOICES[language] || AZURE_VOICES['zh']);
}

/**
 * Test Azure TTS connection
 */
export async function testAzureConnection(subscriptionKey, region) {
  try {
    const token = await getAzureToken(subscriptionKey, region);
    return { success: true, message: 'Azure Speech Service is accessible' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}