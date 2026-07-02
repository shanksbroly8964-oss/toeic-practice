window.TOEIC = window.TOEIC || {};

TOEIC.Storage = {
  getTrack() {
    return localStorage.getItem('toeic_track');
  },

  setTrack(track) {
    localStorage.setItem('toeic_track', track);
  },

  addWrongItem(item) {
    var wrong = JSON.parse(localStorage.getItem('toeic_wrong') || '[]');
    var idx = wrong.findIndex(function (w) { return w.questionId === item.questionId; });
    var entry = {
      part: item.part,
      track: item.track,
      questionId: item.questionId,
      question: item.question,
      options: item.options,
      userAnswer: item.userAnswer,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      timestamp: item.timestamp || Date.now()
    };
    if (idx >= 0) {
      wrong[idx] = entry;
    } else {
      wrong.push(entry);
    }
    localStorage.setItem('toeic_wrong', JSON.stringify(wrong));
  },

  removeWrongItem(questionId) {
    var wrong = JSON.parse(localStorage.getItem('toeic_wrong') || '[]');
    var filtered = wrong.filter(function (w) { return w.questionId !== questionId; });
    localStorage.setItem('toeic_wrong', JSON.stringify(filtered));
  },

  getWrongItems() {
    return JSON.parse(localStorage.getItem('toeic_wrong') || '[]');
  }
};
