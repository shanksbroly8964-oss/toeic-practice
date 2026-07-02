# TOEIC L&R E2E 端對端測試報告 (E2E1)

- **測試日期**: 2026-07-02
- **測試環境**: Playwright 1.61.1 + Chromium headless
- **測試目標**: https://toeic-goku.web.app
- **線上 APP_VERSION**: 20260702-5
- **測試結果**: ✅ **9/9 全部通過 (ALL GREEN)**
- **發現 Bug 數**: 0
- **修正 Bug 數**: 0
- **重新部署**: false（無需修正）

---

## 測試摘要

| # | 測試項目 | 結果 | 說明 |
|---|---------|------|------|
| 01 | 首頁與分軌 | ✅ PASS | 首頁正常渲染、T600/T730 分軌選擇正常、四大入口（7 Part 卡片 + 全真模擬試 + 錯題本）全數可見 |
| 02 | TTS 朗讀（Part 5） | ✅ PASS | `speechSynthesis.speak()` 被攔截確認傳入的 utterance.text 為正確英文字串，非 `[object Object]`、非空字串 |
| 02b | Part 3 播放對話 | ✅ PASS | 播放對話按鈕唸出對話英文內容，無 `[object Object]` 或 `undefined` |
| 02c | Part 2 盲聽 + 文字稿切換 | ✅ PASS | 預設文字稿隱藏（`.hidden` class），點擊播放後唸出英文，點擊「顯示文字稿」後文字稿出現 |
| 03 | 綜合練習組卷題數 | ✅ PASS | P1=2題 / P2=8題 / P3>=12題 / P4>=10題 / P5=10題 / P6=1組(4空) / P7=2組，Part 順序 1→2→3→4→5→6→7，全部符合規格 |
| 04 | Part 3 圖表整合題 | ✅ PASS | 抽到含 `chartData` 的題組，表格 (`table.chart-table`) 正確渲染在 DOM 中，含 header + data rows |
| 05 | 錯題本流程 | ✅ PASS | 故意答錯→錯題本出現該題 / Part 篩選正確 / 重新作答答對→自動從錯題本移除 / 無錯題時顯示空狀態 |
| 06 | 主控台無 JS error | ✅ PASS | 遍歷所有頁面（首頁、7 個 Part、綜合練習、錯題本），全程監聽 `console.error` 與 `pageerror`，0 個 JS error |
| 07 | 成人 UI 截圖 | ✅ PASS | 首頁、Part1/5/6/7 答題頁、錯題本、Part5 結果頁共 7 張截圖已保存至 `e2e/evidence/` |

---

## 各項詳細

### TEST 01 — 首頁與分軌

- 首頁 `#app` 非空，標題 `TOEIC L&R 練習` 正確
- T600 / T730 切換按鈕正常運作，track badge 文字同步更新
- 三段標題（聽力精練 / 閱讀精練 / 綜合工具）皆出現
- 共 9 張卡片（Part 1-7 + 全真模擬試 + 錯題本），關鍵三張（Part 5、全真模擬試、錯題本）文案正確

### TEST 02 — TTS 朗讀回歸測試

此為回歸測試，先前 QA2 曾抓到 TTS 唸出 `[object Object]` 的 bug。

- **Part 5**: 以 `addInitScript` 注入 `speechSynthesis.speak()` 攔截器，點擊題目 🔊 按鈕後，`window.__spoken` 最後一筆為有效英文字串
- **Part 3**: 點擊「播放對話」按鈕後，唸出的文字為對話實際內容（含 speaker 標記如 "A: ..."），非 `[object Object]`
- **Part 2**: 點擊「播放題目」鈕，確認唸出英文；預設文字稿隱藏，點擊「顯示文字稿」後出現

### TEST 03 — 綜合練習組卷題數

透過 `page.evaluate` 直接讀取 `TOEIC.App._session` 物件結構驗證：

