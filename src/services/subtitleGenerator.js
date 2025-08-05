// Subtitle Generator Service
// Generates SRT/VTT subtitle files synchronized with video content

export class SubtitleGenerator {
  constructor() {
    this.defaultDuration = 3; // Default duration for each subtitle segment
  }

  /**
   * Generate SRT subtitle file from TTS content and timing info
   * @param {string} ttsText - The full TTS narration text
   * @param {Array} steps - Array of steps with timing info
   * @param {number} totalDuration - Total video duration
   * @returns {Object} - Contains srt and vtt format strings
   */
  generateSubtitles(ttsText, steps, totalDuration = 20) {
    console.log('🎬 Generating synchronized subtitles...');
    
    // Parse TTS text into segments
    const segments = this.parseTTSText(ttsText);
    
    // Calculate timing for each segment
    const timedSegments = this.calculateTiming(segments, steps, totalDuration);
    
    // Generate SRT format
    const srtContent = this.generateSRT(timedSegments);
    
    // Generate WebVTT format
    const vttContent = this.generateVTT(timedSegments);
    
    return {
      srt: srtContent,
      vtt: vttContent,
      segments: timedSegments
    };
  }

  /**
   * Parse TTS text into subtitle segments
   */
  parseTTSText(ttsText) {
    if (!ttsText) return [];
    
    const segments = [];
    
    // Split by step markers
    const stepPattern = /第\d+步[，,、.\s]*/g;
    const parts = ttsText.split(stepPattern);
    const stepMatches = ttsText.match(stepPattern) || [];
    
    // Add question as first segment
    if (parts[0] && parts[0].trim()) {
      segments.push({
        type: 'question',
        text: parts[0].trim()
      });
    }
    
    // Add each step
    parts.slice(1).forEach((part, index) => {
      if (part.trim() && stepMatches[index]) {
        // Split long steps into smaller segments for better readability
        const stepText = stepMatches[index] + part.trim();
        const subSegments = this.splitLongText(stepText, 50);
        
        subSegments.forEach((subSegment, subIndex) => {
          segments.push({
            type: 'step',
            stepNumber: index + 1,
            text: subSegment,
            isFirstPart: subIndex === 0
          });
        });
      }
    });
    
    // Add final answer segment if present
    const finalAnswerMatch = ttsText.match(/最终答案[：:].*/);
    if (finalAnswerMatch) {
      segments.push({
        type: 'answer',
        text: finalAnswerMatch[0]
      });
    }
    
    return segments;
  }

  /**
   * Split long text into smaller segments
   */
  splitLongText(text, maxLength) {
    if (text.length <= maxLength) return [text];
    
    const segments = [];
    const sentences = text.split(/[。！？，,]/);
    let current = '';
    
    sentences.forEach(sentence => {
      if (!sentence.trim()) return;
      
      if ((current + sentence).length > maxLength && current) {
        segments.push(current.trim());
        current = sentence;
      } else {
        current += (current ? '，' : '') + sentence;
      }
    });
    
    if (current) {
      segments.push(current.trim());
    }
    
    return segments.length > 0 ? segments : [text];
  }

  /**
   * Calculate timing for each segment based on video animation timing
   */
  calculateTiming(segments, steps, totalDuration) {
    const timedSegments = [];
    let currentTime = 0;
    
    // Estimate duration for each segment type
    const questionDuration = 3;
    const stepDuration = Math.max(2, (totalDuration - questionDuration - 2) / Math.max(steps.length, 1));
    
    segments.forEach((segment, index) => {
      let duration;
      
      if (segment.type === 'question') {
        duration = questionDuration;
      } else if (segment.type === 'answer') {
        duration = 2;
      } else {
        // For steps, calculate based on text length and complexity
        const charCount = segment.text.length;
        const baseTime = charCount / 10; // ~10 chars per second reading speed
        duration = Math.max(1.5, Math.min(baseTime, stepDuration));
      }
      
      timedSegments.push({
        ...segment,
        startTime: currentTime,
        endTime: currentTime + duration,
        duration: duration,
        index: index + 1
      });
      
      currentTime += duration;
      
      // Add small gap between segments
      if (index < segments.length - 1) {
        currentTime += 0.2;
      }
    });
    
    // Adjust last segment to not exceed total duration
    if (timedSegments.length > 0) {
      const lastSegment = timedSegments[timedSegments.length - 1];
      if (lastSegment.endTime > totalDuration) {
        lastSegment.endTime = totalDuration;
        lastSegment.duration = lastSegment.endTime - lastSegment.startTime;
      }
    }
    
    return timedSegments;
  }

  /**
   * Generate SRT format subtitles
   */
  generateSRT(timedSegments) {
    let srt = '';
    
    timedSegments.forEach((segment, index) => {
      srt += `${segment.index}\n`;
      srt += `${this.formatSRTTime(segment.startTime)} --> ${this.formatSRTTime(segment.endTime)}\n`;
      srt += `${segment.text}\n\n`;
    });
    
    return srt.trim();
  }

  /**
   * Generate WebVTT format subtitles
   */
  generateVTT(timedSegments) {
    let vtt = 'WEBVTT\n\n';
    
    timedSegments.forEach((segment) => {
      vtt += `${this.formatVTTTime(segment.startTime)} --> ${this.formatVTTTime(segment.endTime)}\n`;
      vtt += `${segment.text}\n\n`;
    });
    
    return vtt.trim();
  }

  /**
   * Format time for SRT (00:00:00,000)
   */
  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)},${this.pad(ms, 3)}`;
  }

  /**
   * Format time for VTT (00:00:00.000)
   */
  formatVTTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}.${this.pad(ms, 3)}`;
  }

  /**
   * Pad number with zeros
   */
  pad(num, size = 2) {
    return num.toString().padStart(size, '0');
  }

  /**
   * Generate subtitle timing data for video player
   */
  generateSubtitleData(ttsText, steps, totalDuration = 20) {
    const result = this.generateSubtitles(ttsText, steps, totalDuration);
    
    return {
      srt: result.srt,
      vtt: result.vtt,
      segments: result.segments.map(seg => ({
        text: seg.text,
        start: seg.startTime,
        end: seg.endTime,
        type: seg.type
      }))
    };
  }
}

// Export singleton instance
export const subtitleGenerator = new SubtitleGenerator();