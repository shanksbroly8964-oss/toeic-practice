window.TOEIC = window.TOEIC || {};

TOEIC.WrongBook = {
  _currentPartFilter: 'all',
  _currentCategoryFilter: 'all',

  render: function () {
    var app = document.getElementById('app');
    app.innerHTML = '';
    var self = this;

    app.appendChild(self._renderBackBtn());

    var title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = '\u932F\u984C\u672C';
    app.appendChild(title);

    var wrongItems = TOEIC.Storage.getWrongItems();

    if (wrongItems.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-wrongbook';
      var p = document.createElement('p');
      p.textContent = '\u76EE\u524D\u6C92\u6709\u932F\u984C\uFF0C\u7E7C\u7E8C\u4FDD\u6301\uFF01';
      empty.appendChild(p);
      app.appendChild(empty);
      return;
    }

    /* Collect unique categories for filter */
    var allCategories = [];
    wrongItems.forEach(function (w) {
      var cat = w.category || '';
      if (cat && allCategories.indexOf(cat) === -1) allCategories.push(cat);
    });
    allCategories.sort();

    /* Filter Row */
    var filterRow = document.createElement('div');
    filterRow.className = 'wrongbook-filter';

    var filterLabel1 = document.createElement('label');
    filterLabel1.textContent = '\u7BE9\u9078 Part: ';
    filterRow.appendChild(filterLabel1);
    var selectPart = document.createElement('select');
    selectPart.className = 'filter-select';
    selectPart.innerHTML = '<option value="all">\u5168\u90E8</option>'
      + '<option value="1">Part 1</option>'
      + '<option value="2">Part 2</option>'
      + '<option value="3">Part 3</option>'
      + '<option value="4">Part 4</option>'
      + '<option value="5">Part 5</option>'
      + '<option value="6">Part 6</option>'
      + '<option value="7">Part 7</option>';
    selectPart.addEventListener('change', function () {
      self._currentPartFilter = selectPart.value;
      self.render();
    });
    if (self._currentPartFilter !== 'all') {
      selectPart.value = self._currentPartFilter;
    }
    filterRow.appendChild(selectPart);

    if (allCategories.length > 0) {
      var filterLabel2 = document.createElement('label');
      filterLabel2.textContent = ' \u7BE9\u9078\u5206\u985E: ';
      filterRow.appendChild(filterLabel2);
      var selectCat = document.createElement('select');
      selectCat.className = 'filter-select';
      var catOpts = '<option value="all">\u5168\u90E8</option>';
      allCategories.forEach(function (cat) {
        catOpts += '<option value="' + cat + '">' + cat + '</option>';
      });
      selectCat.innerHTML = catOpts;
      selectCat.addEventListener('change', function () {
        self._currentCategoryFilter = selectCat.value;
        self.render();
      });
      if (self._currentCategoryFilter !== 'all') {
        selectCat.value = self._currentCategoryFilter;
      }
      filterRow.appendChild(selectCat);
    }

    app.appendChild(filterRow);

    /* Filter items */
    var filtered = wrongItems;
    if (self._currentPartFilter !== 'all') {
      var filterPart = parseInt(self._currentPartFilter, 10);
      filtered = filtered.filter(function (w) { return w.part === filterPart; });
    }
    if (self._currentCategoryFilter !== 'all') {
      var filterCat = self._currentCategoryFilter;
      filtered = filtered.filter(function (w) {
        return (w.category || '') === filterCat || (!w.category && filterCat === '\u672A\u5206\u985E');
      });
    }

    if (filtered.length === 0) {
      var emptyF = document.createElement('div');
      emptyF.className = 'empty-wrongbook';
      emptyF.innerHTML = '<p>\u8A72\u7BE9\u9078\u689D\u4EF6\u4E0B\u6C92\u6709\u932F\u984C\u3002</p>';
      app.appendChild(emptyF);
      return;
    }

    /* List items */
    var list = document.createElement('div');
    list.className = 'wrongbook-list';

    filtered.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'wrong-item';

      var header = document.createElement('div');
      header.className = 'wrong-item-header';
      var partSpan = document.createElement('span');
      partSpan.className = 'wrong-part';
      partSpan.textContent = 'Part ' + item.part;
      header.appendChild(partSpan);

      var catDisplay = item.category || '\u672A\u5206\u985E';
      var catSpan = document.createElement('span');
      catSpan.className = 'wrong-category';
      catSpan.textContent = catDisplay;
      header.appendChild(catSpan);

      var dateSpan = document.createElement('span');
      dateSpan.className = 'wrong-date';
      dateSpan.textContent = new Date(item.timestamp).toLocaleDateString();
      header.appendChild(dateSpan);
      card.appendChild(header);

      var qText = document.createElement('div');
      qText.className = 'wrong-question';
      qText.textContent = item.question || '';
      card.appendChild(qText);

      var ansRow = document.createElement('div');
      ansRow.className = 'wrong-answer-row';
      var userSpan = document.createElement('span');
      userSpan.className = 'wrong-user-ans';
      userSpan.textContent = '\u4F60\u7684\u7B54\u6848: ' + item.userAnswer;
      ansRow.appendChild(userSpan);
      var correctSpan = document.createElement('span');
      correctSpan.className = 'wrong-correct-ans';
      correctSpan.textContent = '\u6B63\u78BA: ' + item.correctAnswer;
      ansRow.appendChild(correctSpan);
      card.appendChild(ansRow);

      if (item.explanation) {
        var expl = document.createElement('div');
        expl.className = 'wrong-explanation';
        expl.textContent = item.explanation;
        card.appendChild(expl);
      }

      var reBtn = document.createElement('button');
      reBtn.className = 'home-btn';
      reBtn.textContent = '\u91CD\u65B0\u4F5C\u7B54';
      reBtn.addEventListener('click', function () {
        self._reAnswer(item);
      });
      card.appendChild(reBtn);

      list.appendChild(card);
    });

    app.appendChild(list);
  },

  _reAnswer: function (wrongItem) {
    var self = this;
    var mockItem = {
      id: wrongItem.questionId,
      part: wrongItem.part,
      answer: wrongItem.correctAnswer,
      explanation: wrongItem.explanation
    };

    if (wrongItem.part === 1) {
      mockItem.imageDescription = wrongItem.question || '';
    } else if (wrongItem.part === 2) {
      mockItem.audioScript = wrongItem.question || '';
    } else {
      mockItem.question = wrongItem.question || '';
    }

    mockItem.options = wrongItem.options || [wrongItem.correctAnswer];

    if (wrongItem.part === 3 || wrongItem.part === 4 || wrongItem.part === 7) {
      mockItem.questions = [{
        id: wrongItem.questionId,
        question: wrongItem.question,
        options: wrongItem.options || [wrongItem.correctAnswer],
        answer: wrongItem.correctAnswer,
        explanation: wrongItem.explanation
      }];
    }
    if (wrongItem.part === 3) { mockItem.conversation = []; }
    if (wrongItem.part === 4) { mockItem.talk = ''; }
    if (wrongItem.part === 7) { mockItem.documents = [{ title: '', body: '' }]; }

    if (wrongItem.part === 6) {
      mockItem.passageTemplate = '(1)___';
      mockItem.blanks = [{
        index: 1,
        question: wrongItem.question,
        options: wrongItem.options || [wrongItem.correctAnswer],
        answer: wrongItem.correctAnswer,
        explanation: wrongItem.explanation
      }];
    }

    /* Check if correct answer is in options; if not, add it */
    var hasCorrect = false;
    (mockItem.options || []).forEach(function (o) {
      if (o === wrongItem.correctAnswer) hasCorrect = true;
    });
    if (!hasCorrect && mockItem.options) {
      mockItem.options.push(wrongItem.correctAnswer);
    }

    var miniSession = TOEIC.QuizEngine.createSession([mockItem], 1, wrongItem.track);
    miniSession._wrongBookContext = true;

    /* Override finish to return to wrong book */
    var origGoHome = TOEIC.App.goHome;
    TOEIC.App.goHome = function () {
      TOEIC.App.goHome = origGoHome;
      self.render();
    };

    TOEIC.App._session = miniSession;
    TOEIC.App._renderCurrentQuestion();
  },

  _renderBackBtn: function () {
    var btn = document.createElement('button');
    btn.className = 'back-link';
    btn.innerHTML = '\u2190 \u8FD4\u56DE\u9996\u9801';
    btn.addEventListener('click', function () { TOEIC.App.goHome(); });
    return btn;
  }
};
