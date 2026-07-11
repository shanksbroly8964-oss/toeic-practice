# PWA1 升級報告

## 版本
`APP_VERSION = '20260704-1'`（由 `20260703-6` 升版）

## 新增／修改檔案清單

### 新增
| 檔案 | 說明 |
|------|------|
| `manifest.json` | PWA Web App Manifest，含圖示、主題色、standalone 顯示模式 |
| `sw.js` | Service Worker：App 外殼 cache-first、第三方 API network-only、導覽離線回退 index.html |
| `js/pwa.js` | PWA 功能模組：底部分頁列、安裝提示（Android/iOS）、safe-area 處理 |
| `icons/icon-192.png` | 192×192 圖示（any purpose） |
| `icons/icon-512.png` | 512×512 圖示（any purpose） |
| `icons/icon-maskable-512.png` | 512×512 maskable 圖示（滿版背景、內容在 78% 安全區） |
| `icons/apple-touch-icon.png` | 180×180 Apple touch icon |
| `icons/favicon-64.png` | 64×64 favicon |
| `scripts/gen_icons.py` | Python 腳本，用 PIL 產生上述五個圖示 |

### 修改
| 檔案 | 變更內容 |
|------|---------|
| `index.html` | 補 `<meta name="theme-color">`、viewport-fit=cover、apple-mobile-web-app 標籤、manifest/apple-touch-icon/favicon link；SW 註冊腳本；所有 `?v=` 升版至 `20260704-1` |
| `js/auth.js` | 完全重寫：加入 `initAppGate()` 啟動閘門（先顯示 loading spinner → onAuthStateChanged 判斷登入/未登入 → 顯示 App 或登入頁）；`setPersistence(LOCAL)` 持久化；`signInWithPopup` + `signInWithRedirect` 後備；SDK 逾時 fallback + 錯誤畫面 |
| `js/app.js` | 新增 `ToeicAppGate` 閘門模組取代直接 `DOMContentLoaded` 啟動；`startApp()` 由 auth.js 在登入確認後呼叫 |
| `js/sync.js` | 移除舊 auto-init 的 `isLoggedIn()` 二次檢查；純靠 `ToeicAuth.onChange` 觸發同步 |
| `css/style.css` | 新增登入門 `.login-gate` / `.login-card` / `.login-btn` 樣式；底部分頁列 `#toeic-bottom-bar` / `.bottom-tab-btn`；安裝橫幅 `#pwa-install-banner`；safe-area 處理、overflow-x hidden、行動版底部 padding |

## PWA 作法摘要

### 圖示產生
- 使用 Python PIL，字型 `C:/Windows/Fonts/arialbd.ttf`
- 深藍 #1a3a5c 圓角底 + 白色「T」+ 淺藍「OEIC」字樣 + 底線點綴
- maskable 版為滿版背景（不留透明），內容縮至中央 78% 安全區

### Service Worker 快取策略
- **install**：precache App 外殼（HTML/CSS/JS/icons/manifest），`self.skipWaiting()`
- **activate**：刪除舊快取，`self.clients.claim()`
- **fetch**：
  - Firebase / Google API → **network-only**（不干擾登入與同步）
  - App 外殼（同源 html/css/js/icons/manifest）→ **cache-first**，miss 時 fetch 並 cache
  - data/*.json 題庫 → **cache-first**（可離線練習）
  - navigate 請求 miss → 回退 `./index.html`
- 只處理 GET 請求

### 底部分頁列
- 行動裝置（≤768px）顯示、桌機隱藏
- 五個分頁：練習、綜合、弱點、錯題本、設定
- 使用 `env(safe-area-inset-bottom)` 避開 iPhone 底部手勢區

### 安裝提示
- Android/Chrome：攔截 `beforeinstallprompt` → 顯示自訂「安裝 App」橫幅
- iOS Safari：`navigator.standalone === false` 時顯示「點下方分享鈕 → 加入主畫面」提示
- 已安裝或使用者關閉後記 `localStorage`，不再打擾

## 登入門流程與防閃爍作法

### 啟動流程
1. `app.js` 的 `ToeicAppGate.init()` 呼叫 `ToeicAuth.initAppGate()`
2. `initAppGate()` 先顯示「載入中…」spinner（防閃爍）
3. 載入 Firebase SDK → `initializeApp` → `setPersistence(LOCAL)`
4. **等待 `onAuthStateChanged` 第一次回呼**：
   - 有 user（含離線快取恢復）→ `showAppContent()` → `ToeicAppGate.startApp()` → `TOEIC.App.init()` → `goHome()`
   - 無 user → `showLoginPage()` 顯示置中登入卡片（Google 登入按鈕）
5. 登入成功後 `onAuthStateChanged` 再次觸發 → `showAppContent()`
6. 登出後回到登入頁

### 持久化
- `firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)` 確保 IndexedDB 持久儲存
- 重新整理或關閉重開後，`onAuthStateChanged` 自動回傳快取 user → 直接進 App（無需重新登入）
- 離線 + 曾登入 → 可進 App 使用（配合 SW 離線外殼）

### 錯誤處理
- SDK 載入失敗 → 顯示「服務達不到」+ 重試按鈕
- 登入逾時（15 秒）→ 錯誤畫面 + 重新載入按鈕
- popup 被封鎖 → 自動 fallback 到 `signInWithRedirect`
- 無 Firebase 設定 → 直接跳過登入進 App（相容模式）

## 版本號
- `window.APP_VERSION` = `'20260704-1'`
- 所有 JS/CSS/manifest `?v=` = `20260704-1`
- SW `CACHE` 字串 = `'toeic-shell-20260704-1'`
- 無殘留 `20260703-*`

## 部署與驗證重點
1. `firebase deploy --only hosting`（或完整 `firebase deploy`）
2. 清除瀏覽器 site data / 舊 SW（避免舊快取殘留）
3. Chrome DevTools → Application → Manifest 確認圖示、名稱、theme_color
4. Lighthouse PWA audit 確認 installable 通過
5. 實際測試：
   - 首次開啟看 spinner → 登入頁 → Google 登入
   - 登入後重整頁面 → 直接進 App（不閃爍）
   - 離線或斷網後重整 → 曾登入者進 App，未登入者看到需連線提示
   - Chrome → 網址列安裝圖示出現，點擊安裝
   - iOS Safari → 分享鈕 → 加入主畫面
   - 行動版 → 底部分頁列出現
