window.TOEIC = window.TOEIC || {};

TOEIC.TTS = {
  RATES: { T600: 0.8, T730: 0.95 },
  _currentUtterance: null,

  isSupported() {
    return 'speechSynthesis' in window;
  },

  speak(text, track) {
    if (!this.isSupported()) return;
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = this.RATES[track] || 0.85;
    this._currentUtterance = u;
    speechSynthesis.speak(u);
  },

  stop() {
    speechSynthesis.cancel();
    this._currentUtterance = null;
  },

  isSpeaking() {
    return speechSynthesis.speaking;
  }
};
