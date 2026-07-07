window.TOEIC = window.TOEIC || {};

TOEIC.QuizEngine = {
  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  createSession(questions, count, track) {
    const picked = this._shuffle(questions).slice(0, count);
    let totalItems, answers;

    if (picked.length > 0 && (picked[0].part === 6)) {
      totalItems = picked.reduce(function (s, item) {
        return s + (item.blanks ? item.blanks.length : 0);
      }, 0);
      answers = picked.map(function (item) {
        return new Array(item.blanks ? item.blanks.length : 0).fill(null);
      });
    } else if (picked.length > 0 && (picked[0].part === 7 || picked[0].part === 3 || picked[0].part === 4)) {
      totalItems = picked.reduce(function (s, item) {
        return s + (item.questions ? item.questions.length : 0);
      }, 0);
      answers = picked.map(function (item) {
        return new Array(item.questions ? item.questions.length : 0).fill(null);
      });
    } else {
      totalItems = picked.length;
      answers = new Array(picked.length).fill(null);
    }

    return {
      part: picked.length > 0 ? picked[0].part : null,
      track: track,
      items: picked,
      currentIndex: 0,
      answers: answers,
      totalItems: totalItems,
      answeredCount: 0,
      _groupViewIndex: 0
    };
  },

  getCurrentItem(session) {
    return session.items[session.currentIndex] || null;
  },

  getCurrentIndex(session) {
    return session.currentIndex;
  },

  getTotalItems(session) {
    return session.items.length;
  },

  hasNext(session) {
    return session.currentIndex < session.items.length - 1;
  },

  next(session) {
    if (this.hasNext(session)) {
      session.currentIndex++;
      return true;
    }
    return false;
  },

  _getTrack(session) {
    return session.track || (TOEIC.App && TOEIC.App.getTrack ? TOEIC.App.getTrack() : 'T600');
  },

  /* ── Part1 ── */
  submitPart1(session, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (session.answers[session.currentIndex] !== null) return null;

    const isCorrect = answerText === item.answer;
    session.answers[session.currentIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = item.category || '';
    var track = this._getTrack(session);
    TOEIC.Analytics.recordAttempt(1, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(item.id);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 1, track: track, questionId: item.id,
        category: category,
        question: item.imageDescription || '',
        options: item.options,
        userAnswer: answerText, correctAnswer: item.answer,
        explanation: item.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: item.answer, explanation: item.explanation };
  },

  /* ── Part2 ── */
  submitPart2(session, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (session.answers[session.currentIndex] !== null) return null;

    const isCorrect = answerText === item.answer;
    session.answers[session.currentIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = item.category || '';
    var track = this._getTrack(session);
    TOEIC.Analytics.recordAttempt(2, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(item.id);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 2, track: track, questionId: item.id,
        category: category,
        question: item.audioScript || '',
        options: item.options,
        userAnswer: answerText, correctAnswer: item.answer,
        explanation: item.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: item.answer, explanation: item.explanation };
  },

  /* ── Part3 ── */
  submitPart3Question(session, qIndex, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (!item.questions || !item.questions[qIndex]) return null;
    if (session.answers[session.currentIndex][qIndex] !== null) return null;

    const q = item.questions[qIndex];
    const isCorrect = answerText === q.answer;
    session.answers[session.currentIndex][qIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = q.category || '';
    var track = this._getTrack(session);
    const qId = q.id || (item.id + '-Q' + (qIndex + 1));
    TOEIC.Analytics.recordAttempt(3, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(qId);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 3, track: track, questionId: qId,
        category: category,
        question: q.question, options: q.options,
        userAnswer: answerText, correctAnswer: q.answer,
        explanation: q.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: q.answer, explanation: q.explanation };
  },

  getPart3QuestionIndex(session) {
    const answers = session.answers[session.currentIndex];
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === null) return i;
    }
    return answers.length;
  },

  areAllPart3QuestionsAnswered(session) {
    return session.answers[session.currentIndex].every(function (a) { return a !== null; });
  },

  /* ── Part4 ── */
  submitPart4Question(session, qIndex, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (!item.questions || !item.questions[qIndex]) return null;
    if (session.answers[session.currentIndex][qIndex] !== null) return null;

    const q = item.questions[qIndex];
    const isCorrect = answerText === q.answer;
    session.answers[session.currentIndex][qIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = q.category || '';
    var track = this._getTrack(session);
    const qId = q.id || (item.id + '-Q' + (qIndex + 1));
    TOEIC.Analytics.recordAttempt(4, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(qId);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 4, track: track, questionId: qId,
        category: category,
        question: q.question, options: q.options,
        userAnswer: answerText, correctAnswer: q.answer,
        explanation: q.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: q.answer, explanation: q.explanation };
  },

  getPart4QuestionIndex(session) {
    const answers = session.answers[session.currentIndex];
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === null) return i;
    }
    return answers.length;
  },

  areAllPart4QuestionsAnswered(session) {
    return session.answers[session.currentIndex].every(function (a) { return a !== null; });
  },

  /* ── Part5 ── */
  submitPart5(session, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (session.answers[session.currentIndex] !== null) return null;

    const isCorrect = answerText === item.answer;
    session.answers[session.currentIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = item.category || '';
    var track = this._getTrack(session);
    TOEIC.Analytics.recordAttempt(5, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(item.id);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 5, track: track, questionId: item.id,
        category: category,
        question: item.question, options: item.options,
        userAnswer: answerText, correctAnswer: item.answer,
        explanation: item.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: item.answer, explanation: item.explanation };
  },

  /* ── Part6 ── */
  submitPart6Blank(session, blankIndex, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (!item.blanks) return null;
    const blank = item.blanks[blankIndex];
    if (!blank) return null;
    if (session.answers[session.currentIndex][blankIndex] !== null) return null;

    const isCorrect = answerText === blank.answer;
    session.answers[session.currentIndex][blankIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = blank.category || '';
    var track = this._getTrack(session);
    const qId = item.id + '-B' + (blankIndex + 1);
    TOEIC.Analytics.recordAttempt(6, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(qId);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 6, track: track, questionId: qId,
        category: category,
        question: (item.passageTitle || 'Part 6') + ' (blank ' + (blankIndex + 1) + ')',
        options: blank.options,
        userAnswer: answerText, correctAnswer: blank.answer,
        explanation: blank.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: blank.answer, explanation: blank.explanation };
  },

  getPart6BlankStatus(session) {
    const idx = session.currentIndex;
    return session.answers[idx].map(function (a) { return a !== null; });
  },

  areAllPart6BlanksAnswered(session) {
    return session.answers[session.currentIndex].every(function (a) { return a !== null; });
  },

  /* ── Part7 ── */
  submitPart7Question(session, qIndex, answerText) {
    const item = this.getCurrentItem(session);
    if (!item) return null;
    if (!item.questions || !item.questions[qIndex]) return null;
    if (session.answers[session.currentIndex][qIndex] !== null) return null;

    const q = item.questions[qIndex];
    const isCorrect = answerText === q.answer;
    session.answers[session.currentIndex][qIndex] = { userAnswer: answerText, isCorrect: isCorrect };
    session.answeredCount++;

    var category = q.category || '';
    var track = this._getTrack(session);
    const qId = q.id || (item.id + '-Q' + (qIndex + 1));
    TOEIC.Analytics.recordAttempt(7, category, isCorrect);
    if (isCorrect) {
      TOEIC.Storage.removeWrongItem(qId);
    } else {
      TOEIC.Storage.addWrongItem({
        part: 7, track: track, questionId: qId,
        category: category,
        question: q.question, options: q.options,
        userAnswer: answerText, correctAnswer: q.answer,
        explanation: q.explanation
      });
    }

    return { isCorrect: isCorrect, correctAnswer: q.answer, explanation: q.explanation };
  },

  getPart7QuestionIndex(session) {
    const answers = session.answers[session.currentIndex];
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === null) return i;
    }
    return answers.length;
  },

  areAllPart7QuestionsAnswered(session) {
    return session.answers[session.currentIndex].every(function (a) { return a !== null; });
  },

  /* ── Results (single-part) ── */
  getResults(session) {
    var correct = 0;
    var details = [];

    for (var i = 0; i < session.items.length; i++) {
      var item = session.items[i];
      var ans = session.answers[i];

      if (session.part === 1 || session.part === 2 || session.part === 5) {
        var r = ans;
        if (r) {
          if (r.isCorrect) correct++;
          details.push({
            questionId: item.id,
            part: session.part,
            question: item.imageDescription || item.audioScript || item.question || '',
            userAnswer: r.userAnswer,
            correctAnswer: item.answer,
            isCorrect: r.isCorrect,
            explanation: item.explanation
          });
        }
      } else if (session.part === 3 || session.part === 4 || session.part === 7) {
        if (item.questions) {
          for (var q = 0; q < item.questions.length; q++) {
            var qr = ans[q];
            if (qr) {
              if (qr.isCorrect) correct++;
              details.push({
                questionId: item.id + '-Q' + (q + 1),
                part: session.part,
                question: item.questions[q].question,
                userAnswer: qr.userAnswer,
                correctAnswer: item.questions[q].answer,
                isCorrect: qr.isCorrect,
                explanation: item.questions[q].explanation
              });
            }
          }
        }
      } else if (session.part === 6) {
        if (item.blanks) {
          for (var b = 0; b < item.blanks.length; b++) {
            var br = ans[b];
            if (br) {
              if (br.isCorrect) correct++;
              details.push({
                questionId: item.id + '-B' + (b + 1),
                part: 6,
                question: (item.passageTitle || 'Part 6') + ' (blank ' + (b + 1) + ')',
                userAnswer: br.userAnswer,
                correctAnswer: item.blanks[b].answer,
                isCorrect: br.isCorrect,
                explanation: item.blanks[b].explanation
              });
            }
          }
        }
      }
    }

    return {
      total: session.totalItems,
      correct: correct,
      accuracy: session.totalItems > 0 ? Math.round(correct / session.totalItems * 100) : 0,
      details: details
    };
  },

  /* ── Composite Results ── */
  getCompositeResults(session) {
    var correct = 0;
    var details = [];
    var perPart = {};

    for (var i = 0; i < session.items.length; i++) {
      var item = session.items[i];
      var ans = session.answers[i];
      var part = item.part;

      if (!perPart[part]) perPart[part] = { correct: 0, total: 0 };

      if (part === 1 || part === 2 || part === 5) {
        if (ans) {
          if (ans.isCorrect) { correct++; perPart[part].correct++; }
          perPart[part].total++;
          details.push({
            questionId: item.id, part: part,
            question: item.imageDescription || item.audioScript || item.question || '',
            userAnswer: ans.userAnswer, correctAnswer: item.answer,
            isCorrect: ans.isCorrect, explanation: item.explanation
          });
        }
      } else if (part === 3 || part === 4 || part === 7) {
        if (item.questions && Array.isArray(ans)) {
          for (var q = 0; q < item.questions.length; q++) {
            var qr = ans[q];
            if (qr) {
              if (qr.isCorrect) { correct++; perPart[part].correct++; }
              perPart[part].total++;
              details.push({
                questionId: item.id + '-Q' + (q + 1), part: part,
                question: item.questions[q].question,
                userAnswer: qr.userAnswer, correctAnswer: item.questions[q].answer,
                isCorrect: qr.isCorrect, explanation: item.questions[q].explanation
              });
            }
          }
        }
      } else if (part === 6) {
        if (item.blanks && Array.isArray(ans)) {
          for (var b = 0; b < item.blanks.length; b++) {
            var br = ans[b];
            if (br) {
              if (br.isCorrect) { correct++; perPart[part].correct++; }
              perPart[part].total++;
              details.push({
                questionId: item.id + '-B' + (b + 1), part: part,
                question: (item.passageTitle || 'Part 6') + ' (blank ' + (b + 1) + ')',
                userAnswer: br.userAnswer, correctAnswer: item.blanks[b].answer,
                isCorrect: br.isCorrect, explanation: item.blanks[b].explanation
              });
            }
          }
        }
      }
    }

    var total = session.totalItems;
    return {
      total: total,
      answered: details.length,
      correct: correct,
      accuracy: total > 0 ? Math.round(correct / total * 100) : 0,
      details: details,
      perPart: perPart,
      partOrder: [1, 2, 3, 4, 5, 6, 7]
    };
  }
};
