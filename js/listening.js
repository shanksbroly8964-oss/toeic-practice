window.TOEIC = window.TOEIC || {};

TOEIC.Listening = {
  playConversation: function (lines, track) {
    if (!lines || lines.length === 0) return;
    TOEIC.TTS.stop();
    var i = 0;
    function next() {
      if (i >= lines.length) return;
      var line = lines[i];
      var text = (typeof line === 'string') ? line : ((line.speaker ? line.speaker + ': ' : '') + (line.line || ''));
      TOEIC.TTS.speak(text, track);
      var u = TOEIC.TTS._currentUtterance;
      if (u) {
        u.onend = function () {
          i++;
          next();
        };
      } else {
        i++;
        next();
      }
    }
    next();
  },

  playTalk: function (text, track) {
    if (!text) return;
    TOEIC.TTS.speak(text, track);
  }
};
