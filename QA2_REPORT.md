# QA2 Report — Wave2 聽力題庫 + 前端整合檢查

Date: 2026-07-02 | Version: 20260702-3

---

## 檢查項目與結果

### 1. JSON合法性 — ALL PASS
8 個聽力 JSON 檔皆通過 `JSON.parse` 驗證。

| 檔案 | 題組數 | 子題數 |
|------|--------|--------|
| listening_part1_T600.json | 15 | 15 |
| listening_part1_T730.json | 15 | 15 |
| listening_part2_T600.json | 40 | 40 |
| listening_part2_T730.json | 40 | 40 |
| listening_part3_T600.json | 15 | 46 |
| listening_part3_T730.json | 15 | 47 |
| listening_part4_T600.json | 12 | 36 |
| listening_part4_T730.json | 12 | 37 |

---

### 2. answer慣例 — ALL PASS (修正後)
- 所有題目 answer 皆為選項完整文字，無字母代號
- Part1/Part3/Part4 每題均為 4 選項
- Part2 每題均為 3 選項
- Part3 questions 內每小題 answer 皆對應 options 逐字匹配

---

### 3. Part3 圖表整合題 — 修正 5 處

**每個 track 皆有 3 組 chartData ≠ null，且每組至少 1 題 requiresChart=true**：

| Group | requiresChart (before) | requiresChart (after) |
|-------|----------------------|---------------------|
| L3-T600-005 | Q1 only (1/3) | Q1 + Q3 (2/3) |
| L3-T600-009 | Q1 only (1/3) | Q1 + Q3 (2/3) |
| L3-T600-014 | Q1 only (1/3) | Q1 + Q3 (2/3) |
| L3-T730-005 | Q1 only (1/3) | Q1 only (1/3) — no change needed |
| L3-T730-010 | Q1 only (1/3) | Q1 only (1/3) — no change needed |
| L3-T730-015 | Q1 only (1/3) | Q1 + Q2 + Q3 (3/3) |

**修正明細**：
1. `L3-T600-005-Q3` — 題目「Who will present the Budget Planning session?」必須對照 chartData 才能作答。`requiresChart: false → true`
2. `L3-T600-009-Q3` — 題目「What is the price of the Executive model?」答案 $450 來自 chartData。`requiresChart: false → true`，同時修正 explanation（原先描述的是 Ergonomic $280，現改為正確對應 Executive $450）
3. `L3-T600-014-Q3` — 題目「What tracking number is currently out for delivery?」答案 TN7843 來自 chartData。`requiresChart: false → true`
4. `L3-T730-015-Q2` — 題目「Which department is now on the fourth floor?」解釋明確寫「對照chartData」。`requiresChart: false → true`
5. `L3-T730-015-Q3` — 題目「How many floors does the building have according to the directory?」直接問圖表內容。`requiresChart: false → true`

---

### 4. 聽力稿自然度與商務英文 — PASS
抽樣檢查 Part3 和 Part4 各約 15%，對話內容屬自然道地的商務場景：
- 會議排程、辦公用品訂購、客戶改約、績效考核、供應鏈追蹤等
- 文法正確、選項語意清楚。無需修正。

---

### 5. T600 vs T730 難度落差 — PASS

| 項目 | T600 每題平均字數 | T730 每題平均字數 | 增幅 |
|------|------------------|-------------------|------|
| Part1 | 13.2 | 18.1 | +37% |
| Part2 | 7.0 | 10.4 | +49% |
| Part3 (conversation) | 57.6 | 94.4 | +64% |
| Part4 (talk) | 79.3 | 137.3 | +73% |

T730 在詞彙、句長、資訊密度上明顯高於 T600。落差充足。

---

### 6. id唯一性 — ALL PASS
所有 8 檔內 id 無重複，格式正確（L1/L2/L3/L4-{track}-{三位數}）。跨檔也無衝突。

---

### 7. 前端邏輯串接 — ALL PASS (修正 1 處)

