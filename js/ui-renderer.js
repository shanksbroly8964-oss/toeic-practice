window.TOEIC = window.TOEIC || {};

TOEIC.UIRenderer = {
  _el(id) {
    return document.getElementById(id);
  },

  _clear() {
    var app = this._el('app');
    app.innerHTML = '';
    return app;
  },

  _createTTSButton(text, track) {
    var btn = document.createElement('button');
    btn.className = 'tts-btn';
    btn.textContent = '\uD83D\uDD0A';
    btn.title = '\u6717\u8B80';
    btn.setAttribute('aria-label', '\u6717\u8B80');

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      if (TOEIC.TTS.isSpeaking()) {
        TOEIC.TTS.stop();
        btn.classList.remove('speaking');
      } else {
        if (!TOEIC.TTS.isSupported()) {
          btn.disabled = true;
          btn.title = '\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u8A9E\u97F3';
          return;
        }
        TOEIC.TTS.speak(text, track);
        btn.classList.add('speaking');
        var u = TOEIC.TTS._currentUtterance;
        if (u) {
          u.onend = function () { btn.classList.remove('speaking'); };
        }
      }
    });

    return btn;
  },

  _renderBackButton() {
    var btn = document.createElement('button');
    btn.className = 'back-link';
    btn.innerHTML = '\u2190 \u8FD4\u56DE\u9996\u9801';
    btn.addEventListener('click', function () { TOEIC.App.goHome(); });
    return btn;
  },

  /* ── Home Page ── */
  renderHome(track) {
    var app = this._clear();
    var trackDisplay = track || 'T600';

    var header = document.createElement('div');
    header.className = 'app-header';

    var h1 = document.createElement('h1');
    h1.textContent = 'TOEIC L&R \u7DF4\u7FD2';
    header.appendChild(h1);

    var toggle = document.createElement('div');
    toggle.className = 'track-toggle';

    var btnT600 = document.createElement('button');
    btnT600.className = 'track-btn' + (trackDisplay === 'T600' ? ' active' : '');
    btnT600.textContent = 'T600';
    btnT600.addEventListener('click', function () { TOEIC.App.switchTrack('T600'); });

    var btnT730 = document.createElement('button');
    btnT730.className = 'track-btn' + (trackDisplay === 'T730' ? ' active' : '');
    btnT730.textContent = 'T730';
    btnT730.addEventListener('click', function () { TOEIC.App.switchTrack('T730'); });

    toggle.appendChild(btnT600);
    toggle.appendChild(btnT730);
    header.appendChild(toggle);

    var trackBadge = document.createElement('span');
    trackBadge.className = 'track-badge';
    trackBadge.textContent = '目標：' + trackDisplay;
    toggle.parentNode.insertBefore(trackBadge, toggle);

    app.appendChild(header);

    var intro = document.createElement('div');
    intro.className = 'home-intro';
    intro.innerHTML = '<p>TOEIC L&R \u7DF4\u7FD2\u5DE5\u5177 \u2014 \u5C08\u70BA\u6210\u4EBA\u4E0A\u73ED\u65CF\u8A2D\u8A08\u7684\u591A\u76CA\u5099\u8003\u5E73\u53F0\u3002'
      + '\u5B8C\u6574\u6DB5\u84CB\u807D\u529B Part 1\u20134 \u8207\u95B1\u8B80 Part 5\u20137\uFF0C'
      + '\u652F\u63F4 T600\uFF08600\u5206\u885D\u523A\uFF09\u8207 T730\uFF08730\u5206\u9032\u968E\uFF09\u5169\u7A2E\u5206\u8ECC\u3002</p>'
      + '<ul class="home-features">'
      + '<li><strong>T600 \u5206\u8ECC</strong>\uFF1A\u57FA\u790E\u5546\u52D9\u82F1\u6587\uFF0C\u8A5E\u5F59\u8207\u53E5\u578B\u8F03\u7C21\u55AE\uFF0C\u9069\u5408\u525B\u958B\u59CB\u5099\u8003\u8005\u3002</li>'
      + '<li><strong>T730 \u5206\u8ECC</strong>\uFF1A\u9032\u968E\u5546\u52D9\u82F1\u6587\uFF0C\u8A5E\u5F59\u5EE3\u3001\u53E5\u578B\u8907\u96DC\uFF0C\u9069\u5408\u653B\u9802\u8005\u3002</li>'
      + '<li>\u7D9C\u5408\u7DF4\u7FD2\u6BCF\u56DE\u5408\u984C\u6578\uFF1AP1=2\u984C\u3001P2=8\u984C\u3001P3\u2248\u0012\u984C\u3001P4\u2248\u0010\u984C\u3001P5=10\u984C\u3001P6=1\u7D44(4\u7A7A)\u3001P7=2\u7D44</li>'
      + '<li>\u5168\u7A0B TTS \u767C\u97F3\u652F\u63F4\uFF0C\u6BCF\u984C\u3014\uD83D\uDD0A\u3015\u5373\u53EF\u6717\u8B80\uFF1B\u932F\u984C\u672C\u81EA\u52D5\u8A18\u9304\u8207\u91CD\u7B54\u3002</li>'
      + '</ul>';
    app.appendChild(intro);

    /* ── Listening Section ── */
    var listenSection = document.createElement('div');
    var stListen = document.createElement('h2');
    stListen.className = 'section-title';
    stListen.textContent = '\u807D\u529B\u7CBE\u7DF4';
    listenSection.appendChild(stListen);

    var listenGrid = document.createElement('div');
    listenGrid.className = 'card-grid';

    listenGrid.appendChild(this._createCard(
      'Part 1', '\u7167\u7247\u63CF\u8FF0 \u00B7 4\u9078\u984C',
      function () { TOEIC.App.startPractice(1); }
    ));
    listenGrid.appendChild(this._createCard(
      'Part 2', '\u61C9\u7B54\u554F\u984C \u00B7 3\u9078\u984C',
      function () { TOEIC.App.startPractice(2); }
    ));
    listenGrid.appendChild(this._createCard(
      'Part 3', '\u7C21\u77ED\u5C0D\u8A71 \u00B7 \u591A\u984C\u7D44',
      function () { TOEIC.App.startPractice(3); }
    ));
    listenGrid.appendChild(this._createCard(
      'Part 4', '\u7C21\u77ED\u7368\u767D \u00B7 \u591A\u984C\u7D44',
      function () { TOEIC.App.startPractice(4); }
    ));

    listenSection.appendChild(listenGrid);
    app.appendChild(listenSection);

    /* ── Reading Section ── */
    var readingSection = document.createElement('div');
    var stRead = document.createElement('h2');
    stRead.className = 'section-title';
    stRead.textContent = '\u95B1\u8B80\u7CBE\u7DF4';
    readingSection.appendChild(stRead);

    var readGrid = document.createElement('div');
    readGrid.className = 'card-grid';

    readGrid.appendChild(this._createCard(
      'Part 5', 'Incomplete Sentences \u55AE\u53E5\u586B\u7A7A',
      function () { TOEIC.App.startPractice(5); }
    ));
    readGrid.appendChild(this._createCard(
      'Part 6', 'Text Completion \u6BB5\u843D\u586B\u7A7A',
      function () { TOEIC.App.startPractice(6); }
    ));
    readGrid.appendChild(this._createCard(
      'Part 7', 'Reading Comprehension \u9605\u8B80\u7406\u89E3',
      function () { TOEIC.App.startPractice(7); }
    ));

    readingSection.appendChild(readGrid);
    app.appendChild(readingSection);

    /* ── Composite / Tools Section ── */
    var toolsSection = document.createElement('div');
    var stTools = document.createElement('h2');
    stTools.className = 'section-title';
    stTools.textContent = '\u7D9C\u5408\u5DE5\u5177';
    toolsSection.appendChild(stTools);

    var toolsGrid = document.createElement('div');
    toolsGrid.className = 'card-grid';

    toolsGrid.appendChild(this._createCard(
      '\u5168\u771F\u6A21\u6A21\u8A66',
      'Part 1-7 \u6DF7\u5408\u7D44\u5377 \u00B7 \u807D\u8B80\u5168\u7C21',
      function () { TOEIC.App.startCompositePractice(); }
    ));

    toolsGrid.appendChild(this._createCard(
      '\u932F\u984C\u672C',
      '\u67E5\u770B\u4E26\u91CD\u505A\u932F\u984C',
      function () { TOEIC.App.openWrongBook(); }
    ));

    toolsSection.appendChild(toolsGrid);
    app.appendChild(toolsSection);
  },

  _createCard(title, desc, onClick) {
    var card = document.createElement('div');
    card.className = 'card';
    var h3 = document.createElement('h3');
    h3.textContent = title;
    var p = document.createElement('p');
    p.textContent = desc;
    card.appendChild(h3);
    card.appendChild(p);
    card.addEventListener('click', onClick);
    return card;
  },

  /* ── Loading ── */
  renderLoading(msg) {
    var app = this._clear();
    var c = document.createElement('div');
    c.className = 'loading-container';
    var s = document.createElement('div');
    s.className = 'spinner';
    c.appendChild(s);
    var p = document.createElement('p');
    p.textContent = msg || '\u984C\u5EAB\u8F09\u5165\u4E2D...';
    c.appendChild(p);
    app.appendChild(c);
  },

  /* ── Error ── */
  renderError(msg) {
    var app = this._el('app');
    app.innerHTML = '';
    var c = document.createElement('div');
    c.className = 'error-container';
    var p = document.createElement('p');
    p.style.fontWeight = '600';
    p.textContent = msg || '\u984C\u5EAB\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u8A66\u3002';
    c.appendChild(p);
    var btn = document.createElement('button');
    btn.className = 'retry-btn';
    btn.textContent = '\u8FD4\u56DE\u9996\u9801';
    btn.addEventListener('click', function () { TOEIC.App.goHome(); });
    c.appendChild(btn);
    app.appendChild(c);
  },

  /* ==================================================================
     Part1 — Photo Description
     ================================================================== */
  renderPart1Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 1', index, total);
    app.appendChild(header);

    var block = document.createElement('div');
    block.className = 'question-block';

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u984C / \u5171 ' + total + ' \u984C';
    block.appendChild(num);

    /* Image description box */
    var descBox = document.createElement('div');
    descBox.className = 'image-description-box';

    var descTitle = document.createElement('div');
    descTitle.className = 'image-desc-title';
    descTitle.textContent = '\uD83D\uDDBC\uFE0F \u60C5\u5883\u63CF\u8FF0';
    descBox.appendChild(descTitle);

    var descText = document.createElement('p');
    descText.className = 'image-desc-text';
    descText.textContent = item.imageDescription || '';
    descBox.appendChild(descText);

    var descTTSRow = document.createElement('div');
    descTTSRow.className = 'desc-tts-row';
    var descTTS = this._createTTSButton(item.imageDescription || '', TOEIC.App.getTrack());
    descTTSRow.appendChild(descTTS);
    descBox.appendChild(descTTSRow);

    block.appendChild(descBox);

    var prevAnswer = session.answers[session.currentIndex];
    var answered = prevAnswer !== null;

    var self = this;
    var opts = document.createElement('div');
    opts.className = 'options';

    var letters = ['(A) ', '(B) ', '(C) ', '(D) '];
    item.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'option-btn';

      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';

      var span = document.createElement('span');
      span.className = 'option-letter';
      span.textContent = letters[i] || '';
      wrapper.appendChild(span);

      var optText = document.createElement('span');
      optText.textContent = opt;
      wrapper.appendChild(optText);

      var optTTS = self._createTTSButton(opt, TOEIC.App.getTrack());
      wrapper.appendChild(optTTS);

      btn.appendChild(wrapper);

      if (answered) {
        btn.disabled = true;
        if (opt === item.answer) btn.classList.add('correct');
        if (opt === prevAnswer.userAnswer && !prevAnswer.isCorrect) btn.classList.add('wrong');
        if (opt === prevAnswer.userAnswer && prevAnswer.isCorrect) btn.classList.add('correct');
      }

      if (!answered) {
        btn.addEventListener('click', function () {
          TOEIC.App.submitPart1Answer(opt);
        });
      }
      opts.appendChild(btn);
    });

    block.appendChild(opts);

    if (answered) {
      var fb = document.createElement('div');
      fb.className = 'feedback ' + (prevAnswer.isCorrect ? 'correct' : 'wrong');
      fb.innerHTML = prevAnswer.isCorrect
        ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
        : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + item.answer;
      var expl = document.createElement('div');
      expl.className = 'explanation';
      expl.textContent = item.explanation;
      fb.appendChild(expl);
      block.appendChild(fb);

      if (TOEIC.QuizEngine.hasNext(session)) {
        var nextBtn = document.createElement('button');
        nextBtn.className = 'home-btn';
        nextBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
        nextBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
        block.appendChild(nextBtn);
      } else {
        var finishBtn = document.createElement('button');
        finishBtn.className = 'home-btn';
        finishBtn.textContent = '\u67E5\u770B\u7D50\u679C';
        finishBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
        block.appendChild(finishBtn);
      }
    }

    app.appendChild(block);
  },

  /* ==================================================================
     Part2 — Question-Response
     ================================================================== */
  renderPart2Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 2', index, total);
    app.appendChild(header);

    var block = document.createElement('div');
    block.className = 'question-block';

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u984C / \u5171 ' + total + ' \u984C';
    block.appendChild(num);

    /* Play button */
    var audioRow = document.createElement('div');
    audioRow.className = 'audio-row';
    var playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '\uD83D\uDD0A \u64AD\u653E\u984C\u76EE';
    playBtn.addEventListener('click', function () {
      TOEIC.TTS.speak(item.audioScript, TOEIC.App.getTrack());
    });
    audioRow.appendChild(playBtn);
    block.appendChild(audioRow);

    /* Script toggle */
    var scriptRow = document.createElement('div');
    scriptRow.className = 'script-toggle-row';
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'script-toggle-btn';
    toggleBtn.textContent = '\u986F\u793A\u6587\u5B57\u7A3F';
    var scriptDiv = document.createElement('div');
    scriptDiv.className = 'audio-script hidden';
    scriptDiv.textContent = item.audioScript || '';
    toggleBtn.addEventListener('click', function () {
      scriptDiv.classList.toggle('hidden');
      toggleBtn.textContent = scriptDiv.classList.contains('hidden') ? '\u986F\u793A\u6587\u5B57\u7A3F' : '\u96B1\u85CF\u6587\u5B57\u7A3F';
    });
    scriptRow.appendChild(toggleBtn);
    scriptRow.appendChild(scriptDiv);
    block.appendChild(scriptRow);

    var prevAnswer = session.answers[session.currentIndex];
    var answered = prevAnswer !== null;

    var self = this;
    var opts = document.createElement('div');
    opts.className = 'options';

    var letters = ['(A) ', '(B) ', '(C) '];
    item.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'option-btn';

      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';

      var span = document.createElement('span');
      span.className = 'option-letter';
      span.textContent = letters[i] || '';
      wrapper.appendChild(span);

      var optText = document.createElement('span');
      optText.textContent = opt;
      wrapper.appendChild(optText);

      var optTTS = self._createTTSButton(opt, TOEIC.App.getTrack());
      wrapper.appendChild(optTTS);

      btn.appendChild(wrapper);

      if (answered) {
        btn.disabled = true;
        if (opt === item.answer) btn.classList.add('correct');
        if (opt === prevAnswer.userAnswer && !prevAnswer.isCorrect) btn.classList.add('wrong');
        if (opt === prevAnswer.userAnswer && prevAnswer.isCorrect) btn.classList.add('correct');
      }

      if (!answered) {
        btn.addEventListener('click', function () {
          TOEIC.App.submitPart2Answer(opt);
        });
      }
      opts.appendChild(btn);
    });

    block.appendChild(opts);

    if (answered) {
      var fb = document.createElement('div');
      fb.className = 'feedback ' + (prevAnswer.isCorrect ? 'correct' : 'wrong');
      fb.innerHTML = prevAnswer.isCorrect
        ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
        : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + item.answer;
      var expl = document.createElement('div');
      expl.className = 'explanation';
      expl.textContent = item.explanation;
      fb.appendChild(expl);
      block.appendChild(fb);

      if (TOEIC.QuizEngine.hasNext(session)) {
        var nextBtn = document.createElement('button');
        nextBtn.className = 'home-btn';
        nextBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
        nextBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
        block.appendChild(nextBtn);
      } else {
        var finishBtn = document.createElement('button');
        finishBtn.className = 'home-btn';
        finishBtn.textContent = '\u67E5\u770B\u7D50\u679C';
        finishBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
        block.appendChild(finishBtn);
      }
    }

    app.appendChild(block);
  },

  /* ==================================================================
     Part3 — Short Conversation
     ================================================================== */
  renderPart3Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 3', index, total);
    app.appendChild(header);

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u7D44 / \u5171 ' + total + ' \u7D44';
    app.appendChild(num);

    var self = this;

    /* Conversation section */
    var convDiv = document.createElement('div');
    convDiv.className = 'listening-group';

    var playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '\uD83D\uDD0A \u64AD\u653E\u5C0D\u8A71';
    playBtn.addEventListener('click', function () {
      TOEIC.Listening.playConversation(item.conversation, TOEIC.App.getTrack());
    });
    convDiv.appendChild(playBtn);

    /* Chart data */
    if (item.chartData) {
      var chartDiv = document.createElement('div');
      chartDiv.className = 'chart-table-container';
      self._renderChartData(chartDiv, item.chartData);
      convDiv.appendChild(chartDiv);
    }

    app.appendChild(convDiv);

    /* Current question */
    var qIndex = TOEIC.QuizEngine.getPart3QuestionIndex(session);
    if (qIndex < item.questions.length) {
      var q = item.questions[qIndex];
      var block = document.createElement('div');
      block.className = 'question-block';

      var qNum = document.createElement('div');
      qNum.className = 'question-number';
      qNum.textContent = '\u554F\u984C ' + (qIndex + 1) + ' / ' + item.questions.length;
      block.appendChild(qNum);

      var row = document.createElement('div');
      row.className = 'question-row';

      var qText = document.createElement('p');
      qText.className = 'question-text';
      qText.textContent = q.question;
      row.appendChild(qText);

      var qTts = self._createTTSButton(q.question, TOEIC.App.getTrack());
      row.appendChild(qTts);
      block.appendChild(row);

      var prevAns = session.answers[session.currentIndex][qIndex];
      var answered = prevAns !== null;

      var opts = document.createElement('div');
      opts.className = 'options';
      var letters = ['(A) ', '(B) ', '(C) ', '(D) '];

      q.options.forEach(function (opt, oi) {
        var btn = document.createElement('button');
        btn.className = 'option-btn';
        if (answered) {
          btn.disabled = true;
          if (opt === q.answer) btn.classList.add('correct');
          if (opt === prevAns.userAnswer && !prevAns.isCorrect) btn.classList.add('wrong');
          if (opt === prevAns.userAnswer && prevAns.isCorrect) btn.classList.add('correct');
        }
        var span = document.createElement('span');
        span.className = 'option-letter';
        span.textContent = letters[oi] || '';
        btn.appendChild(span);
        btn.appendChild(document.createTextNode(opt));

        if (!answered) {
          btn.addEventListener('click', function () {
            TOEIC.App.submitPart3Answer(opt);
          });
        }
        opts.appendChild(btn);
      });

      block.appendChild(opts);

      if (answered) {
        var fb = document.createElement('div');
        fb.className = 'feedback ' + (prevAns.isCorrect ? 'correct' : 'wrong');
        fb.innerHTML = prevAns.isCorrect
          ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
          : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + q.answer;
        var expl = document.createElement('div');
        expl.className = 'explanation';
        expl.textContent = q.explanation;
        fb.appendChild(expl);
        block.appendChild(fb);
      }

      app.appendChild(block);

      if (answered) {
        var allQAnswered = TOEIC.QuizEngine.areAllPart3QuestionsAnswered(session);
        var navRow = document.createElement('div');
        navRow.style.cssText = 'text-align:center;margin-top:1rem;';

        if (!allQAnswered) {
          var nqBtn = document.createElement('button');
          nqBtn.className = 'home-btn';
          nqBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
          nqBtn.addEventListener('click', function () {
            TOEIC.App.nextPart3Question();
          });
          navRow.appendChild(nqBtn);
        } else {
          if (TOEIC.QuizEngine.hasNext(session)) {
            var ngBtn = document.createElement('button');
            ngBtn.className = 'home-btn';
            ngBtn.textContent = '\u4E0B\u4E00\u7D44 \u2192';
            ngBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
            navRow.appendChild(ngBtn);
          } else {
            var fBtn = document.createElement('button');
            fBtn.className = 'home-btn';
            fBtn.textContent = '\u67E5\u770B\u7D50\u679C';
            fBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
            navRow.appendChild(fBtn);
          }
        }
        app.appendChild(navRow);
      }
    }
  },

  /* ==================================================================
     Part4 — Short Talk
     ================================================================== */
  renderPart4Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 4', index, total);
    app.appendChild(header);

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u7D44 / \u5171 ' + total + ' \u7D44';
    app.appendChild(num);

    var self = this;

    /* Talk section */
    var talkDiv = document.createElement('div');
    talkDiv.className = 'listening-group';

    var playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '\uD83D\uDD0A \u64AD\u653E\u7368\u767D';
    playBtn.addEventListener('click', function () {
      TOEIC.Listening.playTalk(item.talk, TOEIC.App.getTrack());
    });
    talkDiv.appendChild(playBtn);

    app.appendChild(talkDiv);

    /* Current question */
    var qIndex = TOEIC.QuizEngine.getPart4QuestionIndex(session);
    if (qIndex < item.questions.length) {
      var q = item.questions[qIndex];
      var block = document.createElement('div');
      block.className = 'question-block';

      var qNum = document.createElement('div');
      qNum.className = 'question-number';
      qNum.textContent = '\u554F\u984C ' + (qIndex + 1) + ' / ' + item.questions.length;
      block.appendChild(qNum);

      var row = document.createElement('div');
      row.className = 'question-row';

      var qText = document.createElement('p');
      qText.className = 'question-text';
      qText.textContent = q.question;
      row.appendChild(qText);

      var qTts = self._createTTSButton(q.question, TOEIC.App.getTrack());
      row.appendChild(qTts);
      block.appendChild(row);

      var prevAns = session.answers[session.currentIndex][qIndex];
      var answered = prevAns !== null;

      var opts = document.createElement('div');
      opts.className = 'options';
      var letters = ['(A) ', '(B) ', '(C) ', '(D) '];

      q.options.forEach(function (opt, oi) {
        var btn = document.createElement('button');
        btn.className = 'option-btn';
        if (answered) {
          btn.disabled = true;
          if (opt === q.answer) btn.classList.add('correct');
          if (opt === prevAns.userAnswer && !prevAns.isCorrect) btn.classList.add('wrong');
          if (opt === prevAns.userAnswer && prevAns.isCorrect) btn.classList.add('correct');
        }
        var span = document.createElement('span');
        span.className = 'option-letter';
        span.textContent = letters[oi] || '';
        btn.appendChild(span);
        btn.appendChild(document.createTextNode(opt));

        if (!answered) {
          btn.addEventListener('click', function () {
            TOEIC.App.submitPart4Answer(opt);
          });
        }
        opts.appendChild(btn);
      });

      block.appendChild(opts);

      if (answered) {
        var fb = document.createElement('div');
        fb.className = 'feedback ' + (prevAns.isCorrect ? 'correct' : 'wrong');
        fb.innerHTML = prevAns.isCorrect
          ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
          : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + q.answer;
        var expl = document.createElement('div');
        expl.className = 'explanation';
        expl.textContent = q.explanation;
        fb.appendChild(expl);
        block.appendChild(fb);
      }

      app.appendChild(block);

      if (answered) {
        var allQAnswered = TOEIC.QuizEngine.areAllPart4QuestionsAnswered(session);
        var navRow = document.createElement('div');
        navRow.style.cssText = 'text-align:center;margin-top:1rem;';

        if (!allQAnswered) {
          var nqBtn = document.createElement('button');
          nqBtn.className = 'home-btn';
          nqBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
          nqBtn.addEventListener('click', function () {
            TOEIC.App.nextPart4Question();
          });
          navRow.appendChild(nqBtn);
        } else {
          if (TOEIC.QuizEngine.hasNext(session)) {
            var ngBtn = document.createElement('button');
            ngBtn.className = 'home-btn';
            ngBtn.textContent = '\u4E0B\u4E00\u7D44 \u2192';
            ngBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
            navRow.appendChild(ngBtn);
          } else {
            var fBtn = document.createElement('button');
            fBtn.className = 'home-btn';
            fBtn.textContent = '\u67E5\u770B\u7D50\u679C';
            fBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
            navRow.appendChild(fBtn);
          }
        }
        app.appendChild(navRow);
      }
    }
  },

  /* ── Chart data renderer ── */
  _renderChartData(container, chartData) {
    if (!chartData) return;
    if (!chartData.rows || chartData.rows.length === 0) return;

    var table = document.createElement('table');
    table.className = 'chart-table';

    if (chartData.headers) {
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      chartData.headers.forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    var tbody = document.createElement('tbody');
    chartData.rows.forEach(function (row) {
      var tr = document.createElement('tr');
      row.forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
  },

  /* ==================================================================
     Part5 / Part6 / Part7 — existing renderers (unchanged)
     ================================================================== */
  renderPart5Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 5', index, total);
    app.appendChild(header);

    var block = document.createElement('div');
    block.className = 'question-block';

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u984C / \u5171 ' + total + ' \u984C';
    block.appendChild(num);

    var row = document.createElement('div');
    row.className = 'question-row';

    var qText = document.createElement('p');
    qText.className = 'question-text';
    qText.textContent = item.question;
    row.appendChild(qText);

    var ttsBtn = this._createTTSButton(item.question, TOEIC.App.getTrack());
    row.appendChild(ttsBtn);
    block.appendChild(row);

    var prevAnswer = session.answers[session.currentIndex];
    var answered = prevAnswer !== null;

    var opts = document.createElement('div');
    opts.className = 'options';

    var letters = ['(A) ', '(B) ', '(C) ', '(D) '];
    item.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'option-btn';
      if (answered) {
        btn.disabled = true;
        if (opt === item.answer) btn.classList.add('correct');
        if (opt === prevAnswer.userAnswer && !prevAnswer.isCorrect) btn.classList.add('wrong');
        if (opt === prevAnswer.userAnswer && prevAnswer.isCorrect) btn.classList.add('correct');
      }
      var span = document.createElement('span');
      span.className = 'option-letter';
      span.textContent = letters[i] || '';
      btn.appendChild(span);
      btn.appendChild(document.createTextNode(opt));

      if (!answered) {
        btn.addEventListener('click', function () {
          TOEIC.App.submitPart5Answer(opt);
        });
      }
      opts.appendChild(btn);
    });

    block.appendChild(opts);

    if (answered) {
      var fb = document.createElement('div');
      fb.className = 'feedback ' + (prevAnswer.isCorrect ? 'correct' : 'wrong');
      fb.innerHTML = prevAnswer.isCorrect
        ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
        : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + item.answer;
      var expl = document.createElement('div');
      expl.className = 'explanation';
      expl.textContent = item.explanation;
      fb.appendChild(expl);
      block.appendChild(fb);

      if (TOEIC.QuizEngine.hasNext(session)) {
        var nextBtn = document.createElement('button');
        nextBtn.className = 'home-btn';
        nextBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
        nextBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
        block.appendChild(nextBtn);
      } else {
        var finishBtn = document.createElement('button');
        finishBtn.className = 'home-btn';
        finishBtn.textContent = '\u67E5\u770B\u7D50\u679C';
        finishBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
        block.appendChild(finishBtn);
      }
    }

    app.appendChild(block);
  },

  renderPart6Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 6', index, total);
    app.appendChild(header);

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u7D44 / \u5171 ' + total + ' \u7D44';
    app.appendChild(num);

    var passageDiv = document.createElement('div');
    passageDiv.className = 'passage';

    var ttsRow = document.createElement('div');
    ttsRow.style.cssText = 'display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.5rem;';

    var pTitle = document.createElement('div');
    pTitle.className = 'passage-title';
    pTitle.textContent = '\u5168\u6587\u8B80\u8B80\u770B';

    var cleanPassage = item.passageTemplate.replace(/\(\d\)\s*_{3,}/g, '______');
    var ttsBtn = this._createTTSButton(cleanPassage, TOEIC.App.getTrack());
    ttsRow.appendChild(pTitle);
    ttsRow.appendChild(ttsBtn);
    passageDiv.appendChild(ttsRow);

    var segments = this._parsePart6Passage(item);
    var self = this;

    segments.forEach(function (seg) {
      if (seg.type === 'text') {
        var span = document.createElement('span');
        span.textContent = seg.text;
        passageDiv.appendChild(span);
      } else if (seg.type === 'blank') {
        var blankNum = seg.blankIndex;
        var blankData = item.blanks ? item.blanks[blankNum] : null;
        var blankState = session.answers[session.currentIndex][blankNum];
        var answered = blankState !== null && blankState !== undefined;

        var widget = document.createElement('span');
        widget.className = 'blank-widget';

        var label = document.createElement('span');
        label.className = 'blank-label';
        label.textContent = '(' + (blankNum + 1) + ') ';
        widget.appendChild(label);

        var optGroup = document.createElement('span');
        optGroup.className = 'blank-options';

        if (blankData) {
          blankData.options.forEach(function (opt) {
            var ob = document.createElement('button');
            ob.className = 'blank-opt';
            ob.textContent = opt;
            if (answered) {
              ob.disabled = true;
              if (opt === blankData.answer) ob.classList.add('correct');
              if (opt === blankState.userAnswer && !blankState.isCorrect) ob.classList.add('wrong');
            } else {
              ob.addEventListener('click', function () {
                TOEIC.App.submitPart6Blank(blankNum, opt);
              });
            }
            optGroup.appendChild(ob);
          });
        }

        widget.appendChild(optGroup);

        if (answered) {
          var icon = document.createElement('span');
          icon.textContent = blankState.isCorrect ? ' \u2713' : ' \u2717';
          icon.style.cssText = blankState.isCorrect ? 'color:#28a745;margin-left:4px;' : 'color:#dc3545;margin-left:4px;';
          widget.appendChild(icon);
        }

        widget.appendChild(document.createTextNode(' '));
        passageDiv.appendChild(widget);
      }
    });

    app.appendChild(passageDiv);

    if (item.blanks) {
      var self2 = this;
      item.blanks.forEach(function (blank, bi) {
        var bs = session.answers[session.currentIndex][bi];
        if (bs !== null && bs !== undefined) {
          var fb = document.createElement('div');
          fb.className = 'feedback ' + (bs.isCorrect ? 'correct' : 'wrong');
          fb.innerHTML = '<strong>(' + (bi + 1) + ')</strong> '
            + (bs.isCorrect ? '\u2713 \u7B54\u5C0D\u4E86!' : '\u2717 \u7B54\u932F\u4E86 \u6B63\u78BA\u7B54\u6848\uFF1A' + blank.answer);
          var expl = document.createElement('div');
          expl.className = 'explanation';
          expl.textContent = blank.explanation;
          fb.appendChild(expl);
          app.appendChild(fb);
        }
      });
    }

    if (TOEIC.QuizEngine.areAllPart6BlanksAnswered(session)) {
      var footer = document.createElement('div');
      footer.className = 'p6-footer';
      if (TOEIC.QuizEngine.hasNext(session)) {
        var nbtn = document.createElement('button');
        nbtn.className = 'home-btn';
        nbtn.textContent = '\u4E0B\u4E00\u7D44 \u2192';
        nbtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
        footer.appendChild(nbtn);
      } else {
        var fbtn = document.createElement('button');
        fbtn.className = 'home-btn';
        fbtn.textContent = '\u67E5\u770B\u7D50\u679C';
        fbtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
        footer.appendChild(fbtn);
      }
      app.appendChild(footer);
    }
  },

  _parsePart6Passage(item) {
    var template = item.passageTemplate || '';
    var segments = [];
    var remaining = template;
    var blankCount = item.blanks ? item.blanks.length : 0;

    for (var b = 0; b < blankCount; b++) {
      var blankNum = b + 1;
      var marker = '(' + blankNum + ')';
      var idx = remaining.indexOf(marker);
      if (idx === -1) continue;

      if (idx > 0) {
        segments.push({ type: 'text', text: remaining.substring(0, idx) });
      }

      var endIdx = idx + marker.length;
      var after = remaining.substring(endIdx);
      var underMatch = after.match(/^[\s_]+/);
      if (underMatch) endIdx += underMatch[0].length;

      segments.push({ type: 'blank', blankIndex: b });
      remaining = remaining.substring(endIdx);
    }

    if (remaining.length > 0) {
      segments.push({ type: 'text', text: remaining });
    }

    return segments;
  },

  renderPart7Question(item, index, total, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var header = this._createQuizHeader('Part 7', index, total);
    app.appendChild(header);

    var num = document.createElement('div');
    num.className = 'question-number';
    num.textContent = '\u7B2C ' + (index + 1) + ' \u7D44 / \u5171 ' + total + ' \u7D44';
    app.appendChild(num);

    var docsContainer = document.createElement('div');
    docsContainer.className = 'documents-container';

    var self = this;
    item.documents.forEach(function (doc) {
      var docDiv = document.createElement('div');
      docDiv.className = 'document';

      var docHeader = document.createElement('div');
      docHeader.className = 'doc-header';

      var docTitle = document.createElement('h3');
      docTitle.textContent = doc.title || '';
      docHeader.appendChild(docTitle);

      var ttsBtn = self._createTTSButton(doc.body, TOEIC.App.getTrack());
      docHeader.appendChild(ttsBtn);
      docDiv.appendChild(docHeader);

      var body = document.createElement('div');
      body.className = 'document-body';
      body.textContent = doc.body;
      docDiv.appendChild(body);

      docsContainer.appendChild(docDiv);
    });

    app.appendChild(docsContainer);

    var qIndex = TOEIC.QuizEngine.getPart7QuestionIndex(session);
    if (qIndex < item.questions.length) {
      var q = item.questions[qIndex];
      var block = document.createElement('div');
      block.className = 'question-block';

      var qNum = document.createElement('div');
      qNum.className = 'question-number';
      qNum.textContent = '\u554F\u984C ' + (qIndex + 1) + ' / ' + item.questions.length;
      block.appendChild(qNum);

      var row = document.createElement('div');
      row.className = 'question-row';

      var qText = document.createElement('p');
      qText.className = 'question-text';
      qText.textContent = q.question;
      row.appendChild(qText);

      var qTts = self._createTTSButton(q.question, TOEIC.App.getTrack());
      row.appendChild(qTts);
      block.appendChild(row);

      var prevAns = session.answers[session.currentIndex][qIndex];
      var answered = prevAns !== null;

      var opts = document.createElement('div');
      opts.className = 'options';
      var letters = ['(A) ', '(B) ', '(C) ', '(D) '];

      q.options.forEach(function (opt, oi) {
        var btn = document.createElement('button');
        btn.className = 'option-btn';
        if (answered) {
          btn.disabled = true;
          if (opt === q.answer) btn.classList.add('correct');
          if (opt === prevAns.userAnswer && !prevAns.isCorrect) btn.classList.add('wrong');
          if (opt === prevAns.userAnswer && prevAns.isCorrect) btn.classList.add('correct');
        }
        var span = document.createElement('span');
        span.className = 'option-letter';
        span.textContent = letters[oi] || '';
        btn.appendChild(span);
        btn.appendChild(document.createTextNode(opt));

        if (!answered) {
          btn.addEventListener('click', function () {
            TOEIC.App.submitPart7Answer(opt);
          });
        }
        opts.appendChild(btn);
      });

      block.appendChild(opts);

      if (answered) {
        var fb = document.createElement('div');
        fb.className = 'feedback ' + (prevAns.isCorrect ? 'correct' : 'wrong');
        fb.innerHTML = prevAns.isCorrect
          ? '<strong>\u2713 \u7B54\u5C0D\u4E86!</strong>'
          : '<strong>\u2717 \u7B54\u932F\u4E86</strong> \u6B63\u78BA\u7B54\u6848\uFF1A' + q.answer;
        var expl = document.createElement('div');
        expl.className = 'explanation';
        expl.textContent = q.explanation;
        fb.appendChild(expl);
        block.appendChild(fb);
      }

      app.appendChild(block);

      var self2 = this;

      if (answered) {
        var allQAnswered = TOEIC.QuizEngine.areAllPart7QuestionsAnswered(session);
        var navRow = document.createElement('div');
        navRow.style.cssText = 'text-align:center;margin-top:1rem;';

        if (!allQAnswered) {
          var nqBtn = document.createElement('button');
          nqBtn.className = 'home-btn';
          nqBtn.textContent = '\u4E0B\u4E00\u984C \u2192';
          nqBtn.addEventListener('click', function () {
            TOEIC.App.nextPart7Question();
          });
          navRow.appendChild(nqBtn);
        } else {
          if (TOEIC.QuizEngine.hasNext(session)) {
            var ngBtn = document.createElement('button');
            ngBtn.className = 'home-btn';
            ngBtn.textContent = '\u4E0B\u4E00\u7D44 \u2192';
            ngBtn.addEventListener('click', function () { TOEIC.App.nextQuestion(); });
            navRow.appendChild(ngBtn);
          } else {
            var fBtn = document.createElement('button');
            fBtn.className = 'home-btn';
            fBtn.textContent = '\u67E5\u770B\u7D50\u679C';
            fBtn.addEventListener('click', function () { TOEIC.App.finishPractice(); });
            navRow.appendChild(fBtn);
          }
        }
        app.appendChild(navRow);
      }
    }
  },

  /* ── Single-part Results ── */
  renderResults(results, part, questionCount) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var c = document.createElement('div');
    c.className = 'result-container';

    var pLabel = document.createElement('div');
    pLabel.className = 'result-label';
    pLabel.textContent = 'Part ' + part + ' \u7DF4\u7FD2\u7D50\u679C';
    c.appendChild(pLabel);

    var score = document.createElement('div');
    score.className = 'result-score';
    score.textContent = results.correct + ' / ' + results.total;
    c.appendChild(score);

    var pct = document.createElement('div');
    pct.className = 'result-percent';
    pct.textContent = '\u6B63\u78BA\u7387 ' + results.accuracy + '%';
    c.appendChild(pct);

    var detail = document.createElement('div');
    detail.className = 'result-detail';

    results.details.forEach(function (d) {
      var item = document.createElement('div');
      item.className = 'result-item';

      var icon = document.createElement('span');
      icon.className = 'status-icon';
      icon.textContent = d.isCorrect ? '\u2713' : '\u2717';
      icon.style.color = d.isCorrect ? '#28a745' : '#dc3545';
      item.appendChild(icon);

      var text = document.createElement('div');
      text.className = 'item-text';
      var qDisplay = d.question || '';
      text.textContent = qDisplay.length > 60 ? qDisplay.substring(0, 60) + '...' : qDisplay;
      item.appendChild(text);

      var ans = document.createElement('div');
      ans.className = 'item-answer';
      ans.textContent = d.isCorrect ? '' : '\u4F60\u7684\u7B54\u6848\uFF1A' + d.userAnswer + ' | \u6B63\u78BA\uFF1A' + d.correctAnswer;
      item.appendChild(ans);

      detail.appendChild(item);
    });

    c.appendChild(detail);

    var homeBtn = document.createElement('button');
    homeBtn.className = 'home-btn';
    homeBtn.textContent = '\u8FD4\u56DE\u9996\u9801';
    homeBtn.addEventListener('click', function () { TOEIC.App.goHome(); });
    c.appendChild(homeBtn);

    app.appendChild(c);
  },

  /* ── Composite Results ── */
  renderCompositeResults(results, session) {
    var app = this._clear();
    app.appendChild(this._renderBackButton());

    var c = document.createElement('div');
    c.className = 'result-container';

    var pLabel = document.createElement('div');
    pLabel.className = 'result-label';
    pLabel.textContent = '\u7D9C\u5408\u7DF4\u7FD2\u7D50\u679C (\u5168\u771F\u6A21\u6A21\u8A66)';
    c.appendChild(pLabel);

    var score = document.createElement('div');
    score.className = 'result-score';
    score.textContent = results.correct + ' / ' + results.total;
    c.appendChild(score);

    var pct = document.createElement('div');
    pct.className = 'result-percent';
    pct.textContent = '\u6B63\u78BA\u7387 ' + results.accuracy + '%';
    c.appendChild(pct);

    /* Per-part breakdown */
    var partSummary = document.createElement('div');
    partSummary.className = 'composite-summary';

    var partOrder = results.partOrder || [1, 2, 3, 4, 5, 6, 7];
    var self = this;
    partOrder.forEach(function (p) {
      var pp = results.perPart[p];
      if (!pp || pp.total === 0) return;
      var row = document.createElement('div');
      row.className = 'per-part-result';
      row.innerHTML = '<span class="per-part-label">Part ' + p + '</span>'
        + '<span class="per-part-score">' + pp.correct + ' / ' + pp.total + '</span>'
        + '<span class="per-part-pct">' + (pp.total > 0 ? Math.round(pp.correct / pp.total * 100) : 0) + '%</span>';
      partSummary.appendChild(row);
    });

    c.appendChild(partSummary);

    /* Detail list */
    var detail = document.createElement('div');
    detail.className = 'result-detail';

    results.details.forEach(function (d) {
      var item = document.createElement('div');
      item.className = 'result-item';

      var icon = document.createElement('span');
      icon.className = 'status-icon';
      icon.textContent = d.isCorrect ? '\u2713' : '\u2717';
      icon.style.color = d.isCorrect ? '#28a745' : '#dc3545';
      item.appendChild(icon);

      var text = document.createElement('div');
      text.className = 'item-text';
      var partTag = '[P' + (d.part || '?') + '] ';
      var qDisplay = d.question || '';
      text.textContent = partTag + (qDisplay.length > 60 ? qDisplay.substring(0, 60) + '...' : qDisplay);
      item.appendChild(text);

      var ans = document.createElement('div');
      ans.className = 'item-answer';
      ans.textContent = d.isCorrect ? '' : '\u4F60\u7684\u7B54\u6848\uFF1A' + d.userAnswer + ' | \u6B63\u78BA\uFF1A' + d.correctAnswer;
      item.appendChild(ans);

      detail.appendChild(item);
    });

    c.appendChild(detail);

    var homeBtn = document.createElement('button');
    homeBtn.className = 'home-btn';
    homeBtn.textContent = '\u8FD4\u56DE\u9996\u9801';
    homeBtn.addEventListener('click', function () { TOEIC.App.goHome(); });
    c.appendChild(homeBtn);

    app.appendChild(c);
  },

  /* ==================================================================
     Wrong Book — delegated to TOEIC.WrongBook
     ================================================================== */
  renderWrongBookHome() {
    TOEIC.WrongBook.render();
  },

  /* ── Helpers ── */
  _createQuizHeader(title, index, total) {
    var header = document.createElement('div');
    header.className = 'quiz-header';
    var left = document.createElement('div');
    left.className = 'quiz-header-left';
    var p = document.createElement('span');
    p.className = 'quiz-progress';
    p.textContent = title + ' \u00B7 ' + (index + 1) + ' / ' + total;
    left.appendChild(p);
    header.appendChild(left);
    var track = TOEIC.App ? TOEIC.App.getTrack() : 'T600';
    var badge = document.createElement('span');
    badge.className = 'track-badge quiz-track-badge';
    badge.textContent = '\u76EE\u6A19\uFF1A' + track;
    header.appendChild(badge);
    return header;
  },

  /* ── Count Dialog ── */
  showCountDialog(part, onConfirm) {
    var overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    var box = document.createElement('div');
    box.className = 'dialog-box';

    var h3 = document.createElement('h3');
    h3.textContent = '\u8ACB\u8F38\u5165\u7DF4\u7FD2\u984C\u6578';
    box.appendChild(h3);

    var p = document.createElement('p');
    p.textContent = '\u9810\u8A2D 10 \u984C\uFF0C\u4E0D\u53EF\u8D85\u904E\u984C\u5EAB\u7E3D\u6578\u3002';
    box.appendChild(p);

    var input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = 100;
    input.value = '10';
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') confirm();
    });
    box.appendChild(input);

    var actions = document.createElement('div');
    actions.className = 'dialog-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '\u53D6\u6D88';
    cancelBtn.addEventListener('click', function () {
      overlay.remove();
    });
    actions.appendChild(cancelBtn);

    var okBtn = document.createElement('button');
    okBtn.className = 'primary';
    okBtn.textContent = '\u958B\u59CB\u7DF4\u7FD2';
    okBtn.addEventListener('click', function () {
      var val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) val = 10;
      overlay.remove();
      onConfirm(val);
    });
    actions.appendChild(okBtn);

    box.appendChild(actions);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
    setTimeout(function () { input.focus(); }, 50);
  }
};
