window.TOEIC = window.TOEIC || {};

TOEIC.Analytics = {
  _SUGGESTIONS: {
    '人物動作': {
      text: '人物動作辨識是你目前的弱項。建議加強觀察照片中人物的手部動作、姿勢與方向，特別注意進行式（be + V-ing）的描述方式，再到 Part 1 集中練習。'
    },
    '物品狀態': {
      text: '物品狀態描述需要更多練習。留意照片中物品的位置關係與被動語態（is placed、are arranged），熟悉常見物品名詞與方位介系詞，再到 Part 1 強化。'
    },
    '場景位置': {
      text: '場景位置判斷是你的失分重點。練習快速辨識照片中的場所特徵（辦公室、街道、餐廳等），掌握 There is/are 句型與方位描述，再到 Part 1 練習。'
    },
    'YesNo問句': {
      text: 'Yes/No 問句的回應判斷需要加強。注意助動詞（Do/Does/Did/Will/Can）與回答的一致性，避免被相似發音的選項誤導，再到 Part 2 集中訓練。'
    },
    'WH問句': {
      text: 'WH 問句理解是你的主要弱項。務必在第一時間抓住疑問詞（Who/What/When/Where/Why/How），再聽取關鍵資訊對應正確選項，再到 Part 2 大量練習。'
    },
    '附加間接問句': {
      text: '附加問句與間接問句的回應判斷需要更多練習。重點在於辨識說話者的語氣與附加問句的隱含意圖，區分真實疑問與確認語氣，再到 Part 2 加強。'
    },
    '陳述句回應': {
      text: '陳述句的回應邏輯需要強化。聽到陳述句時，快速判斷該情境下的合理回應（同意、驚訝、建議、道歉等），避免選到不相關的選項，再到 Part 2 練習。'
    },
    '音似干擾': {
      text: '音似干擾是你的主要陷阱。題目中常出現發音相近但意義不同的詞彙做為干擾選項，建議逐字比對選項與聽到的內容，避免憑第一印象作答，再到 Part 2 訓練。'
    },
    '主旨': {
      text: '主旨題的判斷需要更多練習。練習在第一遍聆聽時就抓出對話或獨白的核心目的，不要被細節分散注意力，注意開頭句與結尾句的線索，再到對應 Part 精練。'
    },
    '細節': {
      text: '細節資訊的擷取需要加強。訓練在聽力過程中邊聽邊記關鍵資訊（人名、時間、數字、地點），善用圖表輔助資訊，注意同義改寫的陷阱，再到對應 Part 練習。'
    },
    '推論意圖': {
      text: '推論與意圖判斷是你的失分重點。這類題目需要整合上下文資訊推斷說話者的目的、態度或下一步行動，不能只靠字面意思作答，再到 Part 3 集中練習。'
    },
    '圖表整合': {
      text: '圖表整合題型需要特別加強。練習同時處理聽力內容與視覺圖表資訊，注意數字比對、趨勢描述與圖表中的關鍵數據，再到 Part 3 針對圖表題練習。'
    },
    '推論': {
      text: '推論題是你的弱項。需要從文章提供的線索中進行合理推斷，而非直接尋找原文資訊。注意作者的語氣、用詞選擇與前後文暗示，再到對應 Part 精練。'
    },
    '數字時間': {
      text: '數字與時間資訊的掌握需要加強。訓練在第一遍聆聽時快速記錄所有數字、日期、時間與價格，注意數字間的關係與計算需求，再到 Part 4 集中訓練。'
    },
    '時態': {
      text: '動詞時態是你目前的主要失分點。建議先複習現在完成式與過去式的使用時機，並注意句中的時間副詞線索（yesterday、since、by the time…），再到 Part 5 集中練習。'
    },
    '片語動詞': {
      text: '片語動詞的掌握需要加強。同一個動詞搭配不同介系詞意義完全不同（如 take off / take over / take up），建議建立常見片語動詞清單逐一記憶，再到 Part 5 練習。'
    },
    '搭配詞': {
      text: '搭配詞是你的弱項。英文中有許多習慣搭配（如 make a decision、take a break），無法靠文法規則推斷，建議多閱讀商業文章累積搭配詞感，再到 Part 5 加強。'
    },
    '近義字彙': {
      text: '近義字彙辨析需要特別加強。許多單字看似同義但在特定語境下用法不同（如 raise vs. rise、affect vs. effect），建議搭配例句記憶單字用法，再到 Part 5 集中訓練。'
    },
    '介系詞': {
      text: '介系詞使用是你的失分重點。介系詞在 TOEIC 中出現頻率極高，需掌握時間（in/on/at）、地點、方向與固定搭配（interested in、depend on）的用法，再到 Part 5 大量練習。'
    },
    '假設語氣': {
      text: '假設語氣需要系統性複習。重點在於區分與現在事實相反（If + 過去式, would + V）和與過去事實相反（If + had pp, would have pp）的句型結構，再到 Part 5 練習。'
    },
    '詞性': {
      text: '詞性判斷是你的主要弱項。TOEIC 常考同一字根的不同詞性變化（如 compete / competition / competitive），建議先判斷空格前後文法需求再選答案，再到 Part 5 集中練習。'
    },
    '連接詞': {
      text: '連接詞的選用需要加強。注意區分對等連接詞（and/but/or）、從屬連接詞（because/although/if）與連接副詞（however/therefore/moreover）的用法與標點規則，再到 Part 5 練習。'
    },
    '關係代名詞': {
      text: '關係代名詞的選用是你的弱項。重點在於判斷先行詞是人（who/whom/whose）還是物（which/that），以及限定用法與非限定用法的區別，再到 Part 5 集中練習。'
    },
    '上下文邏輯': {
      text: '上下文邏輯判斷需要更多練習。Part 6 的填空必須考量前後文的邏輯連貫性，而非只看該句文法。注意轉折詞、因果關係與代名詞指涉，再到 Part 6 加強。'
    },
    '句子插入': {
      text: '句子插入題型是你的弱項。練習先閱讀待插入句子的內容，再到段落中尋找最適合的銜接點，注意前後文的邏輯關聯與代名詞對應，再到 Part 6 集中訓練。'
    },
    '跨篇比對': {
      text: '跨篇比對題型需要特別加強。雙篇或三篇文章的題目需要整合不同來源的資訊進行比對，建議先讀題目再分別鎖定各篇文章的關鍵段落，再到 Part 7 練習。'
    },
    '字義': {
      text: '字義判斷題是你的弱項。文章中出現的生字需根據上下文推斷含義，注意前後的同位語、解釋句、對比或因果關係來輔助猜測字義，再到 Part 7 集中練習。'
    }
  },

  _STATS_KEY: 'toeic_stats',
  _HISTORY_KEY: 'toeic_history',

  recordAttempt: function (part, category, isCorrect) {
    var stats = this._loadStats();
    var key = part + '|' + (category || '未分類');
    if (!stats[key]) {
      stats[key] = { attempts: 0, wrong: 0 };
    }
    stats[key].attempts++;
    if (!isCorrect) {
      stats[key].wrong++;
    }
    this._saveStats(stats);
  },

  recordSession: function (date, mode, track, total, correct) {
    var history = this._loadHistory();
    history.push({
      date: date,
      mode: mode,
      track: track,
      total: total,
      correct: correct
    });
    if (history.length > 200) {
      history = history.slice(history.length - 200);
    }
    localStorage.setItem(this._HISTORY_KEY, JSON.stringify(history));
  },

  getStats: function () {
    return this._loadStats();
  },

  getHistory: function () {
    return this._loadHistory();
  },

  getTotalAttempts: function () {
    var stats = this._loadStats();
    var total = 0;
    Object.keys(stats).forEach(function (k) {
      total += stats[k].attempts;
    });
    return total;
  },

  _loadStats: function () {
    try {
      return JSON.parse(localStorage.getItem(this._STATS_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  _saveStats: function (stats) {
    localStorage.setItem(this._STATS_KEY, JSON.stringify(stats));
  },

  _loadHistory: function () {
    try {
      return JSON.parse(localStorage.getItem(this._HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  _getCategoryDisplay: function (category) {
    return category || '未分類';
  },

  _groupByPart: function (stats) {
    var parts = {};
    Object.keys(stats).forEach(function (k) {
      var parts2 = k.split('|');
      var part = parseInt(parts2[0], 10);
      if (!parts[part]) {
        parts[part] = { attempts: 0, wrong: 0 };
      }
      parts[part].attempts += stats[k].attempts;
      parts[part].wrong += stats[k].wrong;
    });
    return parts;
  },

  _groupByCategory: function (stats) {
    var cats = {};
    Object.keys(stats).forEach(function (k) {
      var parts2 = k.split('|');
      var cat = parts2[1] || '未分類';
      if (!cats[cat]) {
        cats[cat] = { attempts: 0, wrong: 0 };
      }
      cats[cat].attempts += stats[k].attempts;
      cats[cat].wrong += stats[k].wrong;
    });
    return cats;
  },

  getTopWeakest: function (minAttempts, limit) {
    minAttempts = minAttempts || 3;
    limit = limit || 3;
    var cats = this._groupByCategory(this._loadStats());
    var list = [];
    Object.keys(cats).forEach(function (cat) {
      var c = cats[cat];
      if (c.attempts >= minAttempts) {
        list.push({
          category: cat,
          attempts: c.attempts,
          wrong: c.wrong,
          errorRate: Math.round(c.wrong / c.attempts * 100)
        });
      }
    });
    list.sort(function (a, b) { return b.errorRate - a.errorRate; });
    return list.slice(0, limit);
  },

  getSuggestion: function (category) {
    return this._SUGGESTIONS[category] || null;
  },

  /* ── Render Analytics Page ── */
  render: function () {
    var app = document.getElementById('app');
    app.innerHTML = '';
    var self = this;

    app.appendChild(this._renderBackBtn());

    var title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = '弱點分析';
    app.appendChild(title);

    var totalAttempts = this.getTotalAttempts();

    if (totalAttempts < 10) {
      var insufficient = document.createElement('div');
      insufficient.className = 'analytics-insufficient';
      insufficient.innerHTML = '<p>累積更多練習記錄後，這裡會顯示你的弱點分析。</p>'
        + '<p>目前總作答數：' + totalAttempts + ' 題（需達 10 題以上）</p>';
      app.appendChild(insufficient);
      return;
    }

    /* ── Chart 1: By Part ── */
    var chartSection1 = document.createElement('div');
    chartSection1.className = 'analytics-section';

    var chartTitle1 = document.createElement('h3');
    chartTitle1.className = 'analytics-chart-title';
    chartTitle1.textContent = '各 Part 作答分析';
    chartSection1.appendChild(chartTitle1);

    var partData = this._groupByPart(this._loadStats());
    chartSection1.appendChild(this._renderBarChartPart(partData));

    app.appendChild(chartSection1);

    /* ── Chart 2: By Category ── */
    var chartSection2 = document.createElement('div');
    chartSection2.className = 'analytics-section';

    var chartTitle2 = document.createElement('h3');
    chartTitle2.className = 'analytics-chart-title';
    chartTitle2.textContent = '各分類錯誤率排行（作答 ≥3 題才列入）';
    chartSection2.appendChild(chartTitle2);

    var catData = this._groupByCategory(this._loadStats());
    chartSection2.appendChild(this._renderBarChartCategory(catData));

    app.appendChild(chartSection2);

    /* ── Top 3 Weakest ── */
    var top3 = this.getTopWeakest(3, 3);
    if (top3.length > 0) {
      var topSection = document.createElement('div');
      topSection.className = 'analytics-section';

      var topTitle = document.createElement('h3');
      topTitle.className = 'analytics-chart-title';
      topTitle.textContent = '最需加強前 ' + top3.length + ' 名';
      topSection.appendChild(topTitle);

      top3.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'analytics-weak-card';

        var cardHeader = document.createElement('div');
        cardHeader.className = 'analytics-weak-header';
        var name = document.createElement('span');
        name.className = 'analytics-weak-name';
        name.textContent = item.category;
        cardHeader.appendChild(name);
        var rate = document.createElement('span');
        rate.className = 'analytics-weak-rate';
        rate.textContent = '錯誤率 ' + item.errorRate + '% （' + item.wrong + '/' + item.attempts + '）';
        cardHeader.appendChild(rate);
        card.appendChild(cardHeader);

        var suggestion = self.getSuggestion(item.category);
        if (suggestion) {
          var isPriority = item.errorRate >= 40 && item.attempts >= 5;
          var badge = document.createElement('span');
          badge.className = 'analytics-suggestion-badge ' + (isPriority ? 'priority' : 'review');
          badge.textContent = isPriority ? '優先加強' : '建議複習';
          card.appendChild(badge);

          var sugText = document.createElement('p');
          sugText.className = 'analytics-suggestion-text';
          sugText.textContent = suggestion.text;
          card.appendChild(sugText);

          var goBtn = document.createElement('button');
          goBtn.className = 'home-btn analytics-go-btn';
          goBtn.textContent = '前往練習';
          goBtn.addEventListener('click', function () {
            self._goToPartForCategory(item.category);
          });
          card.appendChild(goBtn);
        }

        topSection.appendChild(card);
      });

      app.appendChild(topSection);
    }

    /* ── All Category Suggestions ── */
    var allSection = document.createElement('div');
    allSection.className = 'analytics-section';

    var allTitle = document.createElement('h3');
    allTitle.className = 'analytics-chart-title';
    allTitle.textContent = '改進建議總覽';
    allSection.appendChild(allTitle);

    // Only show suggestions for categories where user has data AND meets threshold
    var allCats = this._groupByCategory(this._loadStats());
    var displayedAny = false;

    Object.keys(self._SUGGESTIONS).forEach(function (cat) {
      var catStat = allCats[cat];
      var attempts = catStat ? catStat.attempts : 0;
      var wrong = catStat ? catStat.wrong : 0;
      var rate = attempts > 0 ? Math.round(wrong / attempts * 100) : 0;

      var level = null;
      if (attempts >= 5 && rate >= 40) level = 'priority';
      else if (attempts >= 5 && rate >= 25) level = 'review';
      else return;

      displayedAny = true;

      var card = document.createElement('div');
      card.className = 'analytics-suggestion-item';

      var cardH = document.createElement('div');
      cardH.className = 'analytics-suggestion-header';

      var nm = document.createElement('span');
      nm.className = 'analytics-suggestion-name';
      nm.textContent = cat;
      cardH.appendChild(nm);

      var bd = document.createElement('span');
      bd.className = 'analytics-suggestion-badge ' + level;
      bd.textContent = level === 'priority' ? '優先加強' : '建議複習';
      cardH.appendChild(bd);

      var rt = document.createElement('span');
      rt.className = 'analytics-suggestion-rate';
      rt.textContent = '錯誤率 ' + rate + '%（' + attempts + ' 題）';
      cardH.appendChild(rt);

      card.appendChild(cardH);

      var txt = document.createElement('p');
      txt.className = 'analytics-suggestion-text';
      txt.textContent = self._SUGGESTIONS[cat].text;
      card.appendChild(txt);

      var btn = document.createElement('button');
      btn.className = 'home-btn analytics-go-btn';
      btn.textContent = '前往練習';
      btn.addEventListener('click', function () {
        self._goToPartForCategory(cat);
      });
      card.appendChild(btn);

      allSection.appendChild(card);
    });

    if (!displayedAny) {
      var nd = document.createElement('p');
      nd.style.cssText = 'color:#6c757d;font-size:0.9rem;text-align:center;padding:1rem;';
      nd.textContent = '目前尚無分類達到建議門檻（作答 ≥5 題且錯誤率 ≥25%），繼續練習後會自動分析。';
      allSection.appendChild(nd);
    }

    app.appendChild(allSection);
  },

  /* ── Part → Category Mapping for Practice Navigation ── */
  _CATEGORY_PART_MAP: {
    '人物動作': 1, '物品狀態': 1, '場景位置': 1,
    'YesNo問句': 2, 'WH問句': 2, '附加間接問句': 2, '陳述句回應': 2, '音似干擾': 2,
    '主旨': 3, '細節': 3, '推論意圖': 3, '圖表整合': 3,
    '數字時間': 4, '推論': 4,
    '時態': 5, '片語動詞': 5, '搭配詞': 5, '近義字彙': 5,
    '介系詞': 5, '假設語氣': 5, '詞性': 5, '連接詞': 5, '關係代名詞': 5,
    '上下文邏輯': 6, '句子插入': 6,
    '跨篇比對': 7, '字義': 7
  },

  _goToPartForCategory: function (category) {
    var part = this._CATEGORY_PART_MAP[category];
    if (part) {
      TOEIC.App.startPractice(part);
    } else {
      TOEIC.App.goHome();
    }
  },

  /* ── Bar Chart Renderers ── */
  _renderBarChartPart: function (partData) {
    var container = document.createElement('div');
    container.className = 'analytics-chart';

    var maxVal = 0;
    Object.keys(partData).forEach(function (p) {
      if (partData[p].attempts > maxVal) maxVal = partData[p].attempts;
    });

    var partOrder = [1, 2, 3, 4, 5, 6, 7];
    partOrder.forEach(function (p) {
      var d = partData[p];
      if (!d || d.attempts === 0) return;

      var row = document.createElement('div');
      row.className = 'chart-row';

      var label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = 'Part ' + p;
      row.appendChild(label);

      var barArea = document.createElement('div');
      barArea.className = 'chart-bar-area';

      var pct = d.attempts > 0 ? (d.attempts / maxVal) * 100 : 0;

      var attemptsBar = document.createElement('div');
      attemptsBar.className = 'chart-bar chart-bar-attempts';
      attemptsBar.style.width = pct + '%';
      attemptsBar.title = '作答數：' + d.attempts;
      barArea.appendChild(attemptsBar);

      if (d.wrong > 0) {
        var wrongPct = (d.wrong / maxVal) * 100;
        var wrongBar = document.createElement('div');
        wrongBar.className = 'chart-bar chart-bar-wrong';
        wrongBar.style.width = wrongPct + '%';
        wrongBar.title = '錯誤數：' + d.wrong;
        barArea.appendChild(wrongBar);
      }

      row.appendChild(barArea);

      var stat = document.createElement('div');
      stat.className = 'chart-stat';
      var rate = d.attempts > 0 ? Math.round(d.wrong / d.attempts * 100) : 0;
      stat.textContent = d.attempts + ' 題 / 錯 ' + d.wrong + ' 題（' + rate + '%）';
      row.appendChild(stat);

      container.appendChild(row);
    });

    var legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = '<span class="chart-legend-item"><span class="chart-legend-color chart-color-attempts"></span>作答數</span>'
      + '<span class="chart-legend-item"><span class="chart-legend-color chart-color-wrong"></span>錯誤數</span>';
    container.appendChild(legend);

    return container;
  },

  _renderBarChartCategory: function (catData) {
    var container = document.createElement('div');
    container.className = 'analytics-chart';

    var list = [];
    Object.keys(catData).forEach(function (cat) {
      var c = catData[cat];
      if (c.attempts >= 3) {
        list.push({
          category: cat,
          attempts: c.attempts,
          wrong: c.wrong,
          errorRate: Math.round(c.wrong / c.attempts * 100)
        });
      }
    });

    if (list.length === 0) {
      var empty = document.createElement('p');
      empty.style.cssText = 'color:#6c757d;font-size:0.85rem;text-align:center;padding:1rem;';
      empty.textContent = '尚無足夠作答數的分類（需 ≥3 題）';
      container.appendChild(empty);
      return container;
    }

    list.sort(function (a, b) { return b.errorRate - a.errorRate; });

    list.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'chart-row';

      var label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = item.category;
      row.appendChild(label);

      var barArea = document.createElement('div');
      barArea.className = 'chart-bar-area';

      var pct = item.errorRate;

      var bar = document.createElement('div');
      bar.className = 'chart-bar chart-bar-error';
      bar.style.width = Math.max(pct, 2) + '%';
      bar.title = '錯誤率：' + pct + '%';
      barArea.appendChild(bar);

      row.appendChild(barArea);

      var stat = document.createElement('div');
      stat.className = 'chart-stat';
      stat.textContent = pct + '% （' + item.wrong + '/' + item.attempts + '）';
      row.appendChild(stat);

      container.appendChild(row);
    });

    return container;
  },

  _renderBackBtn: function () {
    var btn = document.createElement('button');
    btn.className = 'back-link';
    btn.innerHTML = '← 返回首頁';
    btn.addEventListener('click', function () { TOEIC.App.goHome(); });
    return btn;
  }
};
