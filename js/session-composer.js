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

  _getConfig: function () {
    var raw = localStorage.getItem('toeic_session_config');
    if (raw) {
      try {
        var c = JSON.parse(raw);
        return {
          p1: Math.max(0, Math.min(10, c.p1 != null ? c.p1 : 2)),
          p2: Math.max(0, Math.min(20, c.p2 != null ? c.p2 : 8)),
          p3: Math.max(0, Math.min(30, c.p3 != null ? c.p3 : 12)),
          p4: Math.max(0, Math.min(30, c.p4 != null ? c.p4 : 10)),
          p5: Math.max(0, Math.min(30, c.p5 != null ? c.p5 : 10)),
          p6: Math.max(0, Math.min(5,  c.p6 != null ? c.p6 : 1)),
          p7: Math.max(0, Math.min(5,  c.p7 != null ? c.p7 : 2))
        };
      } catch (e) {}
    }
    return { p1: 2, p2: 8, p3: 12, p4: 10, p5: 10, p6: 1, p7: 2 };
  },

  composeSession: async function (track) {
    var self = this;
    var cfg = self._getConfig();

    var loadTasks = [];
    if (cfg.p1 > 0) loadTasks.push(TOEIC.DataLoader.loadPart1(track));
    if (cfg.p2 > 0) loadTasks.push(TOEIC.DataLoader.loadPart2(track));
    if (cfg.p3 > 0) loadTasks.push(TOEIC.DataLoader.loadPart3(track));
    if (cfg.p4 > 0) loadTasks.push(TOEIC.DataLoader.loadPart4(track));
    if (cfg.p5 > 0) loadTasks.push(TOEIC.DataLoader.loadPart5(track));
    if (cfg.p6 > 0) loadTasks.push(TOEIC.DataLoader.loadPart6(track));
    if (cfg.p7 > 0) loadTasks.push(TOEIC.DataLoader.loadPart7(track));

    var results = await Promise.all(loadTasks);
    var idx = 0;
    var p1, p2, p3, p4, p5, p6, p7;
    if (cfg.p1 > 0) p1 = results[idx++];
    if (cfg.p2 > 0) p2 = results[idx++];
    if (cfg.p3 > 0) p3 = results[idx++];
    if (cfg.p4 > 0) p4 = results[idx++];
    if (cfg.p5 > 0) p5 = results[idx++];
    if (cfg.p6 > 0) p6 = results[idx++];
    if (cfg.p7 > 0) p7 = results[idx++];

    if ((cfg.p1 > 0 && !p1) || (cfg.p2 > 0 && !p2) || (cfg.p3 > 0 && !p3) ||
        (cfg.p4 > 0 && !p4) || (cfg.p5 > 0 && !p5) || (cfg.p6 > 0 && !p6) ||
        (cfg.p7 > 0 && !p7)) {
      return null;
    }

    var items = [];
    var answers = [];
    var totalItems = 0;
    var partCounts = {};

    /* Part1 */
    if (cfg.p1 > 0) {
      var p1picked = self._shuffle(p1).slice(0, cfg.p1);
      p1picked.forEach(function (item) {
        items.push(item);
        answers.push(null);
        totalItems++;
      });
      partCounts[1] = { count: cfg.p1, subTotal: cfg.p1 };
    }

    /* Part2 */
    if (cfg.p2 > 0) {
      var p2picked = self._shuffle(p2).slice(0, cfg.p2);
      p2picked.forEach(function (item) {
        items.push(item);
        answers.push(null);
        totalItems++;
      });
      partCounts[2] = { count: cfg.p2, subTotal: cfg.p2 };
    }

    /* Part3 */
    if (cfg.p3 > 0) {
      var p3shuffled = self._shuffle(p3);
      var p3qCount = 0;
      var p3groupCount = 0;
      for (var i3 = 0; i3 < p3shuffled.length && p3qCount < cfg.p3; i3++) {
        var g3 = p3shuffled[i3];
        var qlen = g3.questions ? g3.questions.length : 0;
        var needed = cfg.p3 - p3qCount;
        if (qlen <= needed) {
          items.push(g3);
          answers.push(new Array(qlen).fill(null));
          p3qCount += qlen;
          totalItems += qlen;
          p3groupCount++;
        } else {
          var copy3 = JSON.parse(JSON.stringify(g3));
          copy3.questions = copy3.questions.slice(0, needed);
          items.push(copy3);
          answers.push(new Array(needed).fill(null));
          p3qCount += needed;
          totalItems += needed;
          p3groupCount++;
        }
      }
      partCounts[3] = { count: p3groupCount, subTotal: p3qCount };
    }

    /* Part4 */
    if (cfg.p4 > 0) {
      var p4shuffled = self._shuffle(p4);
      var p4qCount = 0;
      var p4groupCount = 0;
      for (var i4 = 0; i4 < p4shuffled.length && p4qCount < cfg.p4; i4++) {
        var g4 = p4shuffled[i4];
        var qlen4 = g4.questions ? g4.questions.length : 0;
        var needed4 = cfg.p4 - p4qCount;
        if (qlen4 <= needed4) {
          items.push(g4);
          answers.push(new Array(qlen4).fill(null));
          p4qCount += qlen4;
          totalItems += qlen4;
          p4groupCount++;
        } else {
          var copy4 = JSON.parse(JSON.stringify(g4));
          copy4.questions = copy4.questions.slice(0, needed4);
          items.push(copy4);
          answers.push(new Array(needed4).fill(null));
          p4qCount += needed4;
          totalItems += needed4;
          p4groupCount++;
        }
      }
      partCounts[4] = { count: p4groupCount, subTotal: p4qCount };
    }

    /* Part5 */
    if (cfg.p5 > 0) {
      var p5picked = self._shuffle(p5).slice(0, cfg.p5);
      p5picked.forEach(function (item) {
        items.push(item);
        answers.push(null);
        totalItems++;
      });
      partCounts[5] = { count: cfg.p5, subTotal: cfg.p5 };
    }

    /* Part6 */
    if (cfg.p6 > 0) {
      var p6picked = self._shuffle(p6).slice(0, cfg.p6);
      var p6sub = 0;
      p6picked.forEach(function (item) {
        items.push(item);
        var blankCount = item.blanks ? item.blanks.length : 4;
        answers.push(new Array(blankCount).fill(null));
        totalItems += blankCount;
        p6sub += blankCount;
      });
      partCounts[6] = { count: cfg.p6, subTotal: p6sub };
    }

    /* Part7 */
    if (cfg.p7 > 0) {
      var p7picked = self._shuffle(p7).slice(0, cfg.p7);
      var p7sub = 0;
      p7picked.forEach(function (item) {
        items.push(item);
        var count = item.questions ? item.questions.length : 0;
        answers.push(new Array(count).fill(null));
        totalItems += count;
        p7sub += count;
      });
      partCounts[7] = { count: cfg.p7, subTotal: p7sub };
    }

    return {
      isComposite: true,
      track: track,
      items: items,
      answers: answers,
      currentIndex: 0,
      totalItems: totalItems,
      answeredCount: 0,
      partCounts: partCounts,
      _groupViewIndex: 0
    };
  }
};
