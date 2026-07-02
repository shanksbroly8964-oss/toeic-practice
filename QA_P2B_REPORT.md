# TOEIC App QA_P2B 品管報告

**日期**: 2026-07-03
**版本**: 20260703-4（已從 20260703-3 bump）
**品管範圍**: Wave P2-2（G1 繁中化+出題數設定+分片併載、G2 弱點分析+建議引擎、G3 Google 登入+Firestore 同步）
**驗證方式**: Node.js 靜態驗證（node --check + 自訂驗證腳本）

---

## 檢查項目結果總表

| # | 檢查項目 | 結果 | 說明 |
|---|---------|------|------|
| 1 | 繁中覆蓋率 | PASS | lang="zh-Hant"，UI 字串全為繁中，無殘留英文 UI 文案 |
| 2 | 出題數設定 | PASS | 預設 2/8/12/10/10/1組/2篇、自訂值、0=跳過、防呆、Part3/4累加截斷均正確 |
| 3 | 分片併載 | PASS | 18 基礎檔×對應 _ext1、_ext1 失敗降級、合併後題池擴大 |
| 4 | 統計與建議引擎 | FIXED | 27 分類全覆蓋、未分類顯示正常、優先加強 badge 缺少 attempts≥5 條件已修正 |
| 5 | 登入模組隔離性 | PASS | Config 真實值、SDK 失敗不影響主站、Firestore set+merge:true 保護其他工具欄位 |
| 6 | 版本一致性 | PASS | APP_VERSION 與 ?v= 同步為 20260703-4 |
| 7 | node --check | PASS | 全部 13 個 JS 檔通過語法檢查 |

---

## 發現並修正的問題

### 問題 1：弱點分析「優先加強」badge 門檻不一致（已修正）

- **檔案**: `js/analytics.js`（原第 294 行附近）
- **問題描述**: Top 3 弱點卡片的 badge 只檢查 `errorRate >= 40%`，未同步檢查 `attempts >= 5`。規格要求「觸發門檻 ≥5 且 ≥40% 優先加強」，但原程式碼對 3~4 次作答且高錯誤率的分類也會顯示「優先加強」。
- **修正內容**: 新增 `var isPriority = item.errorRate >= 40 && item.attempts >= 5;`，使 badge 僅在兩條件皆滿足時標示「優先加強」，其餘顯示「建議複習」。
- **修正後驗證**: PASS

### 版本同步

因程式碼有變更，APP_VERSION 及所有 `?v=` 從 `20260703-3` bump 到 `20260703-4`。

---

## 各項目詳細驗證記錄

### 1. 繁中覆蓋率
- `index.html` 第 2 行: `<html lang="zh-Hant">` ✓
- 所有 JS 檔案中的 `textContent`、`innerHTML`、`alert/confirm` 均為繁中或 Unicode escape 繁中字串
- 無殘留英文 UI 文案（題目本體、選項、聽力稿、console.log 除外）
- 臺灣用語一致：登入/登出、設定、練習、返回首頁、弱點分析、錯題本

### 2. 出題數設定
- `session-composer.js` `_getConfig()` 預設值: p1=2, p2=8, p3=12, p4=10, p5=10, p6=1, p7=2 ✓
- 自訂值 `{p1:5,p2:15,p3:20,p4:25,p5:30,p6:3,p7:4}` 正確生效 ✓
- 值=0 時 `cfg.pX > 0` 為 false，該 Part 跳過 ✓
- 超出範圍 (p1=100) 被正確截斷 (p1=10) ✓
- 負數 (-5) → `Math.max(0, NaN)` → 0 ✓
- Part3 累加截斷：12題×每組3題→4組滿載 / 5題→2組(3+2截斷) ✓
- `ui-renderer.js` 設定頁預設值與 session-composer 一致 ✓

### 3. 分片併載
- `data-loader.js` 使用 `Promise.allSettled` 併載基礎檔 + _ext1 ✓
- _ext1 fetch 失敗（status rejected）時回傳 null，僅用基礎檔 ✓
- Part7 3 個子類型 (single/double/triple) 各自分片併載 ✓
- 實際數據驗證: reading_part5_T600 基礎 50 題 + ext1 150 題 = 200 題合併後 ✓

### 4. 統計與建議引擎
- 全部 27 個分類值（來自 verify_categories.js VALID_CATS 全集）在 `_SUGGESTIONS` 中均有建議文案 ✓
- `recordAttempt` 無 category 時 key 為 `part|未分類`，`analytics._getCategoryDisplay` 顯示「未分類」 ✓
- 前 3 名依 errorRate 降冪排序 ✓
- 「改進建議總覽」區塊正確使用 ≥5 且 ≥40% 優先加強、≥5 且 ≥25% 建議複習 ✓
- attempts/wrong 累積與錯誤率計算正確 ✓

### 5. 登入模組隔離性
- `firebase-config.js`: apiKey/projectId/appId 均為真實 Firebase 值，非 placeholder ✓
- `auth.js` `isConfigValid()`: 檢查 `YOUR_` prefix 防止 placeholder 殘留 ✓
- SDK 動態載入 (`loadFirebaseSdk()`): 失敗時 catch → `AUTH_INITIALIZED = false` → 全站功能走 localStorage ✓
- `sync.js` Firestore 寫入: `db.collection('users').doc(_uid).set(data, { merge: true })` 其中 `data = { toeic: {...} }`，僅寫入 toeic 欄位，其他工具欄位 (JLPT/GEPT) 不受影響 ✓
- `auth.js` 僅操作 `#toeic-auth-area`，不碰其他 DOM ✓

### 6. 版本一致性
- `window.APP_VERSION = '20260703-4'` ✓
- 所有 `<script src="...?v=20260703-4">` 一致 ✓
- CSS `<link ...?v=20260703-4">` 一致 ✓

### 7. node --check
- 全部 13 個 js/ 檔案通過語法檢查 ✓

---

## 結論

全部 7 個檢查項目通過，1 個問題已修正。版本同步至 20260703-4。

**issues_found=1, issues_fixed=1, all_pass=true**
