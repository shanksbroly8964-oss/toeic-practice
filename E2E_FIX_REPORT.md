# TOEIC 練習網站 E2E 修正回合測試報告

**日期**：2026-07-08  
**對應修正**：Part 3/4/7 分組題作答後不顯示對錯與解析（_groupViewIndex）  
**受測版本**：本機 APP_VERSION=20260703-6  
**測試環境**：Playwright webServer (python http.server 8123) + Chromium headless

---

## 一、既有回歸測試（本機化）

| 規格檔 | 測試數 | Pass | Fail |
|--------|--------|------|------|
| `toeic-e2e.spec.js` | 9 | 9 | 0 |
| `toeic-p2.spec.js` | 8 | 8 | 0 |
| **合計** | **17** | **17** | **0** |

**既有回歸通過率：17/17 (100%)**

### 本機化變更
- `playwright.config.js`：baseURL 從 `https://toeic-goku.web.app` 改為 `http://127.0.0.1:8123`，新增 `webServer` 區塊由 Playwright 自動管理 python http.server 生命週期
- `toeic-e2e.spec.js` / `toeic-p2.spec.js`：移除硬編碼 BASE，改用 `page.goto('/')`

### 回歸測試覆蓋項目
- 首頁繁中、分軌切換、卡片結構
- TTS 朗讀正確（不含 [object Object]）
- Part 2/3 播放與文字稿切換
- 綜合練習組卷題數正確
- Part 3 圖表整合題渲染
- 錯題本流程（記錄→篩選→答對移除）
- 弱點分析統計
- 錯題本分類標籤與篩選
- 登入元件存在、未登入可用
- 主控台無 JS error

---

## 二、修正專項測試 `fix-feedback.spec.js`

| 測試名稱 | 狀態 | 說明 |
|----------|------|------|
| `fix-01-part3-feedback` | **PASS** | Part 3 分組題：Q1 作答顯示 feedback（答對/答錯+解析+正確答案）、選項 disabled+correct class、下一題按鈕存在、Q2 無殘留 feedback、答到最後一題顯示「下一組 →」按鈕、畫面不空白 |
| `fix-02-part4-feedback` | **PASS** | Part 4 分組題：同上全部斷言通過、feedback 區塊與解析正確顯示、跨題不殘留 |
| `fix-03-part7-feedback` | **PASS** | Part 7 分組題：同上全部斷言通過、documents-container 正常渲染、feedback 區塊正確顯示 |
| `fix-04-part3-multi-group-navigation` | **PASS** | Part 3 多組導覽：完成 5 組題目，每題作答後 feedback 可見，跨組 _groupViewIndex 歸零正確，無 JS error |
| `fix-05-composite-part3-feedback` | **PASS** | 綜合練習模式下 Part 3（僅設 Part3=3 組）：作答後 feedback 正確顯示、可一路答到結果頁、結果頁正常渲染 |

**修正專項通過率：5/5 (100%)**

### 核心斷言清單（全數通過）
1. 作答後同一畫面出現 `.feedback` 區塊，含「答對了」或「答錯了」
2. 答錯時顯示「正確答案：…」
3. 解析文字（`.explanation`）非空
4. 選項變為 disabled，正確選項有 `correct` class
5. 出現「下一題」按鈕（非最後一題時）
6. 點擊「下一題」→ 下一題為未作答狀態（無殘留 feedback、選項可點）
7. 最後一小題作答後，畫面不空白（feedback 區塊存在）
8. 最後一題按鈕為「下一組 →」或「查看結果」（非「下一題」）
9. 全程無 JS console error / pageerror
10. 綜合練習模式下 Part3 分組題 feedback 正常（結果頁正常）

---

## 三、發現的 Bug 與修正

**發現的 Bug 數：0**  
**修正數：0**

本機版 APP_VERSION=20260703-6 的 `_groupViewIndex` 修正已正確解決 Part 3/4/7 分組題作答後不顯示 feedback 的問題，測試全綠無需額外修復。

---

## 四、截圖清單

| 檔案 | 描述 |
|------|------|
| `evidence/fix-part3-feedback.png` | Part 3 分組題 feedback 區塊（含答對/答錯、解析、正確答案、導覽按鈕） |
| `evidence/fix-part4-feedback.png` | Part 4 分組題 feedback 區塊 |
| `evidence/fix-part7-feedback.png` | Part 7 分組題 feedback 區塊 |
| `evidence/fix-composite-part3-result.png` | 綜合練習 Part3 結果頁 |

---

## 五、最終本機版本

- **APP_VERSION**：`20260703-6`
- **修正內容**：`_groupViewIndex` 用於 Part 3/4/7 分組題作答後 feedback 與解析顯示
- **受影響檔案**：`js/app.js`, `js/ui-renderer.js`, `js/quiz-engine.js`, `js/session-composer.js`
- **測試總結**：22/22 全綠（回歸 17 + 專項 5），無 JS error，無需額外修復
- **伺服器管理**：Playwright webServer 自動啟動/關閉 python http.server，無前景阻塞
