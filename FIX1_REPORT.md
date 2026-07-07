# FIX1 修復報告：Part 3/4/7 分組題作答後不顯示對錯與解析

**日期**: 2026-07-07  
**版本**: 20260703-5  
**狀態**: ✅ 已完成

---

## 根因

Part 3/4/7 三個 Part 都是「一組（對話/獨白/文章）底下有多個小題」的結構。

**核心問題**: `ui-renderer.js` 的 `renderPart3Question` / `renderPart4Question` / `renderPart7Question` 中，決定「要顯示第幾個小題」時使用：

```javascript
var qIndex = TOEIC.QuizEngine.getPart3QuestionIndex(session);
```

`getPartXQuestionIndex` 回傳的是「**第一個尚未作答的小題索引**」。導致：

1. **作答 Q1 後** → `getPartXQuestionIndex` 立刻回傳 1（Q1 已答、Q2 未答）→ 畫面重繪後直接顯示全新的 Q2，Q1 的 feedback 區塊永遠不會被顯示。
2. **作答該組最後一題後** → `getPartXQuestionIndex` 回傳 `questions.length` → 條件 `if (qIndex < item.questions.length)` 為 false → 整個小題區塊（含 feedback 與導覽按鈕）都不渲染 → 畫面空白、卡住。

**結論**: 現有的 feedback 顯示與「下一題」按鈕邏輯形同死碼，因為顯示索引永遠停在「未作答」的題目上。

---

## 修法

改用**顯示指標 `_groupViewIndex`**，讓作答後停在剛答的題目上顯示回饋，由使用者按「下一題」才前進。

### 1. Session 初始化（`quiz-engine.js` + `session-composer.js`）

在 session 物件中加入 `_groupViewIndex: 0`，兩處都要加：

- **`quiz-engine.js:40`** — `createSession()` 回傳物件
- **`session-composer.js:197`** — `composeSession()` 回傳物件（綜合練習路徑）

### 2. 顯示索引改用 `_groupViewIndex`（`ui-renderer.js`）

三個 render 函式中，將：
```javascript
var qIndex = TOEIC.QuizEngine.getPart3QuestionIndex(session);
// 同理 Part4/7
```
改為：
```javascript
var qIndex = session._groupViewIndex || 0;
if (qIndex >= item.questions.length) qIndex = item.questions.length - 1;
```

修改位置：
- `renderPart3Question`: 第 682 行
- `renderPart4Question`: 第 817 行  
- `renderPart7Question`: 第 1245 行

### 3. `submitPartXAnswer` 改用顯示指標（`app.js`）

```javascript
// Before
var qIndex = TOEIC.QuizEngine.getPart3QuestionIndex(this._session);
// After
var qIndex = this._session._groupViewIndex || 0;
```

修改位置：`app.js` 的 `submitPart3Answer`（第 88 行）、`submitPart4Answer`（第 99 行）、`submitPart7Answer`（第 122 行）。

### 4. `nextPartXQuestion` 遞增顯示指標（`app.js`）

```javascript
// Before
nextPart3Question() { this._renderCurrentQuestion(); }
// After
nextPart3Question() {
  this._session._groupViewIndex = (this._session._groupViewIndex || 0) + 1;
  this._renderCurrentQuestion();
}
```

同理 Part4（第 105 行）、Part7（第 128 行）。

### 5. `nextQuestion` 重設顯示指標（`app.js`）

在切換到下一組時重設 `_groupViewIndex`：
```javascript
nextQuestion() {
  this._session._groupViewIndex = 0;
  TOEIC.QuizEngine.next(this._session);
  this._renderCurrentQuestion();
}
```

### 6. 導覽邏輯修正（`ui-renderer.js`）

三個 Part 的導覽按鈕判斷改為基於 `_groupViewIndex`：

```
if (!isLastQuestion) → "下一題"
else if (allQAnswered) → "下一組" 或 "查看結果"
```

- **Part 3**: 第 752-781 行
- **Part 4**: 第 887-916 行
- **Part 7**: 第 1317-1346 行

