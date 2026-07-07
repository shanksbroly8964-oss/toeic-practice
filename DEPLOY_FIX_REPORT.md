# TOEIC 練習網站 - 修正部署報告

**部署日期**：2026-07-08
**版本**：APP_VERSION = 20260703-6
**修正內容**：Part 3/4/7 分組題回饋不顯示（新增 `_groupViewIndex` 顯示指標）

---

## 1. 事前檢查（Sanity）

| 檢查項目 | 結果 |
|----------|------|
| `node --check` 全 12 支 JS 檔 | 全數通過 |
| `APP_VERSION` 版本號 | `20260703-6`（index.html:17） |
| 殘留舊版 `?v=` 字串 | 無（data-loader.js 動態取 APP_VERSION） |

---

## 2. Git

| 步驟 | 結果 |
|------|------|
| `git add -A` | 成功 |
| `git commit` | `d2a54ab` - "Fix: Part 3/4/7 grouped-question feedback not showing (add _groupViewIndex display pointer)" |
| `git push origin main` | 成功（11c340b → d2a54ab） |

---

## 3. Firebase Deploy

| 項目 | 結果 |
|------|------|
| 目標站台 | `hosting:toeic-goku`（限站台部署） |
| Project | `goku-46e66` |
| 上傳檔案 | 340 files → 95 new/updated |
| 部署狀態 | **成功** |

---

## 4. 驗證

### 4.1 Firebase Hosting

| 網址 | HTTP 狀態碼 | APP_VERSION |
|------|-------------|-------------|
| https://toeic-goku.web.app/index.html?cb=... | 200 | `20260703-6` ✓ |

### 4.2 GitHub Pages

| 網址 | HTTP 狀態碼 | APP_VERSION | Build 狀態 |
|------|-------------|-------------|-------------|
| https://shanksbroly8964-oss.github.io/toeic-practice/index.html?cb=... | 200 | `20260703-6` ✓ | `built` ✓ |

### 4.3 安全複核（既有站台未受影響）

| 站台 | HTTP 狀態碼 | 狀態 |
|------|-------------|------|
| https://jlpt-goku.web.app | 200 | 安全 ✓ |
| https://gept-goku.web.app | 200 | 安全 ✓ |
| https://goku-46e66.web.app | 200 | 安全 ✓ |

---

## 5. 總結

所有檢查通過，修正版已成功部署至兩個線上站台，版本一致為 `20260703-6`。