| Part | 預期題數 | 實際 |
|------|---------|------|
| 1 | 2 題 | ✅ 2 |
| 2 | 8 題 | ✅ 8 |
| 3 | >=12 子題 | ✅ >=12 |
| 4 | >=10 子題 | ✅ >=10 |
| 5 | 10 題 | ✅ 10 |
| 6 | 1 組 (4 空) | ✅ 1 |
| 7 | 2 組 | ✅ 2 |

Part 順序符合規格：1 → 2 → 3 → 4 → 5 → 6 → 7（非遞減）。

### TEST 04 — Part 3 圖表整合題

- 指定 30 題以增加命中機率，在迭代過程中成功遇到含 `chartData` 的題組
- 確認 `<table class="chart-table">` 存在於 DOM，且包含 >= 2 行（header + data）
- 圖表內容非空

### TEST 05 — 錯題本流程

1. **記錄**: 在 Part 5 故意點選錯誤答案 → 錯題本出現該題（Question + 你的答案 + 正確答案 + 解釋）
2. **篩選**: 選擇 "Part 5" → 題目還在；切換 "Part 1" → 顯示「該簡下沒有錯題」
3. **移除**: 點「重新作答」→ 選正確答案 → 點「查看結果」→ 點「返回首頁」（被 goHome override 攔截回到錯題本）→ 該題消失，顯示「目前沒有錯題」

### TEST 06 — 主控台無 JS error

遍歷以下頁面流程，全程監聽 `page.on('console')` 的 `error` 等級與 `page.on('pageerror')`：

- 首頁 + T600↔T730 切換
- 依序進入 Part 1–7 各 Part 練習後返回
- 綜合練習（全真模擬試）進入後返回
- 錯題本進入後返回

**結果**: 0 個 JS error。

### TEST 07 — 成人 UI 截圖

產生 12 張截圖（含各主要畫面與功能流程截圖），供人工確認為成人職場風格（深藍/灰/白）：

```
e2e/evidence/
├── 01-home-page.png              # 首頁全貌
├── 03-composite-session.png      # 綜合練習第一題
├── 04-part3-chart-found.png      # Part 3 圖表整合題
├── 05a-wrongbook-with-item.png   # 錯題本有錯題
├── 05b-wrongbook-empty-after-correct.png  # 錯題本已清空
├── 07a-home.png                  # 首頁
├── 07b-part1-quiz.png            # Part 1 答題頁
├── 07c-part5-quiz.png            # Part 5 答題頁
├── 07d-part6-quiz.png            # Part 6 段落填空
├── 07e-part7-quiz.png            # Part 7 閱讀理解
├── 07f-wrongbook.png             # 錯題本
└── 07g-part5-results.png         # Part 5 結果頁
```

---

## 結論

✅ **全部 9 項 E2E 測試通過。** 未發現互動層 bug。線上版本 `20260702-5` 在以下關鍵互動場景中表現正常：

- TTS 朗讀不再唸出 `[object Object]`（QA2 回歸測試通過）
- 綜合練習組卷題數符合規格
- Part 3 圖表整合題正確渲染
- 錯題本記錄、篩選、答對移除流程完整
- 全程無 JS console error
- 成人 UI 設計一致

---

## Evidence 截圖清單

共 12 張截圖存放於 `C:\OpenCode\202606\toeic-app\e2e\evidence\`

| 檔案 | 畫面 |
|------|------|
| `01-home-page.png` | 首頁全貌 |
| `03-composite-session.png` | 綜合練習第一題 |
| `04-part3-chart-found.png` | Part 3 圖表整合題 |
| `05a-wrongbook-with-item.png` | 錯題本有錯題 |
| `05b-wrongbook-empty-after-correct.png` | 錯題本已清空 |
| `07a-home.png` | 首頁 |
| `07b-part1-quiz.png` | Part 1 答題頁 |
| `07c-part5-quiz.png` | Part 5 答題頁 |
| `07d-part6-quiz.png` | Part 6 段落填空 |
| `07e-part7-quiz.png` | Part 7 閱讀理解 |
| `07f-wrongbook.png` | 錯題本 |
| `07g-part5-results.png` | Part 5 結果頁 |
