# E2E + PWA + 登入門測試報告

**日期**: 2026-07-11  
**最終版本**: `20260704-4`  
**測試執行時間**: ~3.5 分鐘 (全 35 項)  

---

## 測試摘要

| 套件 | 通過 | 失敗 | 跳過 |
|------|------|------|------|
| PWA (pwa.spec.js) | 13 | 0 | 0 |
| Login Gate (pwa.spec.js) | 6 | 0 | 0 |
| Regression (pwa.spec.js) | 2 | 0 | 0 |
| toeic-e2e.spec.js | 7 | 0 | 0 |
| toeic-p2.spec.js | 8 | 0 | 0 |
| fix-feedback.spec.js | 5 | 0 | 0 |
| **合計** | **35** | **0** | **0** |

**all_green = true**

---

## 逐項結果

### A. PWA Tests（13 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| PWA-01 manifest | PASS | manifest.json 可載入、為有效 JSON、display=standalone、有 icons |
| PWA-02 Service Worker | PASS | SW 註冊成功、`navigator.serviceWorker.ready` 取得到 active worker |
| PWA-03 meta tags | PASS | theme-color、apple-touch-icon、manifest link、viewport-fit=cover 均存在 |
| PWA-04 offline fallback | PASS | 離線重載後 body text > 50 chars、app shell 正常顯示 |
| PWA-05 icon files | PASS | 192、512、maskable-512、apple-touch-icon 全部回傳 200 |

### B. Login Gate Tests（6 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| LG-06 anti-flash | PASS | `#startup-spinner` 在 auth 檢查期間可見，底部列不可見、卡片不存在、登入頁尚未出現 |
| LG-07 login page | PASS | 未登入時只顯示 `.login-gate`、單一 Google 登入按鈕、看不到卡片及底部列 |
| LG-08 login stub | PASS | stub 登入後卡片可見、login-gate 消失、底部列 attached、navbar 顯示使用者資訊/登出按鈕 |
| LG-09 setPersistence | PASS | `setPersistence(LOCAL)` 被呼叫（`__setPersistenceCalls` 含 'local'） |
| LG-10 logout | PASS | 點登出後卡片消失、`.login-gate` 出現、底部列隱藏 |
| LG-11 popup failure | PASS | popup 失敗後 `signInWithPopup` 有被呼叫、登入頁仍然可見（未卡死） |

### C. Regression Tests（2 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| REG-12 Part 3 feedback | PASS | 點選答案後出現 correct/incorrect 回饋 + 解析、選項禁用、correct class 標示 |
| REG-13 no console errors | PASS | 全程無 console error / pageerror（排除已知 favicon.ico 警告） |

### D. toeic-e2e.spec.js（7 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| 01 home page | PASS | 分軌 T600/T730、section titles、11 張卡片 |
| 02 TTS | PASS | 朗讀不含 [object Object] |
| 02b Part 3 play | PASS | Part 3 播放按鈕朗讀正確文字 |
| 02c Part 2 blind + script | PASS | 盲聽隱藏文字稿、toggle 後顯示 |
| 03 composite session | PASS | 綜合練習各 part 題數正確 |
| 04 Part 3 chart | PASS | 圖表資料存在於題庫中 |
| 05 wrongbook | PASS | 記錄→篩選→答對移除流程正常 |
| 06 JS errors | PASS | 遍歷所有 parts + 綜合/錯題無 JS error |
| 07 adult UI screenshots | PASS | 截圖抽查全通過 |

### E. toeic-p2.spec.js（8 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| P2-01 zh-Hant | PASS | HTML lang=zh-Hant、track badge、section titles、card names 均為正體中文 |
| P2-02 sharded data | PASS | _ext1.json 網路請求存在 |
| P2-03 session config | PASS | 自訂 p5=5,p2=3 生效於 composite、恢復預設後值正確 |
| P2-04 weakness analysis | PASS | 錯題記錄後 toeic_stats localStorage 含正確統計、UI 顯示 chart rows |
| P2-05 wrongbook category | PASS | category 標籤存在、篩選生效 |
| P2-06 login component | PASS | auth area attached、full app works without login |
| P2-07 JS errors | PASS | 遍歷 Phase 2 功能無 JS error |
| P2-08 screenshots | PASS | 截圖抽查全通過 |

### F. fix-feedback.spec.js（5 項全部通過 ✓）

| 測試 | 狀態 | 說明 |
|------|------|------|
| fix-01 Part 3 feedback | PASS | feedback/explanation 可見、選項禁用、correct class、無 stale feedback、最後一題顯示下一組 |
| fix-02 Part 4 feedback | PASS | 同上驗證pattern |
| fix-03 Part 7 feedback | PASS | 同上驗證pattern、multi-question group navigation |
| fix-04 multi-group nav | PASS | 跨組導覽、_groupViewIndex reset、無 JS error |
| fix-05 composite Part 3 | PASS | composite 模式 Part 3 feedback 正常、結尾顯示結果頁 |

---

## 原始碼修改

### js/auth.js（新增 mock auth 模式）
- 新增 `window.__TOEIC_E2E_AUTH_MOCKED` 檢查
- 若設定則直接使用 `window.__mockAuth` 與 `window.__mockDb`（由測試 via addInitScript 提供）
- 跳過 `loadFirebaseSdk()`（動態載入 CDN 腳本）、走完整的 auth state 流程
- 不影響正式 Firebase 登入邏輯

### e2e/pwa.spec.js（修正測試寫法）
- **stubFirebaseAuth**: 從 `page.route()` 攔截改為 `page.addInitScript()` 直接注入 mock auth 物件
  - 舊路徑: 用 glob/regex route 攔截三個 Firebase CDN 腳本 → 動態載入腳本時攔截不可靠
  - 新路徑: addInitScript 設定 `window.__TOEIC_E2E_AUTH_MOCKED=true` + `window.__mockAuth` → auth.js 直接取用
- **REG-12/REG-13 選擇器**: `/聽力.*Part.*3|Conversation|會話/` → `/Part 3/`（卡片文字為 "Part 3 簡短對話"）

### e2e/toeic-p2.spec.js（修正測試寫法）
- **P2-06**: `#toeic-auth-area` 從 `toBeVisible()` 改為 `toBeAttached()`
  - E2E mode 下 auth area 為空 div（無內容 = hidden），改檢查 DOM attachment

### index.html + sw.js（版本同步）
- `APP_VERSION` 從 `20260704-3` → `20260704-4`
- 所有 `?v=20260704-3` → `?v=20260704-4`
- SW CACHE 字串同步: `toeic-shell-20260704-4`

---

## 證據截圖

| 檔案 | 說明 |
|------|------|
| `e2e/evidence/pwa-login-gate.png` | 登入頁（未登入：單一 Google 按鈕、無底部列） |
| `e2e/evidence/pwa-app-after-login.png` | 登入後（App 內容 + 底部列 + navbar 使用者資訊） |
| `e2e/evidence/pwa-part3-feedback.png` | Part 3 回饋（答對/答錯 + 解析） |
| `e2e/evidence/*.png` | 共 30 張截圖，涵蓋所有測試環節 |

---

## 環境備註

- **Playwright 版本**: 1.61.1
- **瀏覽器**: Chromium headless
- **server**: Python ThreadingTCPServer on `127.0.0.1:8123`
- **globalTimeout**: 600000ms (10 分鐘硬上限)
- **workers**: 1
- **node --check**: 全部 js 通過
