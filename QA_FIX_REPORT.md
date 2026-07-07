# QA 驗證報告：FIX1 修正回合深度驗證

**日期**: 2026-07-08  
**版本**: 20260703-6  
**驗證腳本**: `tools/qa_fix_verify.js`

---

## 一、修正正確性驗證（核心）

### Part 3 分組題流程模擬（node 腳本）

使用 mock session 物件（含 2 組：第一組 3 題 / 第二組 2 題），完整逐步驗證：

| 步驟 | 操作 | 預期行為 | 結果 |
|------|------|----------|------|
| 初始 | 建立 session | _groupViewIndex=0, currentIndex=0, Q1 未作答 | ✅ |
| 1 | 作答 Q1（答對 A） | viewIndex 停在 0，answered=true，feedback 顯示 | ✅ |
| 2 | 按「下一題」 | viewIndex=1，顯示 Q2 未作答 | ✅ |
| 3 | 作答 Q2（答錯 D） | viewIndex 停在 1，feedback 顯示，選項 disabled | ✅ |
| 4 | 按「下一題」 | viewIndex=2，isLastQuestion=true | ✅ |
| 5 | 作答 Q3（答錯 B） | viewIndex 停在 2，**不空白**，feedback 顯示，按鈕顯示「下一組 →」 | ✅ |
| 6 | 按「下一組」 | currentIndex=1，viewIndex 重設為 0，Q4 未作答 | ✅ |
| 7-9 | 作答 Q4→Q5（最後一組） | isLastGroup=true → 按鈕顯示「查看結果」 | ✅ |
| 邊界 | 重複點擊同一題 | submit 被阻擋（return null），answeredCount 不變 | ✅ |
| 邊界 | 2 題組（第二組） | 流程與 3 題組相同，最後一題不空白 | ✅ |

### Part 4（獨白）相同流程驗證

| 步驟 | 預期 | 結果 |
|------|------|------|
| 初始 viewIndex=0 | ✅ | ✅ |
| 作答 Q1 → viewIndex 停在 0 | ✅ | ✅ |
| 下一題 → viewIndex=1 | ✅ | ✅ |
| 作答 Q2 → viewIndex 停在 1，不空白 | ✅ | ✅ |

### Part 7（閱讀理解）4 題組驗證

| 步驟 | 預期 | 結果 |
|------|------|------|
| 初始 viewIndex=0 | ✅ | ✅ |
| 依序作答 Q1→Q4，每次 viewIndex 正確停在當前題 | ✅ | ✅ |
| 最後一題不空白，answeredCount=4 | ✅ | ✅ |

---

## 二、計分正確性驗證

| 檢查項 | 結果 |
|--------|------|
| answeredCount 逐題累加（3 題答對 1 + 答錯 2 = 3） | ✅ |
| 重複點擊被阻擋（return null），answeredCount 不重複累加 | ✅ |
| Analytics.recordAttempt 每題觸發 1 次 | ✅ |
| 答對 → removeWrongItem，答錯 → addWrongItem | ✅ |
| 全對組：WrongItems=0 | ✅ |
| 全錯組：WrongItems=3（Q2 錯、Q3 錯、Q5 錯） | ✅ |

---

## 三、綜合練習路徑驗證

模擬「Part 2 單題 → Part 3 一組多題 → Part 5 單題」的 currentIndex 前進：

| 步驟 | 操作 | 預期 | 結果 |
|------|------|------|------|
| 1 | 綜合練習 session (_groupViewIndex=0) | Part 2 渲染取 item.part=2 | ✅ |
| 2 | nextQuestion → Part 3 組 | _groupViewIndex 重設為 0 | ✅ |
| 3 | 作答 Part 3 Q1 | viewIndex 停在 0 | ✅ |
| 4 | 作答 Part 3 Q2 | viewIndex 停在 1 | ✅ |
| 5 | nextQuestion → Part 5 | _groupViewIndex 重設為 0 | ✅ |

`nextQuestion()` 中的 `_groupViewIndex = 0` 重設邏輯對跨 Part 過渡正確生效。

---

## 四、Part 1/2/5/6 回歸驗證

| Part | 機制 | 驗證項目 | 結果 |
|------|------|----------|------|
| Part 1 | 單題 answers[i] = null/object | 作答 → feedback 顯示，重複點擊阻擋 | ✅ |
| Part 2 | 同 Part 1 機制 | 作答 → feedback 顯示，重複點擊阻擋 | ✅ |
| Part 5 | 同 Part 1 機制 | 作答 → feedback 顯示，重複點擊阻擋 | ✅ |
| Part 6 | 4 個空格獨立 inline feedback | 逐格作答 → inline feedback(✓/✗)，全部答完 → 導覽按鈕出現 | ✅ |

Part 6 無迴歸。各空格 inline feedback 邏輯與 createSession/areAllPart6BlanksAnswered 未受影響。

