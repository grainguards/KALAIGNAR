import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

class TTSService {
  private activeSpeakingId: string | null = null;
  private onStopCallbacks: Map<string, () => void> = new Map();
  private activeAudioElements: HTMLAudioElement[] = [];
  private activeUtterance: any = null;
  private keepAliveInterval: any = null;

  /**
   * Split long text into natural sentence or punctuation chunks (max ~160 chars)
   * so audio streams without interruption.
   */
  private splitTextIntoChunks(text: string, maxLen = 160): string[] {
    const clean = text.trim();
    if (!clean) return [];
    if (clean.length <= maxLen) return [clean];

    // Split on full stops, question marks, exclamation marks, semicolons, or commas
    const sentenceRegex = /[^.!?,\n]+[.!?,\n]+|[^.!?,\n]+$/g;
    const matches = clean.match(sentenceRegex) || [clean];

    const chunks: string[] = [];
    let currentChunk = '';

    for (const match of matches) {
      const part = match.trim();
      if (!part) continue;

      if ((currentChunk + ' ' + part).trim().length <= maxLen) {
        currentChunk = (currentChunk ? currentChunk + ' ' : '') + part;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (part.length <= maxLen) {
          currentChunk = part;
        } else {
          // Break very long phrases by words
          const words = part.split(/\s+/);
          let subChunk = '';
          for (const w of words) {
            if ((subChunk + ' ' + w).trim().length <= maxLen) {
              subChunk = (subChunk ? subChunk + ' ' : '') + w;
            } else {
              if (subChunk) chunks.push(subChunk);
              subChunk = w;
            }
          }
          currentChunk = subChunk;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [clean];
  }

  /**
   * Speak a text string in the specified locale (e.g. 'ta-IN', 'hi-IN', 'en-IN')
   * Uses Google Neural Audio on Web for 100% complete, un-truncated, natural Indian language audio,
   * with robust SpeechSynthesis and expo-speech fallback.
   */
  async speak(
    id: string,
    text: string,
    locale: string,
    onStart?: () => void,
    onDone?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    try {
      // If already speaking this message, toggle stop
      if (this.activeSpeakingId === id) {
        this.stop();
        return;
      }

      // Stop any ongoing speech
      this.stop();

      this.activeSpeakingId = id;
      if (onDone) {
        this.onStopCallbacks.set(id, onDone);
      }

      const langCode = (locale || 'en-IN').split('-')[0].toLowerCase();
      const chunks = this.splitTextIntoChunks(text);

      // Web platform: Use Google High-Fidelity Neural Audio stream with sequence player
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        let hasStarted = false;

        const playAudioSequence = (chunkIndex: number) => {
          if (this.activeSpeakingId !== id) return;

          if (chunkIndex >= chunks.length) {
            // Finished playing entire message
            this.activeSpeakingId = null;
            this.onStopCallbacks.delete(id);
            if (onDone) onDone();
            return;
          }

          const chunkText = chunks[chunkIndex];
          const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(chunkText)}`;

          try {
            const audio = new Audio(audioUrl);
            this.activeAudioElements.push(audio);

            audio.onplay = () => {
              if (!hasStarted) {
                hasStarted = true;
                if (onStart) onStart();
              }
            };

            audio.onended = () => {
              const idx = this.activeAudioElements.indexOf(audio);
              if (idx !== -1) this.activeAudioElements.splice(idx, 1);
              playAudioSequence(chunkIndex + 1);
            };

            audio.onerror = (e) => {
              console.warn('Audio TTS stream error, falling back to Web SpeechSynthesis:', e);
              const idx = this.activeAudioElements.indexOf(audio);
              if (idx !== -1) this.activeAudioElements.splice(idx, 1);
              // Fallback to SpeechSynthesis
              this.speakWithSpeechSynthesis(id, text, locale, onStart, onDone, onError);
            };

            audio.play().catch((playErr) => {
              console.warn('Audio play was prevented or failed:', playErr);
              this.speakWithSpeechSynthesis(id, text, locale, onStart, onDone, onError);
            });
          } catch (e) {
            this.speakWithSpeechSynthesis(id, text, locale, onStart, onDone, onError);
          }
        };

        playAudioSequence(0);
        return;
      }

      // Native Expo-Speech playback
      if (onStart) onStart();
      await Speech.speak(text, {
        language: locale || 'en-IN',
        pitch: 1.0,
        rate: 0.92,
        onDone: () => {
          this.activeSpeakingId = null;
          this.onStopCallbacks.delete(id);
          if (onDone) onDone();
        },
        onError: (err) => {
          console.warn('Expo Speech error:', err);
          this.activeSpeakingId = null;
          this.onStopCallbacks.delete(id);
          if (onError) onError(err);
          if (onDone) onDone();
        }
      });
    } catch (e) {
      console.warn('TTS speak error:', e);
      this.activeSpeakingId = null;
      if (onError) onError(e);
      if (onDone) onDone();
    }
  }

  /**
   * Web SpeechSynthesis fallback with GC retention and keep-alive
   */
  private speakWithSpeechSynthesis(
    id: string,
    text: string,
    locale: string,
    onStart?: () => void,
    onDone?: () => void,
    onError?: (err: any) => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale || 'en-IN';
      utterance.rate = 0.92;

      // Keep strong global reference so V8 GC does not kill speech mid-sentence
      this.activeUtterance = utterance;
      if (!(window as any).__activeUtterances) {
        (window as any).__activeUtterances = new Set();
      }
      (window as any).__activeUtterances.add(utterance);

      // Match native Indian voice if installed
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langCode = (locale || 'en-IN').split('-')[0].toLowerCase();
        const matched = voices.find(v =>
          v.lang.toLowerCase() === locale.toLowerCase() ||
          v.lang.toLowerCase().startsWith(langCode)
        );
        if (matched) utterance.voice = matched;
      }

      // Chrome 15s keep-alive timer
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        clearInterval(this.keepAliveInterval);
        (window as any).__activeUtterances?.delete(utterance);
        this.activeUtterance = null;
        this.activeSpeakingId = null;
        this.onStopCallbacks.delete(id);
        if (onDone) onDone();
      };

      utterance.onerror = (e) => {
        clearInterval(this.keepAliveInterval);
        (window as any).__activeUtterances?.delete(utterance);
        this.activeUtterance = null;
        console.warn('Web SpeechSynthesis utterance error:', e);
        this.activeSpeakingId = null;
        this.onStopCallbacks.delete(id);
        if (onError) onError(e);
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      if (onDone) onDone();
    }
  }

  /**
   * Stop any current speech playback immediately
   */
  stop(): void {
    clearInterval(this.keepAliveInterval);

    // Stop HTMLAudioElement streams
    if (this.activeAudioElements.length > 0) {
      for (const audio of this.activeAudioElements) {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';
        } catch {}
      }
      this.activeAudioElements = [];
    }

    // Stop Web SpeechSynthesis
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (this.activeUtterance && (window as any).__activeUtterances) {
        (window as any).__activeUtterances.delete(this.activeUtterance);
        this.activeUtterance = null;
      }
      Speech.stop();
    } catch (e) {
      console.warn('TTS stop error:', e);
    }

    if (this.activeSpeakingId) {
      const cb = this.onStopCallbacks.get(this.activeSpeakingId);
      if (cb) cb();
      this.onStopCallbacks.delete(this.activeSpeakingId);
      this.activeSpeakingId = null;
    }
  }

  isSpeaking(id?: string): boolean {
    if (!id) return this.activeSpeakingId !== null;
    return this.activeSpeakingId === id;
  }
}

export const ttsService = new TTSService();
