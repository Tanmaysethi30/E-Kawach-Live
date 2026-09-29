/**
 * Web Audio API Emergency Siren & Dispatch Chime Synthesizer
 * Generates an authentic European/Trauma Unit two-tone wailing emergency siren
 * using native browser Web Audio oscillators (no external audio files required).
 */

class SirenAudioPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;
    this.timer = null;
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSiren(durationMs = 8000) {
    try {
      this.stop();
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      this.isPlaying = true;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.25, now);
      this.gainNode.connect(this.audioCtx.destination);

      // Dual Frequency Modulated Oscillator for Hi-Lo Trauma Siren
      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sawtooth';

      // Alternating 750Hz to 960Hz warble cycle (0.35s period)
      for (let t = 0; t < durationMs / 1000; t += 0.35) {
        const stepTime = now + t;
        const freq = (Math.floor(t / 0.35) % 2 === 0) ? 960 : 770;
        this.osc1.frequency.setValueAtTime(freq, stepTime);
      }

      this.osc1.connect(this.gainNode);
      this.osc1.start(now);
      this.osc1.stop(now + durationMs / 1000);

      // Auto stop state
      this.timer = window.setTimeout(() => {
        this.stop();
      }, durationMs);

    } catch (err) {
      console.warn('Emergency siren synthesizer warning:', err);
    }
  }

  playChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_e) {}
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.osc1) {
      try {
        this.osc1.stop();
        this.osc1.disconnect();
      } catch (_e) {}
      this.osc1 = null;
    }
    if (this.osc2) {
      try {
        this.osc2.stop();
        this.osc2.disconnect();
      } catch (_e) {}
      this.osc2 = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (_e) {}
      this.gainNode = null;
    }
  }

  isSirenActive() {
    return this.isPlaying;
  }
}

export const sirenPlayer = new SirenAudioPlayer();
