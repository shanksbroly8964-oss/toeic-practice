# TOEIC 學習記錄雲端同步設計文件

## 資料結構

### Firestore 路徑
```
users/{uid}
  └── toeic: {
        wrong:     [...],     // 錯題陣列
        stats:     {...},     // 統計物件 { "part|category": { attempts, wrong } }
        history:   [...],     // 作答歷史陣列
        config:    {...},     // 綜合練習設定 { p1, p2, p3, p4, p5, p6, p7 }
        track:     "T600",    // 當前分軌選擇（T600 或 T730）
        updatedAt: <number>,  // 最後更新 timestamp（ms）
        _wrongTs:  <number>,  // 錯題時間戳
        _statsTs:  <number>,  // 統計時間戳
        _historyTs:<number>,  // 歷史時間戳
        _configTs: <number>,  // 設定時間戳
        _trackTs:  <number>   // 分軌時間戳
      }
```

### 對應 localStorage keys

| localStorage Key         | Firestore 欄位 | 說明             |
|--------------------------|----------------|------------------|
| `toeic_wrong`            | wrong          | 錯題記錄         |
| `toeic_stats`            | stats          | 作答統計（by part/category） |
| `toeic_history`          | history        | 每次練習記錄     |
| `toeic_session_config`   | config         | 綜合練習設定題數 |
| `toeic_track`            | track          | 目標分數軌道     |

各 key 另有 `_ts` 後綴版本儲存最後修改時間。

## 合併策略

登入時執行 **雙向合併**（remote → merge → 寫回 local + remote）：

### wrong（錯題）
- 以 `questionId` 為唯一鍵做聯集
- 同 questionId 取 `timestamp` 較新者保留
- 合併後依時間倒序排列

### stats（統計）
- 以 `"part|category"` 為鍵（如 `"1|人物動作"`）
- 聯集兩方所有鍵
- 逐鍵取 `attempts` 與 `wrong` 的較大值（避免遺失）

### history（練習記錄）
- 串接兩方陣列後去重
- 去重依據：`date + mode + track + total + correct` 組合簽名
- 依日期升序排列，最多保留 200 筆

### config（設定）
- 比較本地與遠端的 `_configTs`（timestamp）
- 取較新的一方覆蓋另一方

### track（分軌）
- 比較本地與遠端的 `_trackTs`
- 取較新的一方覆蓋另一方

## 同步觸發點

登入狀態下，以下操作觸發 debounce（3 秒）上傳：

| 動作                     | 觸發位置                          |
|--------------------------|-----------------------------------|
| 答對/答錯（更新 stats）  | TOEIC.Analytics.recordAttempt     |
| 加入/移除錯題            | TOEIC.Storage.addWrongItem / removeWrongItem |
| 完成練習（寫入 history） | TOEIC.Analytics.recordSession     |
| 切換分軌                 | TOEIC.Storage.setTrack            |
| 儲存練習設定             | ui-renderer.js (onConfigSaved)    |

所有寫入均透過 `monkey-patch` 方式注入同步呼叫，不修改 quiz-engine 既有邏輯。

## 容錯設計

- Firebase SDK 載入失敗 → 全站功能照常使用 localStorage，auth 區顯示「載入中...」
- Firestore 讀寫失敗 → console.error 記錄，不拋出例外
- 未登入 → 僅本地儲存，不嘗試同步
- 登出 → 清除 uid、停止同步、保留 localStorage 資料
