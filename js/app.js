window.TOEIC = window.TOEIC || {};

TOEIC.App = {
  _track: 'T600',
  _session: null,

  init() {
    this._track = TOEIC.Storage.getTrack() || 'T600';
    this.goHome();
  },

  getTrack() {
    return this._track;
  },

  switchTrack(track) {
    this._track = track;
    TOEIC.Storage.setTrack(track);
    this.goHome();
  },

  goHome() {
    this._session = null;
    TOEIC.UIRenderer.renderHome(this._track);
  },

  async startPractice(part) {
    var self = this;
    TOEIC.UIRenderer.showCountDialog(part, async function (count) {
      TOEIC.UIRenderer.renderLoading('\u984C\u5EAB\u8F09\u5165\u4E2D...');

      var questions;
      switch (part) {
        case 1: questions = await TOEIC.DataLoader.loadPart1(self._track); break;
        case 2: questions = await TOEIC.DataLoader.loadPart2(self._track); break;
        case 3: questions = await TOEIC.DataLoader.loadPart3(self._track); break;
        case 4: questions = await TOEIC.DataLoader.loadPart4(self._track); break;
        case 5: questions = await TOEIC.DataLoader.loadPart5(self._track); break;
        case 6: questions = await TOEIC.DataLoader.loadPart6(self._track); break;
        case 7: questions = await TOEIC.DataLoader.loadPart7(self._track); break;
      }

      if (!questions || questions.length === 0) {
        TOEIC.UIRenderer.renderError(
          '\u984C\u5EAB\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u78BA\u8A8D\u984C\u5EAB\u6A94\u6848\u5DF2\u7522\u751F\u5F8C\u91CD\u8A66\u3002'
        );
        return;
      }

      var actualCount = Math.min(count, questions.length);
      self._session = TOEIC.QuizEngine.createSession(questions, actualCount, self._track);
      self._renderCurrentQuestion();
    });
  },

  _renderCurrentQuestion() {
    if (!this._session) return;
    var item = TOEIC.QuizEngine.getCurrentItem(this._session);
    var index = TOEIC.QuizEngine.getCurrentIndex(this._session);
    var total = TOEIC.QuizEngine.getTotalItems(this._session);
    var part = this._session.isComposite ? item.part : this._session.part;

    switch (part) {
      case 1: TOEIC.UIRenderer.renderPart1Question(item, index, total, this._session); break;
      case 2: TOEIC.UIRenderer.renderPart2Question(item, index, total, this._session); break;
      case 3: TOEIC.UIRenderer.renderPart3Question(item, index, total, this._session); break;
      case 4: TOEIC.UIRenderer.renderPart4Question(item, index, total, this._session); break;
      case 5: TOEIC.UIRenderer.renderPart5Question(item, index, total, this._session); break;
      case 6: TOEIC.UIRenderer.renderPart6Question(item, index, total, this._session); break;
      case 7: TOEIC.UIRenderer.renderPart7Question(item, index, total, this._session); break;
    }
  },

  /* ── Part1 ── */
  submitPart1Answer(answer) {
    TOEIC.QuizEngine.submitPart1(this._session, answer);
    this._renderCurrentQuestion();
  },

  /* ── Part2 ── */
  submitPart2Answer(answer) {
    TOEIC.QuizEngine.submitPart2(this._session, answer);
    this._renderCurrentQuestion();
  },

  /* ── Part3 ── */
  submitPart3Answer(answer) {
    var qIndex = TOEIC.QuizEngine.getPart3QuestionIndex(this._session);
    TOEIC.QuizEngine.submitPart3Question(this._session, qIndex, answer);
    this._renderCurrentQuestion();
  },

  nextPart3Question() {
    this._renderCurrentQuestion();
  },

  /* ── Part4 ── */
  submitPart4Answer(answer) {
    var qIndex = TOEIC.QuizEngine.getPart4QuestionIndex(this._session);
    TOEIC.QuizEngine.submitPart4Question(this._session, qIndex, answer);
    this._renderCurrentQuestion();
  },

  nextPart4Question() {
    this._renderCurrentQuestion();
  },

  /* ── Part5 ── */
  submitPart5Answer(answer) {
    TOEIC.QuizEngine.submitPart5(this._session, answer);
    this._renderCurrentQuestion();
  },

  /* ── Part6 ── */
  submitPart6Blank(blankIndex, answer) {
    TOEIC.QuizEngine.submitPart6Blank(this._session, blankIndex, answer);
    this._renderCurrentQuestion();
  },

  /* ── Part7 ── */
  submitPart7Answer(answer) {
    var qIndex = TOEIC.QuizEngine.getPart7QuestionIndex(this._session);
    TOEIC.QuizEngine.submitPart7Question(this._session, qIndex, answer);
    this._renderCurrentQuestion();
  },

  nextPart7Question() {
    this._renderCurrentQuestion();
  },

  nextQuestion() {
    TOEIC.QuizEngine.next(this._session);
    this._renderCurrentQuestion();
  },

  finishPractice() {
    var results;
    var mode;
    var track = this._track;
    if (this._session.isComposite) {
      results = TOEIC.QuizEngine.getCompositeResults(this._session);
      mode = 'composite';
      TOEIC.UIRenderer.renderCompositeResults(results, this._session);
    } else {
      results = TOEIC.QuizEngine.getResults(this._session);
      mode = 'single';
      TOEIC.UIRenderer.renderResults(results, this._session.part, this._session.items.length);
    }
    var today = new Date().toISOString().slice(0, 10);
    TOEIC.Analytics.recordSession(today, mode, track, results.total, results.correct);
  },

  async startCompositePractice() {
    var self = this;
    TOEIC.UIRenderer.renderLoading('\u6B63\u5728\u7D44\u5377...');
    try {
      var session = await TOEIC.SessionComposer.composeSession(self._track);
      if (!session || !session.items || session.items.length === 0) {
        TOEIC.UIRenderer.renderError('\u7D44\u5377\u5931\u6557\uFF0C\u984C\u5EAB\u4E0D\u8DB3\u3002');
        return;
      }
      self._session = session;
      TOEIC.UIRenderer.renderCompositeSetup(session, function () {
        self._renderCurrentQuestion();
      });
    } catch (e) {
      console.warn('Composite practice failed:', e);
      TOEIC.UIRenderer.renderError('\u7D44\u5377\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002');
    }
  },

  openWrongBook() {
    TOEIC.UIRenderer.renderWrongBookHome();
  },

  openAnalytics() {
    TOEIC.UIRenderer.renderAnalyticsPage();
  },

  openSettings() {
    TOEIC.UIRenderer.renderSettingsPage();
  }
};

document.addEventListener('DOMContentLoaded', function () {
  TOEIC.App.init();
});
