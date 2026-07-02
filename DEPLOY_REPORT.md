# TOEIC L&R Practice - Deployment Report
## APP_VERSION: 20260702-5 | Date: 2026-07-02

---

## 1. GitHub Pages Deployment

| Step | Result |
|------|--------|
| Branch renamed to `main` | OK |
| Repo created (`shanksbroly8964-oss/toeic-practice`) | OK |
| Push to GitHub | OK (HEAD -> main) |
| Pages enabled (main, root `/`) | OK |
| Pages URL | https://shanksbroly8964-oss.github.io/toeic-practice/ |
| Pages build status | `building` |
| curl verification (HTTP) | 404 (build in progress; first-time Pages deployment can take a few minutes) |

**Note:** GitHub Pages is configured and building. The 404 is expected during initial build. The site will resolve to 200 once the build completes (typically 1-5 minutes).

---

## 2. Firebase Hosting Deployment

| Step | Result |
|------|--------|
| firebase.json `site` verified as `toeic-goku` | OK |
| Site created (`toeic-goku`) | OK |
| Files uploaded | 102 files |
| Deploy completed | OK (`--only hosting:toeic-goku`) |
| Firebase URL | https://toeic-goku.web.app |
| curl verification (HTTP) | **200** |
| APP_VERSION on live site | **`20260702-5`** (verified via grep) |
| Data file (reading_part5_T600.json) | **200** |

---

## 3. Existing Sites Safety Check

| Site | HTTP Status | Status |
|------|-------------|--------|
| https://jlpt-goku.web.app | 200 | SAFE |
| https://gept-goku.web.app | 200 | SAFE |
| https://goku-46e66.web.app | 200 | SAFE |

All three existing sites remain intact and accessible. No modification or interference occurred.

---

## 4. Issues & Notes

- **GitHub Pages first-time build**: The Pages deployment returns 404 while the initial build is in progress. This is normal behavior — the site will be available shortly at https://shanksbroly8964-oss.github.io/toeic-practice/.
- **Firebase deployment used explicit site target**: `--only hosting:toeic-goku` ensured no other hosting sites were affected.
- **Branch renamed**: `master` -> `main` to match GitHub Pages convention.

---

## Summary

| Target | URL | HTTP | APP_VERSION |
|--------|-----|------|-------------|
| Firebase | https://toeic-goku.web.app | 200 | 20260702-5 |
| GitHub Pages | https://shanksbroly8964-oss.github.io/toeic-practice/ | building | - |

**Deployment successful.** Firebase is live and serving the correct version. GitHub Pages is building and will be available shortly.
