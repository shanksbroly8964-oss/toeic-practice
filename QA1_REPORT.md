# QA1 Report — Wave 1 TOEIC App

## 檢查摘要

| 項目 | 結果 |
|------|------|
| JSON 合法性（10 檔） | PASS |
| answer 慣例（全文 vs 字母） | PASS |
| 商務英文正確性與自然度 | PASS |
| T600 vs T730 難度落差 | PASS (顯著) |
| ID 格式與唯一性 | PASS |
| 前端串接檢查 | 1 個 Bug 已修正 |
| 最終驗證 | PASS |

---

## 1. JSON 合法性

全部 10 個 data 檔均通過 `JSON.parse` 驗證，格式完整無誤。

| 檔案 | 題/組數 |
|------|---------|
| reading_part5_T600.json | 50 題 |
| reading_part5_T730.json | 55 題 |
| reading_part6_T600.json | 12 組 / 48 blanks |
| reading_part6_T730.json | 12 組 / 48 blanks |
| reading_part7_single_T600.json | 7 組 / 23 題 |
| reading_part7_single_T730.json | 6 組 / 20 題 |
| reading_part7_double_T600.json | 5 組 / 25 題 |
| reading_part7_double_T730.json | 4 組 / 20 題 |
| reading_part7_triple_T600.json | 3 組 / 15 題 |
| reading_part7_triple_T730.json | 3 組 / 15 題 |

**合計**: Part5 105 題, Part6 96 blanks, Part7 83 題 (共 284 items)

---

## 2. Answer 慣例

- **Part5**: 全 105 題的 answer 均為選項完整文字字串，非 A/B/C/D 字母；每題 options 均為 4 個元素。
- **Part6**: 全 24 組 (96 blanks) 的 answer 均為選項完整文字；每組 blanks 均為 4 筆（index 1~4）；passageTemplate 均含有對應 `(1)___` ~ `(4)___` 標記。
- **Part7**: 全 83 題的 answer 均為選項完整文字；每題 options 均為 4 個元素；double/triple 組每一組均至少 1 題 `crossReference: true` 且 explanation 明確說明跨文件線索來源。

---

## 3. 商務英文正確性

抽樣檢查各檔約 20% 題目：
- 文法正確，無時態、主詞動詞不一致錯誤
- 用詞為道地商務英文（email, memo, proposal, contract, policy 等體裁自然）
- 選項語意清楚，無含糊或雙重解釋
- 無拼字錯誤

---

## 4. T600 vs T730 難度落差

量化分析結果顯示落差顯著：

| 指標 | T600 | T730 |
|------|------|------|
| Part5 題幹平均單字長度 | 4.81 | 5.31 |
| Part5 進階詞彙佔比 (≥8 letters) | 15.1% | 24.9% |
| Part5 干擾選項迷惑指數 | 3.92 | 4.25 |
| Part6 平均句子長度 | ~12 words | ~19 words |
| Part6 長單字 (>5 letters) 總數 | 248 | 582 |

T730 在字彙難度、句型複雜度、干擾選項設計上均明確高於 T600，不需額外改寫。

---

## 5. ID 格式與唯一性

- All IDs within each file are unique
- Part5: `P5-{track}-{NNN}` format — all correct
- Part6: `P6-{track}-{NNN}` format — all correct
- Part7 single: `P7S-{track}-{NNN}` format — all correct
- Part7 double: `P7D-{track}-{NNN}` format — all correct
- Part7 triple: `P7T-{track}-{NNN}` format — all correct
- Question IDs (Part7): `{parentId}-Q{N}` format — all correct

---

## 6. 前端串接檢查

### 6.1 Data Loader 路徑
`js/data-loader.js` 的 fetch URL 與實際檔名完全一致：
- `data/reading_part5_${track}.json` ✓
- `data/reading_part6_${track}.json` ✓
- `data/reading_part7_${subtype}_${track}.json` (subtype = single/double/triple) ✓

### 6.2 Quiz Engine 對錯邏輯
`js/quiz-engine.js` 使用 `answerText === item.answer` 進行字串比對，非字母 index 比對。✓

### 6.3 UI Renderer TTS 按鈕
- Part5: 每題有朗誦按鈕 (`_createTTSButton`) ✓
- Part6: 全篇朗誦按鈕（clean passage）✓
- Part7: 每篇 document 有朗誦按鈕，每題問題也有朗誦按鈕 ✓

### 6.4 Cache Busting
`index.html` 已設定 `window.APP_VERSION = '20260702-1'`，所有 `<script>` / `<link>` 標籤均帶 `?v=20260702-1`。`data-loader.js` 的 fetch URL 均呼叫 `_ver()` 附加版本參數。✓

### 6.5 **Bug 發現與修正**
**檔案**: `js/ui-renderer.js:315`

**問題**: Part6 TTS 全文朗讀時，清潔 passTemplate 的正規表達式為 `/\(\d\)\s*_{4,}/g`，要求至少 4 個底線。但題庫中所有 markers 均只使用 3 個底線（`(1)___`），導致 TTS 會直接讀出 `"left parenthesis 1 right parenthesis underscore underscore underscore"` 而非置換為 `"blank"`。

**修改**: 將 `_{4,}` 改為 `_{3,}`，使 regex 能匹配題庫中實際的 3 底線格式。

### 6.6 JS 語法檢查
全部 6 個 JS 檔案通過 `node --check`：
- `storage.js` ✓
- `tts.js` ✓
- `data-loader.js` ✓
- `quiz-engine.js` ✓
- `ui-renderer.js` ✓
- `app.js` ✓

### 6.7 HTTP Server 測試
於 `localhost:8899` 啟動測試伺服器，成功載入 index.html 及 data 檔案。

---

## 7. 最終驗證

修正後重新執行 JSON 合法性與 answer 慣例驗證，全數通過（0 issues）。

---

## 結算

| 指標 | 數值 |
|------|------|
| 檢查檔案數 | 17（10 data + 7 frontend） |
| 發現問題數 | 1 |
| 修正問題數 | 1 |
| 所有檢查通過 | true |