---

## 五、其他問題排查

### 5-1 資料 JSON 驗證（36 個檔案）

| 檢查項 | 結果 |
|--------|------|
| 全部 36 個 JSON 合法 | ✅ |
| Part 2 全部為 3 選項（A/B/C） | ✅ |
| Part 3/4/7 每個 question 都有 answer 與 4 個 options | ✅ |
| Part 6 每個 blank 都有 answer 與 4 個 options | ✅ |

### 5-2 版本號一致性

| 檢查項 | 結果 |
|--------|------|
| `index.html` 中 `APP_VERSION = '20260703-6'` | ✅ |
| 所有 `<script> ?v=20260703-6`（14 處） | ✅ |
| 所有 `<link> ?v=20260703-6`（1 處） | ✅ |
| `data-loader.js` 使用 `window.APP_VERSION` 動態生成 | ✅ |
| 無殘留舊版號 | ✅ |

### 5-3 Runtime 風險掃描

| 檢查項 | 結果 |
|--------|------|
| `node --check` 全部 13 個 JS 檔通過 | ✅ |
| 模組相依順序：storage → tts → data-loader → quiz-engine → listening → session-composer → analytics → wrongbook → ui-renderer → app → (defer: firebase-config, auth, sync) | ✅ |
| quiz-engine 引用 TOEIC.Analytics（檔在 quiz-engine 之後載入），但只在執行期函數內呼叫，DOMContentLoaded 後才執行 → 安全 | ✅ |
| ui-renderer 引用 TOEIC.App（檔在 ui-renderer 之後），但只在 callback 內呼叫 → 安全 | ✅ |
| 無 undefined 取值風險 | ✅ |

### 5-4 功能迴歸檢查

| 功能 | 狀態 | 說明 |
|------|------|------|
| TTS 發音按鈕（Part 1/2/3/4/5/6/7） | ✅ | `_createTTSButton` 未修改，所有 render 函式中 TTS 按鈕正常附加 |
| 圖表渲染（Part 3 chartData） | ✅ | `_renderChartData` 在 `renderPart3Question` 中邏輯未變 |
| 錯題本（篩選、重新作答） | ✅ | `TOEIC.WrongBook.render` 未修改，篩選/渲染邏輯未動 |
| 弱點分析（Analytics page） | ✅ | `TOEIC.Analytics.render` 未修改 |
| 登入元件（Firebase Auth） | ✅ | `ToeicAuth` 隔離設計，未引用任何 quiz/session 模組 |
| 雲端同步（ToeicSync） | ✅ | hooks 僅包裝 Storage/Analytics，未變 |

---

## 六、發現並修正的額外問題

### Bug #1: createSession 對 Part 6 硬編碼 4 個 null

**位置**: `js/quiz-engine.js:17-19`

**問題**: `createSession` 對 Part 6 一律建立 4 個 null 的 answers 陣列（`picked.length * 4`、`[null, null, null, null]`），但 `session-composer` 與 `getResults`/`getCompositeResults` 都依據 `item.blanks.length` 動態計算。當錯題本 `_reAnswer` 為 Part 6 建立一道題的迷你 session（1 blank）時，answers 陣列有 4 個 null，`areAllPart6BlanksAnswered` 因多餘 null 永遠回傳 false → 導覽按鈕永不顯示。

**修正**: 改為與 Part 3/4/7 一致的動態長度：
```javascript
totalItems = picked.reduce(function (s, item) {
    return s + (item.blanks ? item.blanks.length : 0);
}, 0);
answers = picked.map(function (item) {
    return new Array(item.blanks ? item.blanks.length : 0).fill(null);
});
```

對正常資料（一律 4 blanks）無行為變更，但修正了錯題本 Part 6 重新作答的邊界 bug。

---

## 七、最終驗證摘要

| 項目 | 結果 |
|------|------|
| node mock 模擬測試（91 項斷言） | 全部通過 |
| `node --check` 全部 JS（13 檔） | 全部通過 |
| 資料 JSON 驗證（36 檔） | 全部合法 |
| 版本號一致性 | 全部同步至 `20260703-6` |
| FIX1 核心修正正確性 | ✅ 確認 |
| 其他 bug 發現 | 1 個（已修正） |
| 修改檔案 | `js/quiz-engine.js`（createSession Part 6 動態長度）、`index.html`（版號 bump） |

---

## 八、已知次要問題（不影響功能，未修）

1. **綜合練習跨 Part 標題顯示**：`_renderCurrentQuestion` 傳入 `total = session.items.length`（全部 item 數，非該 Part 組數），導致 Part 3/4/6/7 在綜合練習中顯示「第 N 組 / 共 全部 items 組」而非「第 1 組 / 共 該 Part 組數」。此為既有設計，不影響作答邏輯。
