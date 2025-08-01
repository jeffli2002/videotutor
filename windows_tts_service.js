#!/usr/bin/env node

/**
 * Windows TTS Service - Uses Windows SAPI for free TTS
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

export async function generateWindowsTTS(text, outputPath) {
  return new Promise((resolve, reject) => {
    // Create a PowerShell script to generate TTS
    const psScript = `
      Add-Type -AssemblyName System.Speech
      $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
      
      # Try to select a Chinese voice if available
      $voices = $synth.GetInstalledVoices()
      $chineseVoice = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like "zh-*" } | Select-Object -First 1
      if ($chineseVoice) {
        $synth.SelectVoice($chineseVoice.VoiceInfo.Name)
      }
      
      # Set output to WAV file
      $synth.SetOutputToWaveFile('${outputPath.replace(/\//g, '\\\\')}')
      
      # Speak the text
      $synth.Speak('${text.replace(/'/g, "''")}')
      
      # Clean up
      $synth.Dispose()
      
      Write-Output "TTS completed"
    `.trim();

    console.log('🔊 Generating Windows TTS...');
    
    // Run PowerShell command
    const ps = spawn('powershell.exe', ['-NoProfile', '-Command', psScript], {
      shell: false,
      windowsHide: true
    });
    
    let output = '';
    let error = '';
    
    ps.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ps.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    ps.on('close', (code) => {
      if (code === 0 && existsSync(outputPath)) {
        console.log('✅ Windows TTS generated successfully');
        resolve({ success: true, path: outputPath });
      } else {
        console.error('❌ Windows TTS failed:', error || output);
        reject(new Error(`Windows TTS failed: ${error || output}`));
      }
    });
    
    ps.on('error', (err) => {
      console.error('❌ PowerShell error:', err.message);
      reject(err);
    });
  });
}