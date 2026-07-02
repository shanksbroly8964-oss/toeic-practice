window.TOEIC = window.TOEIC || {};

TOEIC.SessionComposer = {
  _shuffle: function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  },

  composeSession: async function (track) {
    var self = this;

    var results = await Promise.all([
      TOEIC.DataLoader.loadPart1(track),
      TOEIC.DataLoader.loadPart2(track),
      TOEIC.DataLoader.loadPart3(track),
      TOEIC.DataLoader.loadPart4(track),
      TOEIC.DataLoader.loadPart5(track),
      TOEIC.DataLoader.loadPart6(track),
      TOEIC.DataLoader.loadPart7(track)
    ]);

    var p1 = results[0], p2 = results[1], p3 = results[2], p4 = results[3];
    var p5 = results[4], p6 = results[5], p7 = results[6];

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7) {
      return null;
    }

    var items = [];
    var answers = [];
    var totalItems = 0;

    /* Part1: 2 questions */
    var p1picked = self._shuffle(p1).slice(0, 2);
    p1picked.forEach(function (item) {
      items.push(item);
      answers.push(null);
      totalItems++;
    });

    /* Part2: 8 questions */
    var p2picked = self._shuffle(p2).slice(0, 8);
    p2picked.forEach(function (item) {
      items.push(item);
      answers.push(null);
      totalItems++;
    });

    /* Part3: groups until >= 12 sub-questions */
    var p3shuffled = self._shuffle(p3);
    var p3qCount = 0;
    for (var i3 = 0; i3 < p3shuffled.length && p3qCount < 12; i3++) {
      var g3 = p3shuffled[i3];
      var qlen = g3.questions ? g3.questions.length : 0;
      var needed = 12 - p3qCount;
      if (qlen <= needed) {
        items.push(g3);
        answers.push(new Array(qlen).fill(null));
        p3qCount += qlen;
        totalItems += qlen;
      } else {
        var copy3 = JSON.parse(JSON.stringify(g3));
        copy3.questions = copy3.questions.slice(0, needed);
        items.push(copy3);
        answers.push(new Array(needed).fill(null));
        p3qCount += needed;
        totalItems += needed;
      }
    }

    /* Part4: groups until >= 10 sub-questions */
    var p4shuffled = self._shuffle(p4);
    var p4qCount = 0;
    for (var i4 = 0; i4 < p4shuffled.length && p4qCount < 10; i4++) {
      var g4 = p4shuffled[i4];
      var qlen4 = g4.questions ? g4.questions.length : 0;
      var needed4 = 10 - p4qCount;
      if (qlen4 <= needed4) {
        items.push(g4);
        answers.push(new Array(qlen4).fill(null));
        p4qCount += qlen4;
        totalItems += qlen4;
      } else {
        var copy4 = JSON.parse(JSON.stringify(g4));
        copy4.questions = copy4.questions.slice(0, needed4);
        items.push(copy4);
        answers.push(new Array(needed4).fill(null));
        p4qCount += needed4;
        totalItems += needed4;
      }
    }

    /* Part5: 10 questions */
    var p5picked = self._shuffle(p5).slice(0, 10);
    p5picked.forEach(function (item) {
      items.push(item);
      answers.push(null);
      totalItems++;
    });

    /* Part6: 1 group */
    var p6picked = self._shuffle(p6).slice(0, 1);
    p6picked.forEach(function (item) {
      items.push(item);
      var blankCount = item.blanks ? item.blanks.length : 4;
      answers.push(new Array(blankCount).fill(null));
      totalItems += blankCount;
    });

    /* Part7: 2 groups (mixed single/double/triple) */
    var p7picked = self._shuffle(p7).slice(0, 2);
    p7picked.forEach(function (item) {
      items.push(item);
      var count = item.questions ? item.questions.length : 0;
      answers.push(new Array(count).fill(null));
      totalItems += count;
    });

    return {
      isComposite: true,
      track: track,
      items: items,
      answers: answers,
      currentIndex: 0,
      totalItems: totalItems,
      answeredCount: 0
    };
  }
};