---

## Part 6 / Part 1 / Part 2 / Part 5 檢查結果

| Part | 機制 | 狀態 |
|------|------|------|
| Part 1 | 單題，`answers[currentIndex]` 為 null 或 answer object。answered 判斷正確。 | ✅ 正常 |
| Part 2 | 單題，同 Part 1 機制。 | ✅ 正常 |
| Part 5 | 單題，同 Part 1 機制。 | ✅ 正常 |
| Part 6 | 一次顯示所有空格，每個空格獨立 inline feedback (✓/✗) + 下方獨立 feedback 區塊。全部空格作答後才出現導覽按鈕。 | ✅ 正常 |

Part 6 無需修改。Part 1/2/5 無需修改。

---

## 綜合練習路徑

`composeSession` 產生的 session 結構與 `createSession` 一致（一樣有 `items` / `answers` / `currentIndex` 陣列），已同步在 `session-composer.js` 加入 `_groupViewIndex: 0`。`nextQuestion()` 中的 `_groupViewIndex = 0` 重設邏輯對綜合練習同樣生效。`_renderCurrentQuestion()` 根據 `item.part` 路由到正確的 renderer，不區分單 Part 或綜合練習。

---

## 版本同步

- **`index.html`**: `APP_VERSION` 從 `20260703-4` → `20260703-5`
- **所有 `<script>` 的 `?v=`**: `20260703-4` → `20260703-5`
- **`<link>` CSS 的 `?v=`**: `20260703-4` → `20260703-5`
- **`data-loader.js`**: 使用 `window.APP_VERSION` 動態生成，自動同步

---

## 模擬驗證

執行 `node tools/sim_fix1.js`，模擬 Part 3 兩組（第一組 3 題、第二組 2 題）的完整作答流程：

```
Step 1: Q1 correct → viewIndex=0, answered=true, shows feedback
Step 2: "下一題" → viewIndex=1, Q2 unanswered
Step 3: Q2 wrong → viewIndex=1, shows feedback
Step 4: "下一題" → viewIndex=2, Q3
Step 5: Q3 wrong → viewIndex=2, isLastQuestion=true, allAnswered=true → "下一組"
Step 6: "下一組" → currentIndex=1, viewIndex=0 reset
Step 7-9: Q4→Q5, last group → "查看結果"
```

11 項檢查全部通過（answeredCount 正確、畫面不空白、viewIndex 正確停止與重設）。

---

## 修改檔案清單

| 檔案 | 修改函式/行 | 變更說明 |
|------|------------|---------|
| `js/app.js` | `submitPart3Answer` (88) | 改用 `_groupViewIndex` |
| `js/app.js` | `nextPart3Question` (93) | 遞增 `_groupViewIndex` |
| `js/app.js` | `submitPart4Answer` (99) | 改用 `_groupViewIndex` |
| `js/app.js` | `nextPart4Question` (105) | 遞增 `_groupViewIndex` |
| `js/app.js` | `submitPart7Answer` (122) | 改用 `_groupViewIndex` |
| `js/app.js` | `nextPart7Question` (128) | 遞增 `_groupViewIndex` |
| `js/app.js` | `nextQuestion` (132) | 重設 `_groupViewIndex = 0` |
| `js/ui-renderer.js` | `renderPart3Question` (682-781) | 改用 `_groupViewIndex` + 導覽修正 |
| `js/ui-renderer.js` | `renderPart4Question` (817-916) | 改用 `_groupViewIndex` + 導覽修正 |
| `js/ui-renderer.js` | `renderPart7Question` (1245-1346) | 改用 `_groupViewIndex` + 導覽修正 |
| `js/quiz-engine.js` | `createSession` (40) | 加入 `_groupViewIndex: 0` |
| `js/session-composer.js` | `composeSession` (197) | 加入 `_groupViewIndex: 0` |
| `index.html` | (17, 7-31) | `APP_VERSION` + 所有 `?v=` → `20260703-5` |
