# DEPLOY PWA 上線報告

**部署日期**: 2026-07-11  
**版本**: 20260704-4  
**目標站台**: Firebase Hosting (`toeic-goku`) + GitHub Pages  
**Git commit**: `f090e9c`

---

## 1. Sanity 檢查

| 檢查項目 | 狀態 |
|----------|------|
| `node --check` 全 JS 語法 | ✅ 全部通過 (15 個 JS 檔) |
| `manifest.json` 合法 JSON | ✅ 含 name/start_url/icons/scope/display |
| Icons 檔存在 | ✅ icon-192, icon-512, icon-maskable-512, favicon-64, apple-touch-icon |
| `APP_VERSION` 一致性 | ✅ 全為 `20260704-4` |
| `?v=` 快取破壞字串 | ✅ 全部 `20260704-4`，無殘留 `20260703-*` |
| SW CACHE 名稱 | ✅ `toeic-shell-20260704-4` |

## 2. Git

| 項目 | 結果 |
|------|------|
| `git add -A` | ✅ |
| `git commit` | ✅ 52 files changed, 2001 insertions |
| `git push origin main` | ✅ `73f1e63..f090e9c` |

## 3. Firebase Deploy

| 項目 | 結果 |
|------|------|
| 指令 | `firebase deploy --only hosting:toeic-goku --project goku-46e66` |
| 部署狀態 | ✅ Deploy complete |
| 上傳檔案 | 404 files, 75 new |
| Hosting URL | https://toeic-goku.web.app |

## 4. 驗證結果

### Firebase Hosting (toeic-goku.web.app)

| 端點 | HTTP | 內容驗證 |
|------|------|----------|
| `/manifest.json` | 200 | ✅ 合法 JSON, name="多益 TOEIC 練習室", 3 icons |
| `/sw.js` | 200 | ✅ CACHE = `toeic-shell-20260704-4` |
| `/icons/icon-512.png` | 200 | ✅ |
| `/icons/favicon-64.png` | 200 | ✅ |
| `/icons/apple-touch-icon.png` | 200 | ✅ |
| `/index.html` | 200 | ✅ APP_VERSION = `20260704-4` |
| `/css/style.css` | 200 | ✅ |

### GitHub Pages (shanksbroly8964-oss.github.io/toeic-practice)

| 端點 | HTTP | 內容驗證 |
|------|------|----------|
| `/manifest.json` | 200 | ✅ |
| `/index.html` | 200 | ✅ APP_VERSION = `20260704-4` |
| Pages build | `built` | ✅ |

### 安全複核（既有站台未受影響）

| 站台 | HTTP |
|------|------|
| https://jlpt-goku.web.app/ | 200 ✅ |
| https://gept-goku.web.app/ | 200 ✅ |
| https://goku-46e66.web.app/ | 200 ✅ |

---

## 5. 總結

PWA 升級（manifest + service worker + icons + Google 登入門）已成功部署至 `toeic-goku` Firebase Hosting 及 GitHub Pages，兩個站台版本一致（`20260704-4`），既有站台（jlpt-goku, gept-goku, goku-46e66 主站）未受影響。