#### 7a. JS 語法檢查
所有 9 個 js 檔均通過 `node --check`。

#### 7b. 組卷器驗證 (session-composer.js)
```
Part1 = 2 題 ✓
Part2 = 8 題 ✓
Part3 = 累加抽組到剛好 12 題（最後一組可截斷） ✓
Part4 = 累加抽組到剛好 10 題（最後一組可截斷） ✓
Part5 = 10 題 ✓
Part6 = 1 組 (4 空) ✓  (所有 Part6 passage 實測皆 4 blanks)
Part7 = 2 組 (totalItems 含實際小題數) ✓
```

#### 7c. Data-loader 路徑
- Part1-4: `data/listening_part{1,2,3,4}_${track}.json?v=` ✓
- Part7: `data/reading_part7_{single,double,triple}_${track}.json?v=` ✓

#### 7d. UI-renderer 渲染邏輯
- Part1: 圖片情境描述 + TTS 朗讀按鈕 ✓
- Part2: 播放題目按鈕 + 文字稿切換（預設隱藏／盲聽） ✓
- Part3: 播放對話按鈕 + chartData 表格渲染 (chartData ≠ null 時) ✓
- Part4: 播放獨白按鈕 ✓
- 每題/每選項皆有 TTS 朗讀按鈕 ✓

#### 7e. 錯題本邏輯 (quiz-engine + storage + wrongbook)
- 答錯時 `addWrongItem` 記錄 ✓
- 答對時若該 id 在錯題本則 `removeWrongItem` 移除 ✓
- Part6 用 blank id（`{itemId}-B{index}`） ✓
- Part7 用小題 id（`q.id`） ✓
- 錯題本可依 Part 篩選（1-7 + 全部） ✓

#### 7f. index.html
- 「聽力練習」導覽入口 ✓ (Part 1-4 卡片)
- 「綜合練習」導覽入口 ✓ (全真模擬按鈕)
- 「錯題本」導覽入口 ✓
- APP_VERSION = 20260702-3 ✓
- 所有 js/css 皆帶 `?v=20260702-3` ✓

---

### 8. 🐛 CRITICAL BUG — listening.js playConversation (已修正)

**問題**：`js/listening.js:7` — `TOEIC.TTS.speak(lines[i], track)` 直接將 conversation 物件傳入 TTS。Part3 的 conversation 格式為 `[{speaker: "A", line: "..."}, ...]`，而非純字串陣列。`SpeechSynthesisUtterance` 會呼叫 `.toString()` 得到 `"[object Object]"`，導致 TTS 朗讀出「object Object」而非實際對話內容。

**修正**：
```js
// Before:
TOEIC.TTS.speak(lines[i], track);

// After:
var line = lines[i];
var text = (typeof line === 'string') ? line : ((line.speaker ? line.speaker + ': ' : '') + (line.line || ''));
TOEIC.TTS.speak(text, track);
```

---

## 最終驗證結果

| 檢查項目 | 狀態 |
|----------|------|
| 8 檔 JSON 合法性 | PASS |
| answer 選項全文慣例 | PASS |
| Part2 三選項 | PASS |
| Part3 圖表 requiresChart | PASS (修正後) |
| 聽力稿英文品質 | PASS |
| T600 vs T730 難度落差 | PASS |
| ID 唯一性 | PASS |
| JS 語法檢查 (9 檔) | PASS |
| 組卷器題數規則 | PASS |
| Data-loader 路徑 | PASS |
| UI-renderer 功能 | PASS |
| 錯題本邏輯 | PASS |
| index.html 導覽入口 & cache-busting | PASS |
| listening.js 物件轉字串 bug | FIXED |

---

## APP_VERSION
`20260702-2` → `20260702-3`（因修改了 js/listening.js 及 3 個 JSON 資料檔）

## 統計
- 發現問題數：7
- 全部修正完畢：7
- 最終 all_pass：true
